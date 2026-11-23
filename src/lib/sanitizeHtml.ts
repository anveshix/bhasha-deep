/**
 * HTML sanitisation for AI/markdown-derived content.
 *
 * The app renders model output as markdown and also prints it through
 * `document.write` into a same-origin window. Everything that reaches that
 * window must be reduced to a strict allowlist first: a denylist of
 * `on*` / `javascript:` strings is trivially bypassable (entity encoding,
 * tabs/newlines, `data:image/svg+xml`, `srcset`, `xlink:href`, ...).
 *
 * Runs in the browser (uses DOMParser). `escapeHtml` is usable on the server.
 */

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr', 'div', 'span',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'a', 'img', 'figure', 'figcaption',
]);

/** Tags removed together with their entire subtree. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet',
  'link', 'meta', 'base', 'form', 'input', 'button', 'select', 'option',
  'textarea', 'svg', 'math', 'template', 'noscript', 'audio', 'video', 'source',
  'track', 'canvas', 'portal',
]);

const GLOBAL_ATTRS = new Set(['class', 'dir', 'lang', 'title']);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href']),
  img: new Set(['src', 'alt', 'width', 'height']),
  th: new Set(['colspan', 'rowspan', 'scope']),
  td: new Set(['colspan', 'rowspan']),
  ol: new Set(['start', 'reversed', 'type']),
  li: new Set(['value']),
  code: new Set(['class']),
  pre: new Set(['class']),
};

const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_IMAGE_SCHEMES = new Set(['http:', 'https:', 'data:']);

/**
 * Browsers silently strip control characters when parsing a URL, so
 * `java\tscript:alert(1)` executes. Normalise before inspecting the scheme.
 */
function normalizedScheme(url: string): string | null {
  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\u0000-\u0020\u007F-\u009F\u200B-\u200F\u2028\u2029]/g, '').toLowerCase();
  const match = /^([a-z][a-z0-9+.-]*):/.exec(cleaned);
  return match ? `${match[1]}:` : null;
}

function isSafeUrl(url: string, isImage: boolean): boolean {
  const value = url.trim();
  if (!value) return false;

  // Root-relative, path-relative and fragment links carry no scheme.
  if (/^[#/?]/.test(value) || /^\.{1,2}\//.test(value)) return true;

  const scheme = normalizedScheme(value);
  if (scheme === null) return true; // e.g. "example.com/x" — resolves relative
  if (scheme === 'data:') {
    // Only raster/base64 image payloads; never data:text/html or svg+xml.
    return isImage && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(value);
  }
  return isImage ? SAFE_IMAGE_SCHEMES.has(scheme) : SAFE_URL_SCHEMES.has(scheme);
}

function scrubElement(el: Element): void {
  if (DROP_WITH_CONTENT.has(el.tagName.toLowerCase())) {
    el.remove();
    return;
  }

  // Remove unsupported elements but keep their text/inline children.
  if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
    }
    el.remove();
    return;
  }

  const tag = el.tagName.toLowerCase();
  const allowed = ALLOWED_ATTRS[tag] || new Set<string>();

  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    const keepUnlessSafe = GLOBAL_ATTRS.has(name) || allowed.has(name);

    if (!keepUnlessSafe || name.startsWith('on') || name === 'style' || name === 'srcdoc') {
      el.removeAttribute(attr.name);
      continue;
    }

    if (name === 'href' || name === 'src') {
      if (!isSafeUrl(attr.value, name === 'src')) {
        el.removeAttribute(attr.name);
      }
    }
  }

  // Links opened from a generated document must not be able to reach back.
  if (tag === 'a' && el.getAttribute('href')) {
    el.setAttribute('rel', 'noopener noreferrer nofollow');
  }
  if (tag === 'a' && /^\s*(https?:)?\/\//i.test(el.getAttribute('href') || '')) {
    el.setAttribute('target', '_blank');
  }
}

/**
 * Sanitises an HTML string down to the allowlist above.
 * Parsing uses an inert document, so nothing executes or is fetched meanwhile.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const body = parsed.body;

  // Depth-first, deepest-first so unwrapping parents does not skip children.
  const walk = (node: Node): void => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
        scrubElement(child as Element);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
      }
    });
  };
  walk(body);

  return body.innerHTML;
}

/** Escapes text for safe interpolation into an HTML template string. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
