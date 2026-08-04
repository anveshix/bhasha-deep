import { initialDictionary } from './dictionary';

export interface ConversationContextItem {
  hindi: string;
  santaliDeva: string;
  category: string;
  logic: string;
}

export interface GrammarParadigmItem {
  hindi: string;
  santaliDeva: string;
  category: string;
  logic: string;
}

export interface SentenceMatrixItem {
  hindi: string;
  santaliRoman: string;
  verbForm: string;
  grammarNote: string;
}

export interface DatabaseMatch {
  hit: boolean;
  exactMatch: boolean;
  score: number; // 0 to 100
  source: string;
  hindi: string;
  santaliDeva: string;
  santaliRoman?: string;
  category?: string;
  logicOrGrammarNote?: string;
  formattedOutput?: string;
}

// NCERT Bhasha Sangam Standard Conversation Pattern
export const NCERT_BHASHA_SANGAM_CONVERSATIONS: ConversationContextItem[] = [
  { hindi: "आपका नाम क्या है?", santaliDeva: "आमाक् ञतुमु चेत?", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मेरा नाम मुस्कान है।", santaliDeva: "ईञाक् ञतुमु दो मुसकान।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "आप किस कक्षा में पढ़ते हैं?", santaliDeva: "आम दो ऑका चानच रेम ऑलॉक् काना?", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मैं कक्षा आठ में पढ़ता हूँ।", santaliDeva: "ईज दो ईराल चानचरीज ऑलॉक् काना।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "आपके माता-पिता का नाम क्या है?", santaliDeva: "आम आयो-बाबावाक जुतुम चेत?", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मेरी माँ का नाम कुसुम और पिता का नाम प्रकाश है।", santaliDeva: "इञ आयोवाः जुतुम दो कुसुम आर बाबावाक जुतुम दो प्रकाश।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "आप कहाँ रहते हैं?", santaliDeva: "आम दो ओकारेम ताहनँा ?", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मैं राँची में रहता हूँ।", santaliDeva: "ईञ दो राँची रेञ ताहनँा।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "माँ और पिताजी दोनों खाना बनाते हैं।", santaliDeva: "आ्ो आर बाबा बाना हड़गेककन ईकसन बासाङ आ।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "आपको स्कूल कौन पहुँचाता है?", santaliDeva: "आमदो ऑकॉ् कवरदाग़ाड़ ए सेटेर ओटोकामा?", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मैं लेखक बनना चाहता हूँ।", santaliDeva: "इञ दो ओनोकल्ा ़ बेनावोक् सानाञ काना।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मैं अपने घरेलू व्यवसाय में सहयोग करूँगा।", santaliDeva: "इञ दो आले्ाक् िारञज रेनाक् काम़ी कोरेगेञ गोड़ोवाकोवा।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मैं राजनीति में जाना चाहता हूँ।", santaliDeva: "इञ दो राज आरी रे सेलेदोक सानाञ काना।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मेरा सपना एवरेस्ट पर जाने का है।", santaliDeva: "ईञाक़् कुकम ुदॉ एवरेसट बरुू चटते दजेोक-आञ मनेाक् कत ञा।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "मुझे बाहर खेलना पसंद है, जैसे कबड्डी।", santaliDeva: "ईञ दो बाहरे खेल गेञ कुसीयाक् आ जेलेका कबड्डी।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "हम सब वहाँ घूमने जाते हैं।", santaliDeva: "आले जोतोहड़ ओडें दाँड़ान ले चालाक्-आ।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "उस जंगल में एक झरना है।", santaliDeva: "ओना कबर रे कमतटाङ झारना मनेाक् आ।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "आज बहुत गर्मी हो रही है।", santaliDeva: "कतकहञ दो अा ़कडजोर उद्ार काना।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" },
  { hindi: "अब बारिश होनी चाहिए।", santaliDeva: "कनतोक् दॉ दाक्-जा ़कड़ हो् लाग़कतक् काना।", category: "Conversational / Daily Life", logic: "NCERT Bhasha Sangam Standard Conversation Pattern" }
];

