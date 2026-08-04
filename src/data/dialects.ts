/**
 * Santali Dialectal Variations Dataset
 * 
 * Maps regional variations to standard (Pargana) Santali and Hindi.
 */

export interface DialectVariation {
  regional_term: string;
  regional_phonetic: string;
  dialect: string;
  standard_santali: string;
  hindi_meaning: string;
  notes: string;
}

export const dialectVariations: DialectVariation[] = [
  {
    regional_term: "Horen",
    regional_phonetic: "horen",
    dialect: "Northern / Rural",
    standard_santali: "Soren",
    hindi_meaning: "सोरन (उपनाम)",
    notes: "Initial 'S' often shifts to 'H' in some northern rural speech patterns."
  },
  {
    regional_term: "Daka",
    regional_phonetic: "daka",
    dialect: "Standard",
    standard_santali: "Daka",
    hindi_meaning: "चावल / खाना",
    notes: "Basic term for cooked rice/meal."
  },
  {
    regional_term: "Mandi",
    regional_phonetic: "mandi",
    dialect: "Southern",
    standard_santali: "Daka",
    hindi_meaning: "चावल / खाना",
    notes: "Often used interchangeably with Daka in southern regions."
  },
  {
    regional_term: "Inha",
    regional_phonetic: "inha",
    dialect: "Western",
    standard_santali: "In",
    hindi_meaning: "मैं",
    notes: "Elongated suffix in western dialects for the first-person pronoun."
  },
  {
    regional_term: "Henda",
    regional_phonetic: "henda",
    dialect: "Rural / Informative",
    standard_santali: "Senda",
    hindi_meaning: "ढूँढना / खोजना",
    notes: "Phonetic shift S -> H."
  },
  {
    regional_term: "Kayo",
    regional_phonetic: "kayo",
    dialect: "Mayurbhanj influenced",
    standard_santali: "Ayo",
    hindi_meaning: "माँ",
    notes: "Variation in 'Mother' with initial hard sound."
  }
];

export const PHONETIC_DIALECT_RULES = [
  { pattern: "s -> h", rule: "Initial 'S' may sound like 'H' in Northern Santali (e.g. Santal -> Hantal)." },
  { pattern: "n -> l", rule: "Occasional N/L swaps in fast speech (e.g. Nin -> Lin)." },
  { pattern: "vowel elongation", rule: "Rural speakers often elongate terminal vowels in verbs." },
  { pattern: "glottal reduction", rule: "Modern/urban speakers may reduce the sharp glottal stop (') to a softer release." }
];
