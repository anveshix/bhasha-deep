import { describe, expect, it } from 'vitest';
import { sanitizeHtml, escapeHtml } from './sanitizeHtml';

const dangerous = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<a href="javascript:alert(1)">x</a>',
  '<a href="java\tscript:alert(1)">x</a>',
  '<a href="JaVaScRiPt:alert(1)">x</a>',
  '<a href="&#106;avascript:alert(1)">x</a>',
  '<iframe src="https://evil.example"></iframe>',
  '<object data="evil.swf"></object>',
  '<embed src="evil.swf">',
  '<form action="https://evil.example"><input name="a"></form>',
  '<svg><script>alert(1)</script></svg>',
  '<div style="background:url(javascript:alert(1))">x</div>',
  '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
  '<a href="data:text/html,<script>alert(1)</script>">x</a>',
  '<p onclick="alert(1)">x</p>',
  '<base href="https://evil.example">',
  '<meta http-equiv="refresh" content="0;url=https://evil.example">',
];

describe('sanitizeHtml', () => {
  it.each(dangerous)('strips executable content: %s', (payload) => {
    const output = sanitizeHtml(payload);
    expect(output.toLowerCase()).not.toContain('<script');
    expect(output.toLowerCase()).not.toContain('javascript:');
    expect(output.toLowerCase()).not.toContain('onerror');
    expect(output.toLowerCase()).not.toContain('onclick');
    expect(output.toLowerCase()).not.toContain('<iframe');
    expect(output.toLowerCase()).not.toContain('<object');
    expect(output.toLowerCase()).not.toContain('<embed');
    expect(output.toLowerCase()).not.toContain('data:text/html');
    expect(output.toLowerCase()).not.toContain('data:image/svg+xml');
    expect(output.toLowerCase()).not.toContain('<base');
    expect(output.toLowerCase()).not.toContain('<meta');
  });

  it('keeps ordinary formatting used by the print stylesheet', () => {
    const output = sanitizeHtml('<h1>T</h1><p><strong>a</strong><em>b</em></p><ul><li>c</li></ul>');
    expect(output).toContain('<h1>T</h1>');
    expect(output).toContain('<strong>a</strong>');
    expect(output).toContain('<li>c</li>');
  });

  it('allows safe links but hardens them', () => {
    const output = sanitizeHtml('<a href="https://example.com">x</a>');
    expect(output).toContain('href="https://example.com"');
    expect(output).toContain('rel="noopener noreferrer nofollow"');
  });

  it('allows base64 raster images only', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    expect(sanitizeHtml(`<img src="${png}">`)).toContain('src=');
    expect(sanitizeHtml('<img src="data:text/html;base64,PHN2Zz4=">')).not.toContain('src=');
  });

  it('removes unsupported tags but keeps their text', () => {
    const output = sanitizeHtml('<marquee>keep me</marquee>');
    expect(output).toContain('keep me');
    expect(output).not.toContain('<marquee');
  });

  it('drops comments', () => {
    expect(sanitizeHtml('<p>a</p><!--[if IE]><script>x</script><![endif]-->')).not.toContain('<!--');
  });
});

describe('escapeHtml', () => {
  it('neutralises markup', () => {
    expect(escapeHtml('<img onerror=x>')).toBe('&lt;img onerror=x&gt;');
    expect(escapeHtml('"quoted" & \'single\'')).toContain('&quot;');
  });
});
