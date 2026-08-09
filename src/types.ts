export interface DictionaryEntry {
  entry_id: string;
  santali_deva: string;
  roman_student: string;
  ipa?: string;
  pronunciation_notes?: string;
  hindi: string[];
  english: string[];
  pos: string;
  definitions: {
    santali: string;
    hindi: string;
    english: string;
  };
  synonyms?: string[];
  confidence?: number;
  examples: {
    santali_deva: string;
    hindi: string;
    roman_student: string;
  }[];
  audioUrl?: string;
}
