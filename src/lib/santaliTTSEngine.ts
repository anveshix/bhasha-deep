/**
 * Dedicated Santali Phonetic Text-to-Speech (TTS) Engine
 * 
 * Specifically tuned for the phonetic nuances of Santali (both Devanagari and Ol Chiki scripts).
 * Handles glottal stops ( checked consonants ah, ek, et, ep ), unreleased stops,
 * nasalization, rhythmic prosody, Ol Chiki transliteration, and optimized acoustic synthesis.
 */

// Mapping table for Ol Chiki script -> Devanagari Phonetic equivalents
const OL_CHIKI_TO_DEVANAGARI_MAP: Record<string, string> = {
  'ᱚ': 'ओ', 'ᱛ': 'त्', 'ᱜ': 'ग्', 'ᱝ': 'ङ', 'ᱞ': 'ल',
  'ᱟ': 'आ', 'ᱠ': 'क्', 'ᱡ': 'ज्', 'ᱢ': 'म्', 'ᱣ': 'व्',
  'ᱤ': 'इ', 'ᱥ': 'स्', 'ᱦ': 'ह', 'ᱧ': 'ञ्', 'ᱨ': 'र्',
  'ᱩ': 'उ', 'ᱪ': 'च्', 'ᱫ': 'द्', 'ᱬ': 'ण्', 'ᱭ': 'य्',
  'ᱮ': 'ए', 'ᱯ': 'प्', 'ᱰ': 'ड्', 'ᱱ': 'न्', 'ᱲ': 'ड़',
  'ᱳ': 'ओ', 'ᱴ': 'ट्', 'ᱵ': 'ब्', 'ᱶ': 'वाँ', 'ᱷ': 'ह',
  'ᱽ': 'ः', 'ᱼ': ' ', '᱾': '।', 'ᱺ': 'ँ', 'ᱸ': 'ँ'
};

/**
 * Converts Ol Chiki script text into phonetic Devanagari for speech synthesis.
 */
export function convertOlChikiToPhoneticDevanagari(text: string): string {
  if (!text) return '';
  let result = '';
  for (const char of text) {
    if (OL_CHIKI_TO_DEVANAGARI_MAP[char]) {
      result += OL_CHIKI_TO_DEVANAGARI_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Applies Santali phonetic transformations to Devanagari text to optimize 
 * pronunciation for standard SpeechSynthesis engines.
 */
export function prepareSantaliPhoneticsForSpeech(text: string): string {
  if (!text) return '';

  // 1. If text is Ol Chiki, convert to Devanagari first
  let phonetic = convertOlChikiToPhoneticDevanagari(text);

  // 2. Remove Markdown syntax (bold, italics, headers) so TTS doesn't speak asterisks
  phonetic = phonetic.replace(/[*#_~`\[\]()]/g, ' ');

  // 3. Refine Santali Glottal Stop ('ः' / Visarga)
  // In Santali (e.g. बोहोः, इञाः, ओड़ाः, दाः), 'ः' represents a checked vowel/glottal stop.
  // Standard Hindi TTS often mispronounces 'ः' as a harsh aspirate "hha".
  // We transform 'ः' followed by space or punctuation into a gentle glottal pause.
  phonetic = phonetic.replace(/([अआइईउऊएओऑ])ः/g, '$1\u0902.'); // Soft nasalized stop inflection
  phonetic = phonetic.replace(/ः/g, '. ');

  // 4. Refine Palatal Nasal 'ञ' (ny) -> 'न्य' for clearer articulation in Hindi TTS
  // e.g. "इञ" -> "इन्य", "ञाम" -> "न्याम", "ञापाम" -> "न्यापाम"
  phonetic = phonetic.replace(/ञा/g, 'न्या');
  phonetic = phonetic.replace(/ञि/g, 'न्यि');
  phonetic = phonetic.replace(/ञु/g, 'न्यु');
  phonetic = phonetic.replace(/ञे/g, 'न्ये');
  phonetic = phonetic.replace(/ञो/g, 'न्यो');
  phonetic = phonetic.replace(/ञ([^\u093E-\u094C]|$)/g, 'न्य$1');

  // 5. Refine Velar Nasal 'ङ' (ng) -> 'न्ग'
  phonetic = phonetic.replace(/ङ/g, 'न्ग');

  // 6. Santali Postposition prosody breaks for natural rhythmic cadence
  // Add slight prosodic micro-pauses after key Santali postpositions (दो, गे, रे, खोच, ते, आ)
  phonetic = phonetic.replace(/\b(दो|गे|रे|खोच|ते|काना|ताहेकाना|बो)\b/g, '$1,');

  // 7. Prevent Schwa addition at word-final unreleased stops (त्, क्, च्, प्)
  phonetic = phonetic.replace(/त्\b/g, 'त् ');
  phonetic = phonetic.replace(/क्\b/g, 'क् ');

  // Clean up extra spaces
  return phonetic.replace(/\s+/g, ' ').trim();
}

export interface SantaliSpeechOptions {
  rate?: number;     // Speech rate (default 0.82 for clear Santali articulation)
  pitch?: number;    // Voice pitch (default 1.10 for warm, natural tone)
  volume?: number;   // Volume level (0.0 to 1.0)
  lang?: string;     // Fallback language tag ('hi-IN')
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Dedicated Santali Speech Synthesis Manager
 */
class SantaliTTSService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentSpeakingId: string | null = null;

  /**
   * Speaks the given text using the Santali Phonetic Engine
   */
  public speak(
    text: string, 
    id: string, 
    options: SantaliSpeechOptions = {},
    onStateChange?: (speakingId: string | null) => void
  ): boolean {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis API not supported in this browser environment.');
      return false;
    }

    // Toggle stop if clicking same audio target
    if (this.currentSpeakingId === id) {
      this.stop();
      if (onStateChange) onStateChange(null);
      return false;
    }

    // Stop any ongoing speech
    this.stop();

    // Prepare phonetically refined Santali text
    const processedText = prepareSantaliPhoneticsForSpeech(text);
    if (!processedText) return false;

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = options.lang || 'hi-IN';

    // Santali Acoustic Parameters:
    // Calibrated rate (0.82) allows listeners to hear checked vowels and glottal breaks clearly.
    utterance.rate = options.rate ?? 0.82;
    utterance.pitch = options.pitch ?? 1.10;
    utterance.volume = options.volume ?? 1.0;

    // Pick best matching Devanagari / Indian Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const optimalVoice = voices.find(v => 
      (v.lang.includes('hi') || v.lang.includes('IN')) && 
      (v.name.toLowerCase().includes('google') || 
       v.name.toLowerCase().includes('natural') || 
       v.name.toLowerCase().includes('swara') ||
       v.name.toLowerCase().includes('lekha') ||
       v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));

    if (optimalVoice) {
      utterance.voice = optimalVoice;
    }

    utterance.onstart = () => {
      this.currentSpeakingId = id;
      if (onStateChange) onStateChange(id);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentSpeakingId = null;
      if (onStateChange) onStateChange(null);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (err) => {
      this.currentSpeakingId = null;
      if (onStateChange) onStateChange(null);
      if (options.onError) options.onError(err);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  /**
   * Stops any currently playing speech.
   */
  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentSpeakingId = null;
    this.currentUtterance = null;
  }

  /**
   * Returns current active speaking ID
   */
  public getSpeakingId(): string | null {
    return this.currentSpeakingId;
  }
}

export const santaliTTS = new SantaliTTSService();
