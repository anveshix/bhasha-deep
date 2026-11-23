/**
 * User-supplied ("bring your own") Gemini key handling.
 *
 * SECURITY: the key lives in sessionStorage, never localStorage.
 *  - localStorage is shared across every tab of the origin and survives
 *    indefinitely, so XSS / a malicious extension / a shared device leaves the
 *    key readable forever.
 *  - sessionStorage is cleared when the tab closes and is not visible to other
 *    tabs, which bounds the exposure window.
 *
 * The key is also never sent to our server: it is used only with the official
 * Google Generative Language API directly from the browser, which is what the
 * user consented to by pasting their own credential.
 */

export const BYO_KEY_STORAGE = 'gemini_api_key_byo';

const KEY_PATTERN = /^AIza[0-9A-Za-z_-]{35}$/;

export function isPlausibleGeminiKey(value: string): boolean {
  return KEY_PATTERN.test(value.trim());
}

export function getByoGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return (window.sessionStorage.getItem(BYO_KEY_STORAGE) || '').trim();
  } catch {
    // Storage can throw in private mode / when disabled by policy.
    return '';
  }
}

export function setByoGeminiKey(value: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = value.trim();
  try {
    if (!trimmed) {
      window.sessionStorage.removeItem(BYO_KEY_STORAGE);
      return;
    }
    window.sessionStorage.setItem(BYO_KEY_STORAGE, trimmed);
  } catch {
    // Ignore: the in-memory React state still carries the key for this page.
  }
}

/**
 * Removes any key written by older builds into localStorage, so upgrading
 * users do not keep a long-lived copy of their credential on disk.
 */
export function purgeLegacyLocalKey(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('custom_gemini_key');
  } catch {
    /* ignore */
  }
}
