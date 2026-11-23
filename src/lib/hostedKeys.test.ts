import { describe, expect, it, beforeEach } from 'vitest';
import { BYO_KEY_STORAGE, getByoGeminiKey, isPlausibleGeminiKey, purgeLegacyLocalKey, setByoGeminiKey } from './hostedKeys';

describe('hosted key storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('round-trips a key through sessionStorage', () => {
    setByoGeminiKey('  AIza' + 'c'.repeat(35) + '  ');
    expect(getByoGeminiKey()).toBe('AIza' + 'c'.repeat(35));
  });

  it('clears the key when set to empty', () => {
    setByoGeminiKey('AIza' + 'c'.repeat(35));
    setByoGeminiKey('   ');
    expect(getByoGeminiKey()).toBe('');
  });

  it('never persists the key in localStorage', () => {
    setByoGeminiKey('AIza' + 'c'.repeat(35));
    expect(localStorage.getItem(BYO_KEY_STORAGE)).toBeNull();
    expect(localStorage.getItem('custom_gemini_key')).toBeNull();
  });

  it('purges keys left behind by older builds', () => {
    localStorage.setItem('custom_gemini_key', 'AIza' + 'd'.repeat(35));
    purgeLegacyLocalKey();
    expect(localStorage.getItem('custom_gemini_key')).toBeNull();
  });

  it('validates key shape', () => {
    expect(isPlausibleGeminiKey('AIza' + 'e'.repeat(35))).toBe(true);
    expect(isPlausibleGeminiKey('not-a-key')).toBe(false);
    expect(isPlausibleGeminiKey('AIza short')).toBe(false);
  });
});
