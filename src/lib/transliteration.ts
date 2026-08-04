/**
 * Devanagari -> Romanized Santali transliteration.
 *
 * Shared by the UI (student-facing romanization hints) and the phonetic
 * validator, which needs a Latin-script form of the input before it can
 * apply its Romanized-Santali heuristics.
 */
const DEVA_TO_ROMAN_MAP: { [key: string]: string } = {
  'इञ्': "in'", 'इञ': "in'", 'अ': 'a', 'आ': 'a', 'इ': 'i', 'उ': 'u', 'ए': 'e', 'ओ': 'o',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng', 'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': "n'",
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w', 'श': 'sh', 'स': 's', 'ह': 'h',
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ः': 'h', '्': '', 'ऽ': "'", '़': ''
};

export const transliterateDevaToRoman = (text: string): string => {
  if (!text) return '';
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text.substring(i, i + 3) === 'इञ्') { result += "in'"; i += 3; continue; }
    if (text.substring(i, i + 2) === 'इञ') { result += "in'"; i += 2; continue; }
    const char = text[i];
    result += DEVA_TO_ROMAN_MAP[char] !== undefined ? DEVA_TO_ROMAN_MAP[char] : char;
    i++;
  }
  return result;
};

/** True if the string contains any Devanagari (U+0900–U+097F) code points. */
export const containsDevanagari = (text: string): boolean => /[ऀ-ॿ]/.test(text);
