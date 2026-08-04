/**
 * Santali Phonetic Validation Utility
 * 
 * Specifically designed to flag unusual patterns in Romanized Santali.
 */

import { dialectVariations } from '../data/dialects';
import { transliterateDevaToRoman, containsDevanagari } from './transliteration';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  issues: string[];
  suggestions: { original: string, standard: string, reason: string }[];
}

const FORBIDDEN_CHARS = /[qxzfv]/i;
const UNUSUAL_VOWEL_CLUSTERS = /[aeiou]{3,}/i; // 3 or more vowels in a row is rare in standard Santali

/**
 * Phonetic Normalization for Dialects
 * Reduces regional variations to a common checkable form.
 */
export function normalizeDialect(text: string): string {
  let normalized = text.toLowerCase();
  
  // Rule: Final 'inha' -> 'in' (Western dialect elongation)
  normalized = normalized.replace(/inha\b/g, 'in');
  
  // Rule: Initial 'h' followed by vowel -> occasionally check as 's' 
  // (Northern S->H shift: hantalia -> santalia)
  // We don't perform destructive replacement here but it's a known shift
  
  return normalized;
}

export function validatePhoneticSantali(text: string): ValidationResult {
  const issues: string[] = [];
  const suggestions: { original: string, standard: string, reason: string }[] = [];
  let score = 100;

  if (!text || text.trim().length < 2) {
    return { isValid: true, score: 100, issues: [], suggestions: [] };
  }

  // The heuristics below are written for Romanized Santali. The app's
  // standard input script is Devanagari, so transliterate first --
  // otherwise every check below is a silent no-op against Devanagari text.
  const romanizedText = containsDevanagari(text) ? transliterateDevaToRoman(text) : text;
  const words = romanizedText.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    // 1. Check for characters not used in standard Santali Romanization
    if (FORBIDDEN_CHARS.test(word)) {
      issues.push(`Unusual characters found in "${word}" (q, x, z, f, v). Santali phonetics rarely use these.`);
      score -= 20;
    }

    // 2. Check for unusual vowel clusters
    if (UNUSUAL_VOWEL_CLUSTERS.test(word)) {
      issues.push(`Unusual vowel combination found: "${word.match(UNUSUAL_VOWEL_CLUSTERS)?.[0]}" in "${word}"`);
      score -= 15;
    }

    // 3. Check for the Santali glottal stop or special characters
    // While not "invalid", a lack of any glottal stops or markers in long sentences might be a flag
    // for simplistic phonetic spelling where the user might mean 'da'' instead of 'da'.
    if (word.length > 5 && !word.includes("'")) {
       // Just a hint, not a strict error
    }
    
    // 4. Repeated consonants (more than 2)
    if (/([^aeiou])\1\1/i.test(word)) {
      issues.push(`Likely misspelling: repeated consonants in "${word}"`);
      score -= 25;
    }

    // 5. Check against dialect variations
    const exactDialectMatch = dialectVariations.find(v => v.regional_phonetic.toLowerCase() === word);
    if (exactDialectMatch && exactDialectMatch.standard_santali && exactDialectMatch.standard_santali.toLowerCase() !== word) {
      suggestions.push({
        original: word,
        standard: exactDialectMatch.standard_santali,
        reason: exactDialectMatch.notes
      });
    } else {
      // Fuzzy checks for S -> H (like 'hantal' -> 'santal', 'henda' -> 'senda')
      if (word.startsWith('h')) {
        const potentialSWord = 's' + word.slice(1);
        const matchS = dialectVariations.find(v => v.standard_santali.toLowerCase() === potentialSWord);
        if (matchS && matchS.regional_phonetic.toLowerCase() === word) {
           suggestions.push({
             original: word,
             standard: matchS.standard_santali,
             reason: matchS.notes
           });
        }
      }
    }
  }

  // Cap score
  score = Math.max(0, score);

  return {
    isValid: score > 70 && issues.length === 0,
    score,
    issues: [...new Set(issues)], // Deduplicate
    suggestions
  };
}