export const SANTALI_GRAMMAR_PARADIGMS: GrammarParadigmItem[] = [
  // --- Future Transitive (Verbs: dal, nel, jom, ol, anjom, kirin) ---
  { hindi: "मैं मारूँगा।", santaliDeva: "दालाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम मारोगे।", santaliDeva: "दालाम", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (am)" },
  { hindi: "वह मारेगा।", santaliDeva: "दालाए", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (uni)" },
  { hindi: "हम दोनों मारेंगे (Exclusive)।", santaliDeva: "दालालीन", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (alin)" },
  { hindi: "हम दोनों मारेंगे (Inclusive)।", santaliDeva: "दालालाङ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (alan)" },
  { hindi: "हम सब मारेंगे (Exclusive)।", santaliDeva: "दालाले", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (ale)" },
  { hindi: "हम सब मारेंगे (Inclusive)।", santaliDeva: "दालाबोन", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (abon)" },
  { hindi: "तुम सब मारोगे।", santaliDeva: "दालापे", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (ape)" },
  { hindi: "वे सब मारेंगे।", santaliDeva: "दालाको", category: "Grammar-Heavy (Future Transitive)", logic: "Root (dal) + Future Suffix (a) + Subject Suffix (onko)" },

  { hindi: "मैं देखूँगा।", santaliDeva: "नेलाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम देखोगे।", santaliDeva: "नेलाम", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (am)" },
  { hindi: "वह देखेगा।", santaliDeva: "नेलाए", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (uni)" },
  { hindi: "हम दोनों देखेंगे।", santaliDeva: "नेलालीन", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (alin)" },
  { hindi: "हम दोनों देखेंगे।", santaliDeva: "नेलालाङ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (alan)" },
  { hindi: "हम सब देखेंगे।", santaliDeva: "नेलाले", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (ale)" },
  { hindi: "हम सब देखेंगे।", santaliDeva: "नेलाबोन", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (abon)" },
  { hindi: "तुम सब देखोगे।", santaliDeva: "नेलापे", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (ape)" },
  { hindi: "वे सब देखेंगे।", santaliDeva: "नेलाको", category: "Grammar-Heavy (Future Transitive)", logic: "Root (nel) + Future Suffix (a) + Subject Suffix (onko)" },

  { hindi: "मैं खाूँगा।", santaliDeva: "जोमाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (jom) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम खाोगे।", santaliDeva: "जोमाम", category: "Grammar-Heavy (Future Transitive)", logic: "Root (jom) + Future Suffix (a) + Subject Suffix (am)" },
  { hindi: "वह खाेगा।", santaliDeva: "जोमाए", category: "Grammar-Heavy (Future Transitive)", logic: "Root (jom) + Future Suffix (a) + Subject Suffix (uni)" },

  { hindi: "मैं लिखूँगा।", santaliDeva: "ओलाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (ol) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम लिखोगे।", santaliDeva: "ओलाम", category: "Grammar-Heavy (Future Transitive)", logic: "Root (ol) + Future Suffix (a) + Subject Suffix (am)" },

  { hindi: "मैं सुनूँगा।", santaliDeva: "आंजोमाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (anjom) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम सुनोगे।", santaliDeva: "आंजोमाम", category: "Grammar-Heavy (Future Transitive)", logic: "Root (anjom) + Future Suffix (a) + Subject Suffix (am)" },

  { hindi: "मैं खरीदूँगा।", santaliDeva: "किरिणाञ", category: "Grammar-Heavy (Future Transitive)", logic: "Root (kirin) + Future Suffix (a) + Subject Suffix (in)" },

  // --- Future Intransitive ---
  { hindi: "मैं काम करूँगा।", santaliDeva: "कामीयाञ", category: "Grammar-Heavy (Future Intransitive)", logic: "Root (kami) + Future Suffix (a) + Subject Suffix (in)" },
  { hindi: "तुम काम करोगे।", santaliDeva: "कामीयाम", category: "Grammar-Heavy (Future Intransitive)", logic: "Root (kami) + Future Suffix (a) + Subject Suffix (am)" },

  // --- Present Continuous ---
  { hindi: "मैं मार रहा हूँ।", santaliDeva: "दालएतकानाञ", category: "Grammar-Heavy (Present Continuous)", logic: "Root (dal) + Present Continuous (et-kan) + final a + Subject (in)" },
  { hindi: "तुम मार रहे हो।", santaliDeva: "दालएतकानाम", category: "Grammar-Heavy (Present Continuous)", logic: "Root (dal) + Present Continuous (et-kan) + final a + Subject (am)" },

  // --- Recent Past ---
  { hindi: "मैंने मारा।", santaliDeva: "दालकेताञ", category: "Grammar-Heavy (Recent Past)", logic: "Root (dal) + Recent Past (ket) + final a + Subject (in)" },
  { hindi: "तुमने मारा।", santaliDeva: "दालकेताम", category: "Grammar-Heavy (Recent Past)", logic: "Root (dal) + Recent Past (ket) + final a + Subject (am)" },

  // --- Anterior Past ---
  { hindi: "मैंने मारा था।", santaliDeva: "दाललेताञ", category: "Grammar-Heavy (Anterior Past)", logic: "Root (dal) + Anterior Past (let) + final a + Subject (in)" },
  { hindi: "तुमने मारा था।", santaliDeva: "दाललेताम", category: "Grammar-Heavy (Anterior Past)", logic: "Root (dal) + Anterior Past (let) + final a + Subject (am)" },

  // --- Reflexive / Passive ---
  { hindi: "मैं खुद को मारूँगा (या पीटा जाऊँगा)।", santaliDeva: "दालओकाञ", category: "Grammar-Heavy (Reflexive / Passive)", logic: "Root (dal) + Passive/Reflexive (ok') + final a + Subject (in)" },
  { hindi: "तुम खुद को मारोगे (या पीटे जाओगे)।", santaliDeva: "दालओकाम", category: "Grammar-Heavy (Reflexive / Passive)", logic: "Root (dal) + Passive/Reflexive (ok') + final a + Subject (am)" },

  // --- Objective Infixes ---
  { hindi: "तुम मुझे मारोगे।", santaliDeva: "दालइञाम", category: "Grammar-Heavy (Objective Infix - Future)", logic: "Root (dal) + Object Infix (in) + final a + Subject (am)" },
  { hindi: "मैं तुम्हें मारूँगा।", santaliDeva: "दालमेयाञ", category: "Grammar-Heavy (Objective Infix - Future)", logic: "Root (dal) + Object Infix (me) + final a + Subject (in)" },
  { hindi: "मैं उसे मारूँगा।", santaliDeva: "दालेयाञ", category: "Grammar-Heavy (Objective Infix - Future)", logic: "Root (dal) + Object Infix (e) + final a + Subject (in)" },
  { hindi: "मैं उन्हें मारूँगा।", santaliDeva: "दालकोवाञ", category: "Grammar-Heavy (Objective Infix - Future)", logic: "Root (dal) + Object Infix (ko) + final a + Subject (in)" },

  // --- Case Markers ---
  { hindi: "कुत्ता में / कुत्ता पर", santaliDeva: "सेतारे", category: "Grammar-Heavy (Case Markers)", logic: "Noun (seta) + Locative suffix (re)" },
  { hindi: "कुत्ता से (अलग होने के अर्थ में)", santaliDeva: "सेताखोन", category: "Grammar-Heavy (Case Markers)", logic: "Noun (seta) + Ablative suffix (khon)" },
  { hindi: "कुत्ता द्वारा / कुत्ता से (साधन)", santaliDeva: "सेताते", category: "Grammar-Heavy (Case Markers)", logic: "Noun (seta) + Instrumental suffix (te)" },
  { hindi: "कुत्ता के पास / कुत्ता को", santaliDeva: "सेताठेन", category: "Grammar-Heavy (Case Markers)", logic: "Noun (seta) + Dative suffix (then)" },
  { hindi: "घर में / घर पर", santaliDeva: "ओड़ाक्रे", category: "Grammar-Heavy (Case Markers)", logic: "Noun (orak) + Locative suffix (re)" },
  { hindi: "घर से", santaliDeva: "ओड़ाक्खोन", category: "Grammar-Heavy (Case Markers)", logic: "Noun (orak) + Ablative suffix (khon)" },

  // --- Number System ---
  { hindi: "एक कुत्ता", santaliDeva: "मित् सेता", category: "Grammar-Heavy (Number System)", logic: "Singular prefix (mit') + Noun (seta)" },
  { hindi: "दो कुत्ता", santaliDeva: "बारिया सेताकिन", category: "Grammar-Heavy (Number System)", logic: "Dual prefix (baria) + Noun (seta) + Dual suffix (kin)" },
  { hindi: "कई कुत्ता", santaliDeva: "आडीगान सेताको", category: "Grammar-Heavy (Number System)", logic: "Plural prefix (adigan) + Noun (seta) + Plural suffix (ko)" },
  { hindi: "एक घर", santaliDeva: "मित् ओड़ाक्", category: "Grammar-Heavy (Number System)", logic: "Singular prefix (mit') + Noun (orak)" },
  { hindi: "दो घर", santaliDeva: "बारिया ओड़ाक्किन", category: "Grammar-Heavy (Number System)", logic: "Dual prefix (baria) + Noun (orak) + Dual suffix (kin)" },
  { hindi: "कई घर", santaliDeva: "आडीगान ओड़ाक्को", category: "Grammar-Heavy (Number System)", logic: "Plural prefix (adigan) + Noun (orak) + Plural suffix (ko)" }
];

// 35-Sentence Core Grammar & Verbal Paradigms Matrix
export const SANTALI_SENTENCE_MATRIX_35: SentenceMatrixItem[] = [
  // Verb: Dal (मारना)
  { hindi: "मैं उसे मारता हूँ।", santaliRoman: "In-e dal-e-a.", verbForm: "Active Future/Habitual", grammarNote: "'e' is animate direct object infix." },
  { hindi: "उसने उन्हें मारा।", santaliRoman: "Uni-e dal-ket'-ko-a.", verbForm: "Recent Past", grammarNote: "'-ko' plural object infix." },
  { hindi: "वे मुझे मार रहे हैं।", santaliRoman: "Onko-ko dal-et'-iñ-kana.", verbForm: "Spec. Inc. Pres", grammarNote: "'-iñ-' 1st person object infix." },
  { hindi: "मैं उसे मार चुका हूँ।", santaliRoman: "In-e dal-aka-de-a.", verbForm: "Perfect", grammarNote: "'-de' (e) animate object." },
  { hindi: "वे आपस में लड़ते हैं।", santaliRoman: "Onko-ko dapal-ok'-kana.", verbForm: "Recip. Reflexive", grammarNote: "'dapal' reciprocal form of dal." },
  { hindi: "उसे मारा गया।", santaliRoman: "Uni-e dal-ok'-kana.", verbForm: "Passive (Reflexive)", grammarNote: "'-ok'' acts as passive." },
  { hindi: "मैंने उसे मार कर छोड़ दिया।", santaliRoman: "In-e dal-ka-de-a.", verbForm: "Reservative", grammarNote: "'-ka-' indicates action completion/reservation." },
  { hindi: "वह बार-बार मारता है।", santaliRoman: "Uni-e da-dal-a.", verbForm: "Intensive", grammarNote: "'da-dal' reduplication for intensity." },
  { hindi: "वह उसे मारता था।", santaliRoman: "Uni-e dal-et'-e-tahekan.", verbForm: "Gen. Inc. Past", grammarNote: "Past continuous state." },
  { hindi: "मैं कुल्हाड़ी मारता हूँ।", santaliRoman: "In-e dal-et'-a.", verbForm: "Inanimate Obj", grammarNote: "Inanimate object has zero infix." },

  // Verb: Nel (देखना)
  { hindi: "मैं उसे देखूँगा।", santaliRoman: "In-e nel-e-a.", verbForm: "Future Active", grammarNote: "'e' (Animate Obj)." },
  { hindi: "तुमने मुझे देखा।", santaliRoman: "Am-em nel-ket'-iñ-a.", verbForm: "Recent Past", grammarNote: "'-iñ' (Me)." },
  { hindi: "हम सब देख रहे हैं।", santaliRoman: "Abo-bon nel-et'-kana.", verbForm: "Inclusive Pres", grammarNote: "'bon' inclusive we." },
  { hindi: "वे देख चुके हैं।", santaliRoman: "Onko-ko nel-akat'-a.", verbForm: "Perfect", grammarNote: "Inanimate object implied." },
  { hindi: "वह बहुत ध्यान से देखता है।", santaliRoman: "Uni-e ne-nel-kana.", verbForm: "Intensive", grammarNote: "Reduplication 'ne-nel'." },
  { hindi: "वह उसे देख कर छोड़ देगा।", santaliRoman: "Uni-e nel-ka-de-a.", verbForm: "Reservative", grammarNote: "'ka' (Keep/Leave)." },
  { hindi: "तुम देखे जाओगे।", santaliRoman: "Am-em nel-ok'-a.", verbForm: "Passive", grammarNote: "'-ok'' future passive." },
  { hindi: "मैंने उसे देखा था।", santaliRoman: "In-e nel-le-de-a.", verbForm: "Anterior Past", grammarNote: "'-le' anterior past." },
  { hindi: "वह उसे देख रहा था।", santaliRoman: "Uni-e nel-et'-e-tahekan.", verbForm: "Spec Inc Past", grammarNote: "Continuous past." },
  { hindi: "उन्हें दिखाया जाता है।", santaliRoman: "Onko-ko nel-ocho-ko-a.", verbForm: "Causative", grammarNote: "'ocho' causative suffix." },

  // Verbs: Chalak' (जाना), Hec' (आना), Jom (खाना)
  { hindi: "वह घर जा रहा है।", santaliRoman: "Uni-e chalak'-kana.", verbForm: "Intransitive Pres", grammarNote: "'-kana' continuity." },
  { hindi: "वे चले गए।", santaliRoman: "Onko-ko chal-ena.", verbForm: "Intransitive Past", grammarNote: "'-ena' intransitive past." },
  { hindi: "तुम कहाँ जाओगे?", santaliRoman: "Am-do okate-m chalak'-a?", verbForm: "Future Interrogative", grammarNote: "'okate' (Where to)." },
  { hindi: "हम (दो) घर जाएँगे।", santaliRoman: "Alin orak'-te-lin chalak'-a.", verbForm: "Exclusive Dual", grammarNote: "'lin' (We two exclusive)." },
  { hindi: "वह जाता ही रहा।", santaliRoman: "Uni chalak'-aka-tahen-ae.", verbForm: "Continuative", grammarNote: "'aka-tahen' (Always)." },
  { hindi: "मेहमान आए हैं।", santaliRoman: "Pera-ko hec-akat'-na.", verbForm: "Perfect", grammarNote: "'na' (They)." },
  { hindi: "वह कल आएगा।", santaliRoman: "Uni gapa-e hej-ok'-a.", verbForm: "Future", grammarNote: "'-ok'' intransitive future." },
  { hindi: "वे यहाँ आते थे।", santaliRoman: "Onko-ko hej-ok'-tahekan.", verbForm: "Inc Past", grammarNote: "'-tahekan' (Was)." },
  { hindi: "मैं आ चुका था।", santaliRoman: "In-in hec-len-a.", verbForm: "Anterior Past", grammarNote: "'-len' (Had come)." },
  { hindi: "तुम आओ!", santaliRoman: "Am-do hej-me!", verbForm: "Imperative", grammarNote: "'-me' (Thou)." },
  { hindi: "मैं खाना खा रहा हूँ।", santaliRoman: "In-do daka-n jom-et'-a.", verbForm: "Transitive Pres", grammarNote: "'jom' (To eat)." },
  { hindi: "उसने फल खा लिया।", santaliRoman: "Uni-e jom-ket'-a.", verbForm: "Recent Past", grammarNote: "'-ket' (Ate)." },
  { hindi: "वह खुद खा रहा है।", santaliRoman: "Uni-e jom-ok'-kana.", verbForm: "Reflexive", grammarNote: "'jom-ok'' (Self eating)." },
  { hindi: "मैंने उसे खिलाया।", santaliRoman: "In-e jom-ocho-kede-a.", verbForm: "Causative", grammarNote: "'-ocho' (Cause to)." },
  { hindi: "वे खाना खा चुके हैं।", santaliRoman: "Onko-ko jom-akat'-a.", verbForm: "Perfect", grammarNote: "'-akat' (Has eaten)." }
];

export interface ParsedFileResult {
  extractedEntries: IndexEntry[];
  rawContent: string;
  fileName: string;
}

export function parseTextOrMarkdownContent(content: string, fileName: string = 'User_File.md'): ParsedFileResult {
  const lines = content.split(/\r?\n/);
  const extractedEntries: IndexEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

    // 1. Markdown table rows: | Hindi | Santali | Category |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const h = parts[0];
        const s = parts[1];
        if (h && s && !h.toLowerCase().includes('hindi') && !h.includes('---')) {
          extractedEntries.push({
            source: `Uploaded File (${fileName})`,
            hindi: h,
            santaliDeva: s,
            santaliRoman: s,
            category: parts[2] || 'User File Ground Truth',
            logicOrGrammarNote: `Extracted from uploaded markdown file: ${fileName}`
          });
        }
      }
      continue;
    }

    // 2. Delimited lines: Hindi | Santali or Hindi = Santali or Hindi : Santali or Hindi -> Santali
    const delimiterMatch = trimmed.match(/^[-*\d.]*\s*([^|=:->\t]+)\s*([|=:]|->|=>)\s*(.+)$/);
    if (delimiterMatch) {
      const left = delimiterMatch[1].trim();
      const right = delimiterMatch[3].trim();
      if (left && right && left.length < 250 && right.length < 250) {
        extractedEntries.push({
          source: `Uploaded File (${fileName})`,
          hindi: left,
          santaliDeva: right,
          santaliRoman: right,
          category: 'User Text/MD Rule',
          logicOrGrammarNote: `Extracted from ${fileName}`
        });
      }
    }
  }

  return {
    extractedEntries,
    rawContent: content,
    fileName
  };
}

export function getSantaliLinguisticContext(): string {
  let contextStr = `\n━━━━━━━━━━━━━━━━━━━━━━━\n📚 ADVANCED SANTALI LINGUISTIC & GRAMMAR REPORT (Skrefsrud / NCERT / 23 Tenses Architecture):\n\n`;

  contextStr += `1. LINGUISTIC TAXONOMY & ETYMOLOGY:\n`;
  contextStr += `• Sub-family: Austroasiatic family, Munda branch (Compounding / Turanian structural logic like Turkish).\n`;
  contextStr += `• 'Hor' means human being. Progenitor: Pilchu Had-am. 'Had' root is shared across Kol, Ho, Kor-ko.\n`;
  contextStr += `• Ancient Genitive sign: '-ak' (e.g. Hasd-ak = 'belonging to Hasd').\n\n`;

  contextStr += `2. PHONOLOGY & JERK/INSPIRATE RULES:\n`;
  contextStr += `• Vowel Matrix: 10 Long, 10 Short, Nasal (añ, eñ, iñ, oñ, uñ), Neutral deep gutturals (ạ, ị, ọ, ụ).\n`;
  contextStr += `• Inspirates/Jerks (k', ch', t', p'): Inward breath, closed glottis. Never word-initial.\n`;
  contextStr += `• Softening Shift before vowels: k' ➔ g, ch' ➔ j, t' ➔ d, p' ➔ b (Exception: before vowel 'a' in words like chahapan, softening is inhibited).\n\n`;

  contextStr += `3. NOUN ARCHITECTURE & GENITIVE RIGIDITY:\n`;
  contextStr += `• Animate Possession uses 'ren' (e.g., Kora-ren enga = 'लड़के की माँ').\n`;
  contextStr += `• Inanimate Possession uses 'reak'', 'an', 'rean', 'ak'' (e.g., Tanga-reak' dạt'o = 'कुल्हाड़ी की धार').\n`;
  contextStr += `• Case Suffixes: Nominative (root), Genitive (ren/reak'), Instrumental (-te/-hotete), Dative (-then for animate, -te for inanimate), Ablative (-khon/-khoch), Locative (-re/-talare).\n\n`;

  contextStr += `4. PRONOUN & SOCIAL PRAGMATICS:\n`;
  contextStr += `• Exclusive We: Alin (dual), Ale (plural) - excludes listener.\n`;
  contextStr += `• Inclusive We: Alan (dual), Abo (plural) - includes listener.\n`;
  contextStr += `• Honorific Dual: In-laws (sukur/dama/bahu) use Dual (Aben/Alin).\n`;
  contextStr += `• Honorific Plural: Samdhis use Plural (Ape/Ale). Husband & wife are treated as one combined unit.\n\n`;

  contextStr += `5. VERB STRUCTURE & THE 23 TENSES MATRIX:\n`;
  contextStr += `• Formula: [Root] + [Tense Sign] + [Object Infix] + [a] + [Subject Suffix]\n`;
  contextStr += `• 23 Tense Signs: 1. Future (Root), 2. Gen Inc Pres (-et'), 3. Spec Inc Pres (-et'kan), 4. Recent Past (-ket'), 5. Anterior Past (-len), 6. Perfect (-akat'), 7. Gen Inc Past (-et'tahekan), 8. Spec Inc Past (-et'kantahekan), 9. Indecisive Pluperfect (-letahekan), 10. Decisive Pluperfect (-akat'tahekan), 11. Inchoative Fut (-ok'-a), 12. Inchoative Pres (-ok'-kana), 13. Inchoative Past (-ok'-kantahekan), 14. Optative (-ke), 15. Conditional (-ko), 16. Contingent (-le), 17. Prelim Fut (-le-en-re), 18. Prelim Expost (-le-re-ho), 19. Prelim Persuasive (-le-re-nahak'), 20. Prelim Admissive (-le-re-ba-e), 21. Continuative Fut (-aka-tahen-a), 22. Continuative Pres (-aka-tahen-kana), 23. Continuative Past (-aka-tahen-kantahekan).\n\n`;

  contextStr += `6. STANDARD NCERT BHASHA SANGAM CONVERSATIONS:\n`;
  NCERT_BHASHA_SANGAM_CONVERSATIONS.forEach(item => {
    contextStr += `• Hindi: "${item.hindi}" ➔ Santali (Devanagari): "${item.santaliDeva}"\n`;
  });

  contextStr += `\n7. CORE 35-SENTENCE VERBAL MATRIX EXAMPLES:\n`;
  SANTALI_SENTENCE_MATRIX_35.slice(0, 15).forEach(item => {
    contextStr += `• Hindi: "${item.hindi}" ➔ Santali: "${item.santaliRoman}" (${item.verbForm} - ${item.grammarNote})\n`;
  });

  // Dynamic injection of user local entries & uploaded .txt/.md files
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawLocal = localStorage.getItem('local_contributions');
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
          contextStr += `\n8. USER LOCAL GROUND TRUTH & LEARNED GRAMMAR RULES (${parsedLocal.length} entries):\n`;
          parsedLocal.slice(0, 30).forEach((item: any) => {
            if (item.hindi && (item.santali_deva || item.roman_student)) {
              contextStr += `• Hindi: "${item.hindi}" ➔ Santali: "${item.santali_deva || item.roman_student}" (${item.pos || 'User Rule'})\n`;
            }
          });
        }
      }

      const rawDocs = localStorage.getItem('local_md_documents');
      if (rawDocs) {
        const parsedDocs = JSON.parse(rawDocs);
        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
          contextStr += `\n9. USER UPLOADED TEXT / MARKDOWN GROUND TRUTH DOCUMENTS (${parsedDocs.length} files):\n`;
          parsedDocs.slice(0, 5).forEach((docItem: any) => {
            if (docItem.fileName && docItem.content) {
              contextStr += `--- User Uploaded Document: ${docItem.fileName} ---\n${docItem.content.slice(0, 1500)}\n\n`;
            }
          });
        }
      }
    }
  } catch (e) {
    // Ignore storage read errors
  }

  return contextStr;
}

// Helper to normalize strings for exact map key matching
function normalizeStr(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,!?।;:\-'"()\[\]{}]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

interface IndexEntry {
  source: string;
  hindi: string;
  santaliDeva: string;
  santaliRoman?: string;
  category?: string;
  logicOrGrammarNote?: string;
}

// Memoized dataset index cache built once at module load
const indexCache = (() => {
  const hindiMap = new Map<string, IndexEntry>();
  const santaliDevaMap = new Map<string, IndexEntry>();
  const santaliRomanMap = new Map<string, IndexEntry>();
  const allEntries: IndexEntry[] = [];

  // 1. NCERT Conversations
  NCERT_BHASHA_SANGAM_CONVERSATIONS.forEach(item => {
    const entry: IndexEntry = {
      source: "NCERT Bhasha Sangam Standard",
      hindi: item.hindi,
      santaliDeva: item.santaliDeva,
      category: item.category,
      logicOrGrammarNote: item.logic
    };
    allEntries.push(entry);
    const keyH = normalizeStr(item.hindi);
    if (keyH) hindiMap.set(keyH, entry);
    const keyS = normalizeStr(item.santaliDeva);
    if (keyS) santaliDevaMap.set(keyS, entry);
  });

  // 2. Grammar Paradigms
  SANTALI_GRAMMAR_PARADIGMS.forEach(item => {
    const entry: IndexEntry = {
      source: "Skrefsrud Santali Grammar Paradigm",
      hindi: item.hindi,
      santaliDeva: item.santaliDeva,
      category: item.category,
      logicOrGrammarNote: item.logic
    };
    allEntries.push(entry);
    const keyH = normalizeStr(item.hindi);
    if (keyH && !hindiMap.has(keyH)) hindiMap.set(keyH, entry);
    const keyS = normalizeStr(item.santaliDeva);
    if (keyS && !santaliDevaMap.has(keyS)) santaliDevaMap.set(keyS, entry);
  });

  // 3. 35 Sentence Matrix
  SANTALI_SENTENCE_MATRIX_35.forEach(item => {
    const entry: IndexEntry = {
      source: "Santali 35-Sentence Verbal Matrix",
      hindi: item.hindi,
      santaliDeva: "", // Roman provided
      santaliRoman: item.santaliRoman,
      category: item.verbForm,
      logicOrGrammarNote: item.grammarNote
    };
    allEntries.push(entry);
    const keyH = normalizeStr(item.hindi);
    if (keyH && !hindiMap.has(keyH)) hindiMap.set(keyH, entry);
    const keyR = normalizeStr(item.santaliRoman);
    if (keyR) santaliRomanMap.set(keyR, entry);
  });

  // 4. Dictionary lemmas
  initialDictionary.forEach(item => {
    const mainHindi = item.hindi[0] || '';
    const entry: IndexEntry = {
      source: "Santali Semantic Dictionary Lemma",
      hindi: mainHindi,
      santaliDeva: item.santali_deva,
      santaliRoman: item.roman_student,
      category: item.pos,
      logicOrGrammarNote: `POS: ${item.pos} | English: ${item.english.join(', ')} | Def: ${item.definitions.hindi || ''}`
    };
    allEntries.push(entry);
    item.hindi.forEach(h => {
      const k = normalizeStr(h);
      if (k && !hindiMap.has(k)) hindiMap.set(k, entry);
    });
    item.english.forEach(e => {
      const k = normalizeStr(e);
      if (k && !hindiMap.has(k)) hindiMap.set(k, entry);
    });
    const keyS = normalizeStr(item.santali_deva);
    if (keyS && !santaliDevaMap.has(keyS)) santaliDevaMap.set(keyS, entry);
    const keyR = normalizeStr(item.roman_student);
    if (keyR && !santaliRomanMap.has(keyR)) santaliRomanMap.set(keyR, entry);
  });

  return { hindiMap, santaliDevaMap, santaliRomanMap, allEntries };
})();

export function searchFullSantaliDatabase(query: string): {
  exactHit: DatabaseMatch | null;
  relevantMatches: DatabaseMatch[];
  groundTruthContext: string;
} {
  const normQuery = normalizeStr(query);
  if (!normQuery) {
    return { exactHit: null, relevantMatches: [], groundTruthContext: '' };
  }

  const { hindiMap, santaliDevaMap, santaliRomanMap, allEntries } = indexCache;

  // Dynamically load user-contributed local ground truth from localStorage
  let localEntriesList: IndexEntry[] = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const rawLocal = localStorage.getItem('local_contributions');
      if (rawLocal) {
        const parsedLocal = JSON.parse(rawLocal);
        if (Array.isArray(parsedLocal)) {
          parsedLocal.forEach((item: any) => {
            if (item.hindi && (item.santali_deva || item.roman_student)) {
              localEntriesList.push({
                source: `Locally Contributed Ground Truth (${item.contributed_by || 'User Ground Truth'})`,
                hindi: item.hindi,
                santaliDeva: item.santali_deva || item.roman_student,
                santaliRoman: item.roman_student,
                category: item.pos || 'Local Input',
                logicOrGrammarNote: item.pos ? `POS: ${item.pos} | Added by user` : 'Authentic User Local Input'
              });
            }
          });
        }
      }
    }
  } catch (e) {
    // Ignore storage read errors
  }

  // Check local entries for exact match first
  for (const localItem of localEntriesList) {
    const normH = normalizeStr(localItem.hindi);
    const normSD = normalizeStr(localItem.santaliDeva || '');
    const normSR = normalizeStr(localItem.santaliRoman || '');
    if (normH === normQuery || normSD === normQuery || (normSR && normSR === normQuery)) {
      const santaliText = localItem.santaliDeva || localItem.santaliRoman || '';
      const formatted = `### 📚 Verified Ground Truth Translation (Locally Learned Match)

- **Source Input:** ${query}
- **Santali (Devanagari):** ${santaliText}
${localItem.santaliRoman ? `- **Santali (Roman):** ${localItem.santaliRoman}\n` : ''}- **Hindi Meaning:** ${localItem.hindi}
- **Source Standard:** ${localItem.source}
- **Linguistic Logic:** ${localItem.logicOrGrammarNote}

*This translation was learned directly from user local inputs.*`;

      const exactMatch: DatabaseMatch = {
        hit: true,
        exactMatch: true,
        score: 100,
        source: localItem.source,
        hindi: localItem.hindi,
        santaliDeva: santaliText,
        santaliRoman: localItem.santaliRoman,
        category: localItem.category,
        logicOrGrammarNote: localItem.logicOrGrammarNote,
        formattedOutput: formatted
      };

      return {
        exactHit: exactMatch,
        relevantMatches: [exactMatch],
        groundTruthContext: `EXACT LOCALLY LEARNED GROUND TRUTH HIT:\nHindi: "${localItem.hindi}" | Santali: "${santaliText}" | Logic: ${localItem.logicOrGrammarNote}`
      };
    }
  }

  // 1. O(1) Map Lookup for Exact Ground Truth Match from indexed datasets
  const matchEntry = hindiMap.get(normQuery) || santaliDevaMap.get(normQuery) || santaliRomanMap.get(normQuery);

  if (matchEntry) {
    const santaliText = matchEntry.santaliDeva || matchEntry.santaliRoman || '';
    const formatted = `### 📚 Verified Ground Truth Translation (Database Match)

- **Source Input:** ${query}
- **Santali (Devanagari):** ${santaliText}
${matchEntry.santaliRoman ? `- **Santali (Roman):** ${matchEntry.santaliRoman}\n` : ''}- **Hindi Meaning:** ${matchEntry.hindi}
- **Source Standard:** ${matchEntry.source} (${matchEntry.category || 'General'})
- **Linguistic Logic:** ${matchEntry.logicOrGrammarNote || 'Standard Ground Truth Data'}

*This translation is verified directly from the NCERT Bhasha Sangam / Skrefsrud Santali Ground Truth Database.*`;

    const exactMatch: DatabaseMatch = {
      hit: true,
      exactMatch: true,
      score: 100,
      source: matchEntry.source,
      hindi: matchEntry.hindi,
      santaliDeva: santaliText,
      santaliRoman: matchEntry.santaliRoman,
      category: matchEntry.category,
      logicOrGrammarNote: matchEntry.logicOrGrammarNote,
      formattedOutput: formatted
    };

    return {
      exactHit: exactMatch,
      relevantMatches: [exactMatch],
      groundTruthContext: `EXACT DATABASE GROUND TRUTH HIT:\nHindi: "${matchEntry.hindi}" | Santali: "${santaliText}" | Logic: ${matchEntry.logicOrGrammarNote}`
    };
  }

  // 2. Token & Substring Match Scoring
  const queryTokens = query.toLowerCase().replace(/[.,!?।;:\-'"()\[\]{}]/g, '').split(/\s+/).filter(Boolean);

  const scoredEntries: { entry: IndexEntry; score: number }[] = [];

  for (const entry of [...localEntriesList, ...allEntries]) {
    let score = 0;
    const h = (entry.hindi || '').toLowerCase();
    const sd = (entry.santaliDeva || '').toLowerCase();
    const sr = (entry.santaliRoman || '').toLowerCase();

    if (h.includes(query.toLowerCase()) || query.toLowerCase().includes(h)) score += 40;
    if (sd.includes(query.toLowerCase()) || query.toLowerCase().includes(sd)) score += 40;
    if (sr && (sr.includes(query.toLowerCase()) || query.toLowerCase().includes(sr))) score += 40;

    queryTokens.forEach(token => {
      if (token.length > 1) {
        if (h.includes(token)) score += 15;
        if (sd.includes(token)) score += 15;
        if (sr.includes(token)) score += 15;
      }
    });

    if (score > 0) {
      scoredEntries.push({ entry, score });
    }
  }

  scoredEntries.sort((a, b) => b.score - a.score);

  const topMatches = scoredEntries.slice(0, 8).map(m => ({
    hit: true,
    exactMatch: false,
    score: Math.min(99, m.score),
    source: m.entry.source,
    hindi: m.entry.hindi,
    santaliDeva: m.entry.santaliDeva || m.entry.santaliRoman || '',
    santaliRoman: m.entry.santaliRoman,
    category: m.entry.category,
    logicOrGrammarNote: m.entry.logicOrGrammarNote
  }));

  let groundTruthContext = `📚 RELEVANT SANTALI DATABASE GROUND TRUTH FOR QUERY "${query}":\n`;
  if (topMatches.length > 0) {
    topMatches.forEach((item, idx) => {
      groundTruthContext += `${idx + 1}. [${item.source}] Hindi: "${item.hindi}" ➔ Santali: "${item.santaliDeva}${item.santaliRoman ? ` (${item.santaliRoman})` : ''}" (Logic/Note: ${item.logicOrGrammarNote || 'N/A'})\n`;
    });
  } else {
    groundTruthContext += `(No direct sub-phrase matches in standard dataset, adhere strictly to Skrefsrud & NCERT grammar rules in system instruction).\n`;
  }

  return {
    exactHit: null,
    relevantMatches: topMatches,
    groundTruthContext
  };
}
