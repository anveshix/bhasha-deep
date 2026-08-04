export interface KeyTerm {
  english: string;
  hindi: string;
  santaliDeva: string;
  santaliOlChiki: string;
  romanized: string;
}

export interface TextbookSection {
  id: string;
  headingHindi: string;
  headingSantaliDeva: string;
  contentHindi: string;
  contentSantaliDeva: string;
  contentOlChiki: string;
  villageAnalogy?: string;
}

export interface PracticeQuestion {
  id: string;
  questionSantali: string;
  questionHindi: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface TextbookChapter {
  id: string;
  classNumber: number; // 1 to 12
  subject: string;
  chapterNumber: number;
  titleHindi: string;
  titleSantaliDeva: string;
  titleOlChiki: string;
  titleEnglish: string;
  summaryHindi: string;
  summarySantaliDeva: string;
  sections: TextbookSection[];
  keyTerms: KeyTerm[];
  practiceQuestions: PracticeQuestion[];
}

export interface CBSEClassInfo {
  number: number;
  label: string;
  stage: 'Primary (प्राथमिक)' | 'Middle (उच्च प्राथमिक)' | 'Secondary (माध्यमिक)' | 'Senior Secondary (उच्चतर माध्यमिक)';
  description: string;
}

export const CBSE_CLASSES: CBSEClassInfo[] = [
  { number: 1, label: 'Class 1 (कक्षा 1)', stage: 'Primary (प्राथमिक)', description: '기초 भाषा, अंकज्ञान, पर्यावरण एवं नैतिक शिक्षा' },
  { number: 2, label: 'Class 2 (कक्षा 2)', stage: 'Primary (प्राथमिक)', description: 'मौलिक गणित, शब्दकोश एवं हमारे आसपास की दुनिया' },
  { number: 3, label: 'Class 3 (कक्षा 3)', stage: 'Primary (प्राथमिक)', description: 'पर्यावरण अध्ययन (EVS), प्राकृतिक अवलोकन एवं गणित' },
  { number: 4, label: 'Class 4 (कक्षा 4)', stage: 'Primary (प्राथमिक)', description: 'पर्यावरण, जल संरक्षण, पौधे एवं बुनियादी विज्ञान' },
  { number: 5, label: 'Class 5 (कक्षा 5)', stage: 'Primary (प्राथमिक)', description: 'सजीव जगत, स्वास्थ्य, मापन एवं सामाजिक परिवेश' },
  { number: 6, label: 'Class 6 (कक्षा 6)', stage: 'Middle (उच्च प्राथमिक)', description: 'विज्ञान प्रवेश, इतिहास, भूगोल एवं बीजगणित' },
  { number: 7, label: 'Class 7 (कक्षा 7)', stage: 'Middle (उच्च प्राथमिक)', description: 'पादपों में पोषण, ऊष्मा, अम्ल-क्षार एवं भूगोल' },
  { number: 8, label: 'Class 8 (कक्षा 8)', stage: 'Middle (उच्च प्राथमिक)', description: 'कोशिका, सूक्ष्मजीव, कृषि प्रबंधन एवं नागरिक शास्त्र' },
  { number: 9, label: 'Class 9 (कक्षा 9)', stage: 'Secondary (माध्यमिक)', description: 'हमारे आसपास के पदार्थ, बल एवं गति, जीवन की मौलिक इकाई' },
  { number: 10, label: 'Class 10 (कक्षा 10)', stage: 'Secondary (माध्यमिक)', description: 'रासायनिक अभिक्रियाएं, जैव प्रक्रम, प्रकाश एवं संसाधन' },
  { number: 11, label: 'Class 11 (कक्षा 11)', stage: 'Senior Secondary (उच्चतर माध्यमिक)', description: 'भौतिकी, रसायन विज्ञान, जीव विज्ञान एवं उच्च गणित' },
  { number: 12, label: 'Class 12 (कक्षा 12)', stage: 'Senior Secondary (उच्चतर माध्यमिक)', description: 'पारिस्थितिकी, आनुवंशिकी, वैद्युत रसायन एवं बोर्ड परीक्षा पाठ्यक्रम' },
];

export const CBSE_SUBJECTS_BY_STAGE = {
  Primary: ['Environmental Studies (EVS)', 'Mathematics (गणित)', 'English & Hindi (भाषा)', 'General Knowledge (सामान्य ज्ञान)'],
  Middle: ['Science (विज्ञान)', 'Mathematics (गणित)', 'Social Science (सामाजिक विज्ञान)', 'Sanskrit & Local Heritage (संस्कृति)'],
  Secondary: ['Science (विज्ञान)', 'Mathematics (गणित)', 'Social Science (सामाजिक विज्ञान)', 'English Language'],
  SeniorSecondary: ['Physics (भौतिकी)', 'Chemistry (रसायन विज्ञान)', 'Biology (जीव विज्ञान)', 'Mathematics (गणित)', 'Economics (अर्थशास्त्र)']
};

export const PRELOADED_CHAPTERS: TextbookChapter[] = [
  // CLASS 1 - EVS / Environment
  {
    id: 'c1-evs-ch1',
    classNumber: 1,
    subject: 'Environmental Studies (EVS)',
    chapterNumber: 1,
    titleHindi: 'हमारा परिवार और आसपास का वातावरण',
    titleSantaliDeva: 'आबोवाः घारोंज आर पास-पोड़ोस',
    titleOlChiki: 'ᱟᱵᱚᱣᱟᱜ ᱜᱷᱟᱨᱚᱸᱡᱽ ᱟᱨ ᱯᱟᱥᱼᱯᱚᱲᱳᱥ',
    titleEnglish: 'Our Family and Surroundings',
    summaryHindi: 'इस पाठ में हम अपने परिवार के सदस्यों, घर के काम और अपने गाँव-टोले की हरियाली के बारे में सीखेंगे।',
    summarySantaliDeva: 'नोआ पाठ रे आबो घारोंज रेन हड़ो को, ओड़ाः काम आर आतो रेनाः हरियाली बाबत बो चेत् आ।',
    sections: [
      {
        id: 'c1-sec-1',
        headingHindi: '१. हमारा प्यारा घर (आबोवाः दुलार ओड़ाः)',
        headingSantaliDeva: '१. आबोवाः दुलार ओड़ाः',
        contentHindi: 'घर में हम सब मिलकर रहते हैं। माँ-पिताजी, दादा-दादी और भाई-बहन एक साथ भोजन करते हैं।',
        contentSantaliDeva: 'ओड़ाः रे आबो जोतो मिते बो ताहेना। एङ्गा-आपुम, हाᱲᱟᱢ-ᱵᱩᱰᱷᱤ ᱟᱨ ᱵᱚᱭᱦᱟ-ᱢᱤᱥᱤ ᱢᱤᱫ ᱴᱷᱮᱱ ᱡᱚᱢ-ᱧᱩᱭᱟ ᱵᱚ।',
        contentOlChiki: 'ᱚᱲᱟᱜ ᱨᱮ ᱟᱵᱚ ᱡᱚᱛᱚ ᱢᱤᱫ ᱛᱮ ᱵᱚ ᱛᱟᱦᱮᱸᱱᱟ ᱾ ᱮᱸᱜᱟᱼᱟᱯᱩᱢ, ᱦᱟᱲᱟᱢᱼᱵᱩᱰᱷᱤ ᱟᱨ ᱵᱚᱭᱦᱟᱼᱢᱤᱥᱤ ᱢᱤᱫ ᱴᱷᱮᱱ ᱡᱚᱢᱼᱧᱩᱭᱟ ᱵᱚ ᱾',
        villageAnalogy: 'जैसे चिड़िया घोंसले में अपने बच्चों के साथ सुरक्षित रहती है, वैसे ही हमारा परिवार घर में रहता है।'
      },
      {
        id: 'c1-sec-2',
        headingHindi: '२. हमारे पशु और पेड़-पौधे (आबो रेन जीब-जंतु आर दारे को)',
        headingSantaliDeva: '२. आबो रेन जीब-जंतु आर दारे को',
        contentHindi: 'गाय, बकरी और मुर्गियाँ हमारे घर के आँगन की शोभा हैं। नीम और महुआ के पेड़ हमें ठंडी छाया देते हैं।',
        contentSantaliDeva: 'डाँगरा, मेरीमे आर सिम आबोवाः राचा रेको ताहेना। नीम आर मातोम दारे आबो के राबाङ उमुले एम आबोआ।',
        contentOlChiki: 'ᱰᱟᱸᱜᱽᱨᱟ, ᱢᱮᱨᱳᱢ ᱟᱨ ᱥᱤᱢ ᱟᱵᱚᱣᱟᱜ ᱨᱟᱪᱟ ᱨᱮᱠᱚ ᱛᱟᱦᱮᱸᱱᱟ ᱾ ᱱᱤᱢ ᱟᱨ ᱢᱟᱛᱠᱳᱢ ᱫᱟᱨᱮ ᱟᱵᱚ ᱠᱮ ᱨᱟᱵᱟᱝ ᱩᱢᱩᱞᱮ ᱮᱢ ᱟᱵᱚᱣᱟ ᱾',
        villageAnalogy: 'गाँव में महुआ का पेड़ केवल छाया नहीं देता, बल्कि इसके फूल और फल पूरे गाँव को खुशहाली देते हैं।'
      }
    ],
    keyTerms: [
      { english: 'Family', hindi: 'परिवार', santaliDeva: 'घारोंज', santaliOlChiki: 'ᱜᱷᱟᱨᱚᱸᱡᱽ', romanized: 'Gharonj' },
      { english: 'House', hindi: 'घर', santaliDeva: 'ओड़ाः', santaliOlChiki: 'ᱚᱲᱟᱜ', romanized: 'Orak' },
      { english: 'Tree', hindi: 'पेड़', santaliDeva: 'दारे', santaliOlChiki: 'ᱫᱟᱨᱮ', romanized: 'Dare' },
      { english: 'Animal', hindi: 'पशु', santaliDeva: 'जीव-जंतु', santaliOlChiki: 'ᱡᱤᱣᱼᱡᱟᱹᱱᱛᱩ', romanized: 'Jiw-Jantu' }
    ],
    practiceQuestions: [
      {
        id: 'q1',
        questionSantali: 'ओड़ाः रे आबो को ओकोयाः साओ बो ताहेना?',
        questionHindi: 'घर में हम किसके साथ रहते हैं?',
        options: ['घारोंज रेन हड़ो साओ (परिवार के साथ)', 'एस्करा गे (अकेले)', 'पेड़े साओ (अजनबियों के साथ)', 'ओकोय हो बाङ (किसी के साथ नहीं)'],
        answerIndex: 0,
        explanation: 'हम अपने परिवार (घारोंज) के सभी सदस्यों के साथ घर में प्यार से रहते हैं।'
      }
    ]
  },

  // CLASS 3 - SCIENCE
  {
    id: 'c3-sci-ch3',
    classNumber: 3,
    subject: 'Environmental Studies (EVS)',
    chapterNumber: 3,
    titleHindi: 'पौधों की अनोखी दुनिया और प्रकाश संश्लेषण',
    titleSantaliDeva: 'दारे कोवाः अनोखा दुनिया आर जोम-जोमाओ',
    titleOlChiki: 'ᱫᱟᱨᱮ ᱠᱚᱣᱟᱜ ᱟᱱᱳᱠᱷᱟ ᱫᱩᱱᱤᱭᱟᱹ ᱟᱨ ᱡᱚᱢᱼᱡᱚᱢᱟᱣ',
    titleEnglish: 'The Plants World & Photosynthesis',
    summaryHindi: 'पौधे सूरज की रोशनी, हवा और पानी की मदद से अपना भोजन स्वयं बनाते हैं।',
    summarySantaliDeva: 'दारे को चोंदोवाः आरसाल, होय आर दाः ते आकोवाः जोमाः आको गेको बेनावा।',
    sections: [
      {
        id: 'c3-sec-1',
        headingHindi: '१. पत्तियाँ: पौधे की रसोई (साकाम: दारे रेनाः रांचा)',
        headingSantaliDeva: '१. साकाम: दारे रेनाः रांचा',
        contentHindi: 'हरी पत्तियों में क्लोरोफिल नामक हरा वर्णक होता है, जो धूप को सोखकर भोजन बनाने में मदद करता है।',
        contentSantaliDeva: 'हरीया साकाम रे क्लोरोफिल ताहेना, ओका डो सीञ-चोंदोवाः आरसाल सब काटे जोमाः बेनाव रे साहाजोआ।',
        contentOlChiki: 'ᱦᱟᱹᱨᱤᱭᱟᱹ ᱥᱟᱠᱟᱢ ᱨᱮ ᱠᱞᱳᱨᱳᱯᱷᱤᱞ ᱛᱟᱦᱮᱸᱱᱟ, ᱚᱠᱟ ᱫᱚ ᱥᱤᱧᱼᱪᱟᱸᱫᱚᱣᱟᱜ ᱟᱨᱥᱟᱞ ᱥᱟᱵ ᱠᱟᱛᱮ ᱡᱚᱢᱟᱜ ᱵᱮᱱᱟᱣ ᱨᱮ ᱥᱟᱦᱟᱡᱳᱟ ᱾',
        villageAnalogy: 'जैसे घर की रसोई में माँ चूल्हे पर चावल पकाती है, वैसे ही हरी पत्तियाँ धूप की गर्मी से भोजन पकाती हैं।'
      },
      {
        id: 'c3-sec-2',
        headingHindi: '२. जड़ और पानी (रेहेत् आर दाः)',
        headingSantaliDeva: '२. रेहेत् आर दाः',
        contentHindi: 'जड़ें ज़मीन के नीचे से पानी और खनिज लवण सोखकर पौधे के सभी भागों तक पहुँचाती हैं।',
        contentSantaliDeva: 'रेहेत् को हासा भितरी खोच दाः आर सार-पसार सब काटे दारे रेनाः जोतो आङ रे सेटोरा।',
        contentOlChiki: 'ᱨᱮᱦᱮᱫ ᱠᱚ ᱦᱟᱥᱟ ᱵᱷᱤᱛᱨᱤ ᱠᱷᱚᱱ ᱫᱟᱜ ᱟᱨ ᱥᱟᱨᱼᱯᱟᱥᱟᱨ ᱥᱟᱵ ᱠᱟᱛᱮ ᱫᱟᱨᱮ ᱨᱮᱱᱟᱜ ᱡᱚᱛᱚ ᱟᱝ ᱨᱮ ᱥᱮᱴᱮᱨᱟ ᱾',
        villageAnalogy: 'जैसे खेत में नहर से पानी फसलों की जड़ों तक पहुँचता है, वैसे ही जड़ें पूरे पौधे को पानी पिलाती हैं।'
      }
    ],
    keyTerms: [
      { english: 'Leaves', hindi: 'पत्तियाँ', santaliDeva: 'साकाम', santaliOlChiki: 'ᱥᱟᱠᱟᱢ', romanized: 'Sakam' },
      { english: 'Roots', hindi: 'जड़ें', santaliDeva: 'रेहेत्', santaliOlChiki: 'ᱨᱮᱦᱮᱫ', romanized: 'Rehet' },
      { english: 'Sunlight', hindi: 'सूर्य का प्रकाश', santaliDeva: 'सीञ-चोंदो आरसाल', santaliOlChiki: 'ᱥᱤᱧᱼᱪᱟᱸᱫᱚ ᱟᱨᱥᱟᱞ', romanized: 'Sin-Chando Arsal' },
      { english: 'Water', hindi: 'जल/पानी', santaliDeva: 'दाः', santaliOlChiki: 'ᱫᱟᱜ', romanized: 'Dak' }
    ],
    practiceQuestions: [
      {
        id: 'q3-1',
        questionSantali: 'दारे को जोमाः बेनाव लागित ओका साकाम रे ताहेना?',
        questionHindi: 'पौधे भोजन बनाने के लिए पत्तियों में क्या उपयोग करते हैं?',
        options: ['सीञ-चोंदो आरसाल आर क्लोरोफिल', 'खाली बिलिं दाः', 'खाली ओथे हासा', 'ओकोयाः हो बाङ'],
        answerIndex: 0,
        explanation: 'पौधे सूरज की रोशनी (सीञ-चोंदो आरसाल) और पत्तियों के क्लोरोफिल से भोजन बनाते हैं।'
      }
    ]
  },

  // CLASS 6 - SCIENCE
  {
    id: 'c6-sci-ch1',
    classNumber: 6,
    subject: 'Science (विज्ञान)',
    chapterNumber: 1,
    titleHindi: 'भोजन: यह कहाँ से आता है? (अन्न स्रोत)',
    titleSantaliDeva: 'जोमाः: नोआ ओका खोच ञामोःआ?',
    titleOlChiki: 'ᱡᱚᱢᱟᱜ: ᱱᱳᱣᱟ ᱚᱠᱟ ᱠᱷᱚᱱ ᱧᱟᱢᱚᱜᱼᱟ?',
    titleEnglish: 'Food: Where Does It Come From?',
    summaryHindi: 'हम जो अनाज, दाल, फल और दूध खाते हैं, वे मुख्य रूप से दो स्रोतों - पौधों और जानवरों से प्राप्त होते हैं।',
    summarySantaliDeva: 'आबो ओका चावले, दाल, जो आर तोवा बो जोम-ञुया, नोआ को दो बारिया ठाँव - दारे आर जीव को खोच ञामोःआ।',
    sections: [
      {
        id: 'c6-sec-1',
        headingHindi: '१. पौधों से प्राप्त खाद्य पदार्थ (दारे खोच ञामोः जोमाः)',
        headingSantaliDeva: '१. दारे खोच ञामोः जोमाः',
        contentHindi: 'धान, गेहूं, मक्का, सरसों और सब्जियां पौधों की देन हैं। हम पौधों के बीज, जड़, तना और पत्तियाँ खाते हैं।',
        contentSantaliDeva: 'होड़े, गुहूम्, जनाड़ा, मोरी आर आरअ-साकाम दारे खोच ञामोःआ। आबो दारे रेनाः जानुम्, रेहेत्, डांटा आर साकाम बो जोमा।',
        contentOlChiki: 'ᱦᱩᱲᱩ, ᱜᱩᱦᱩᱢ, ᱡᱚᱱᱚᱲᱟ, ᱢᱚᱨᱤ ᱟᱨ ᱟᱲᱟᱜᱼᱥᱟᱠᱟᱢ ᱫᱟᱨᱮ ᱠᱷᱚᱱ ᱧᱟᱢᱚᱜᱼᱟ ᱾ ᱟᱵᱚ ᱫᱟᱨᱮ ᱨᱮᱱᱟᱜ ᱡᱟᱱᱩᱢ, ᱨᱮᱦᱮᱫ, ᱰᱟᱸᱴᱟ ᱟᱨ ᱥᱟᱠᱟᱢ ᱵᱚ ᱡᱚᱢᱟ ᱾',
        villageAnalogy: 'हमारे गाँवों में महुआ का फूल, कंद-मूल और जंगली साग प्रकृति का अनमोल उपहार हैं।'
      },
      {
        id: 'c6-sec-2',
        headingHindi: '२. जंतुओं से प्राप्त खाद्य पदार्थ (जीव-जंतु खोच ञामोः जोमाः)',
        headingSantaliDeva: '२. जीव-जंतु खोच ञामोः जोमाः',
        contentHindi: 'दूध, दही, मक्खन, अंडे और माँस जानवरों से मिलते हैं। गाय, भैंस और बकरी दूध के मुख्य स्रोत हैं।',
        contentSantaliDeva: 'तोवा, दोही, गोटा तोवा, बेले आर जिल जीव-जंतु को खोच ञामोःआ। डाँगरा, काड़ा आर मेरीम तोवा रेनाः असोल ठाँव कानाको।',
        contentOlChiki: 'ᱛᱚᱣᱟ, ᱫᱚᱦᱤ, ᱜᱚᱴᱟ ᱛᱚᱣᱟ, ᱵᱮᱞᱮ ᱟᱨ ᱡᱤᱞ ᱡᱤᱣᱼᱡᱟᱹᱱᱛᱩ ᱠᱚ ᱠᱷᱚᱱ ᱧᱟᱢᱚᱜᱼᱟ ᱾ ᱰᱟᱸᱜᱽᱨᱟ, ᱠᱟᱲᱟ ᱟᱨ ᱢᱮᱨᱳᱢ ᱛᱚᱣᱟ ᱨᱮᱱᱟᱜ ᱟᱥᱚᱞ ᱴᱷᱟᱶ ᱠᱟᱱᱟᱠᱳ ᱾',
        villageAnalogy: 'हमारे टोले में पाली जाने वाली बकरियाँ और मुर्गियाँ परिवारों की आजीविका एवं पोषण का आधार हैं।'
      }
    ],
    keyTerms: [
      { english: 'Ingredients', hindi: 'सामग्री/संघटक', santaliDeva: 'समान/मिसाव जोमाः', santaliOlChiki: 'ᱥᱟᱢᱟᱱ/ᱢᱤᱥᱟᱣ ᱡᱚᱢᱟᱜ', romanized: 'Saman / Misaw' },
      { english: 'Herbivore', hindi: 'शाकाहारी', santaliDeva: 'साकाम जोम जीव', santaliOlChiki: 'ᱥᱟᱠᱟᱢ ᱡᱚᱢ ᱡᱤᱣ', romanized: 'Sakam Jom Jiw' },
      { english: 'Carnivore', hindi: 'मांसाहारी', santaliDeva: 'जिल जोम जीव', santaliOlChiki: 'ᱡᱤᱞ ᱡᱚᱢ ᱡᱤᱣ', romanized: 'Jil Jom Jiw' },
      { english: 'Omnivore', hindi: 'सर्वाहारी', santaliDeva: 'जोतोआः जोम जीव', santaliOlChiki: 'ᱡᱚᱛᱚᱣᱟᱜ ᱡᱚᱢ ᱡᱤᱣ', romanized: 'Jotoag Jom Jiw' }
    ],
    practiceQuestions: [
      {
        id: 'q6-1',
        questionSantali: 'ओका डाँगरा आर मेरीम खोच असोल ते ञामोःआ?',
        questionHindi: 'गाय और बकरी से मुख्य रूप से क्या प्राप्त होता है?',
        options: ['तोवा (दूध)', 'चावले (चावल)', 'दाः (पानी)', 'हासा (मिट्टी)'],
        answerIndex: 0,
        explanation: 'गाय और बकरी हमें पौष्टिक दूध (तोवा) प्रदान करते हैं।'
      }
    ]
  },

  // CLASS 8 - SCIENCE / CELL
  {
    id: 'c8-sci-ch8',
    classNumber: 8,
    subject: 'Science (विज्ञान)',
    chapterNumber: 8,
    titleHindi: 'कोशिका: संरचना एवं प्रकार्य',
    titleSantaliDeva: 'कोशिका: गोड़हन आर का़मी',
    titleOlChiki: 'ᱠᱳᱥᱤᱠᱟ: ᱜᱚᱲᱦᱚᱱ ᱟᱨ ᱠᱟᱹᱢᱤ',
    titleEnglish: 'Cell: Structure and Functions',
    summaryHindi: 'कोशिका जीवन की सबसे छोटी संरचनात्मक और कार्यात्मक इकाई है, जैसे ईंटों से मकान बनता है।',
    summarySantaliDeva: 'कोशिका दो जीवी कोवाः जोतो खोच हुडीञ गोड़हन आर का़मी अंग काना, जेलेका ईटा ते ओड़ाः बेनावोःआ।',
    sections: [
      {
        id: 'c8-sec-1',
        headingHindi: '१. कोशिका की खोज और परिभाषा (कोशिका नामाम आर आरसोङ)',
        headingSantaliDeva: '१. कोशिका नामाम आर आरसोङ',
        contentHindi: 'रोबर्ट हुक ने १६६५ में कॉर्क की पतली काट में कोशिका की खोज की थी। सभी जीव कोशिकाओं से बने हैं।',
        contentSantaliDeva: 'रॉबर्ट हुक १६६५ साले रे कॉर्क रेनाः हुडीञ काट रे कोशिकाए ञाम लेदा। जोतो जीवी कोशिका तेगेको बेनाव आकाना।',
        contentOlChiki: 'ᱨᱚᱵᱚᱨᱴ ᱦᱩᱠ ᱑᱖᱖᱕ ᱥᱟᱞᱮ ᱨᱮ ᱠᱳᱨᱠ ᱨᱮᱱᱟᱜ ᱦᱩᱰᱤᱧ ᱠᱟᱴ ᱨᱮ ᱠᱳᱥᱤᱠᱟᱭ ᱧᱟᱢ ᱞᱮᱫᱟ ᱾ ᱡᱚᱛᱚ ᱡᱤᱣᱤ ᱠᱳᱥᱤᱠᱟ ᱛᱮᱜᱮᱠᱚ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ ᱾',
        villageAnalogy: 'जैसे हमारे गाँव का मिट्टी का बड़ा बाँध छोटी-छोटी मिट्टी की गोलियों से जुड़कर बनता है, वैसे ही शरीर कोशिकाओं से बनता है।'
      },
      {
        id: 'c8-sec-2',
        headingHindi: '२. केंद्रक और कोशिका द्रव्य (केंद्रक आर कोशिका रस)',
        headingSantaliDeva: '२. केंद्रक आर कोशिका रस',
        contentHindi: 'कोशिका के मध्य में एक गोल संरचना होती है जिसे केंद्रक (Nucleus) कहते हैं। यह कोशिका का मस्तिष्क है।',
        contentSantaliDeva: 'कोशिका रेनाः ताला रे मिद् गोल गोड़हन ताहेना ओका दो केंद्रक बो मेताःआ। नोआ कोशिका रेनाः बोहोः लेका का़मीया।',
        contentOlChiki: 'ᱠᱳᱥᱤᱠᱟ ᱨᱮᱱᱟᱜ ᱛᱟᱞᱟ ᱨᱮ ᱢᱤᱫ ᱜᱳᱞ ᱜᱚᱲᱦᱚᱱ ᱛᱟᱦᱮᱸᱱᱟ ᱚᱠᱟ ᱫᱚ ᱠᱮᱱᱫᱽᱨᱚᱠ ᱵᱚ ᱢᱮᱛᱟᱜᱼᱟ ᱾ ᱱᱳᱣᱟ ᱠᱳᱥᱤᱠᱟ ᱨᱮᱱᱟᱜ ᱵᱚᱦᱚᱜ ᱞᱮᱠᱟ ᱠᱟᱹᱢᱤᱭᱟ ᱾',
        villageAnalogy: 'जैसे हमारे गाँव की पंचायत का मांझी हड़ाम (मुखिया) पूरे गाँव का संचालन करता है, वैसे ही केंद्रक कोशिका का नियंत्रण करता है।'
      }
    ],
    keyTerms: [
      { english: 'Cell', hindi: 'कोशिका', santaliDeva: 'कोशिका / हुडीञ अंग', santaliOlChiki: 'ᱠᱳᱥᱤᱠᱟ / ᱦᱩᱰᱤᱧ ᱟᱝ', romanized: 'Koshika' },
      { english: 'Nucleus', hindi: 'केंद्रक', santaliDeva: 'ताला-अंग/केंद्रक', santaliOlChiki: 'ᱛᱟᱞᱟᱼᱟᱝ / ᱠᱮᱱᱫᱽᱨᱚᱠ', romanized: 'Tala-Ang' },
      { english: 'Cytoplasm', hindi: 'कोशिका द्रव्य', santaliDeva: 'कोशिका रस', santaliOlChiki: 'ᱠᱳᱥᱤᱠᱟ ᱨᱚᱥ', romanized: 'Koshika Ras' },
      { english: 'Tissue', hindi: 'ऊतक', santaliDeva: 'ऊतक/मिसा अंग', santaliOlChiki: 'ᱩᱛᱚᱠ / ᱢᱤᱥᱟ ᱟᱝ', romanized: 'Utak' }
    ],
    practiceQuestions: [
      {
        id: 'q8-1',
        questionSantali: 'कोशिका रेनाः बोहोः आर का़मी सुतरोइचा ओकोया?',
        questionHindi: 'कोशिका का नियंत्रण केंद्र (मस्तिष्क) किसे कहा जाता है?',
        options: ['केंद्रक (Nucleus)', 'कोशिका झिल्ली', 'दाः रस', 'प्लास्टिड'],
        answerIndex: 0,
        explanation: 'केंद्रक (Nucleus) ही कोशिका की सभी गतिविधियों का नियंत्रण करता है।'
      }
    ]
  },

  // CLASS 10 - SCIENCE
  {
    id: 'c10-sci-ch1',
    classNumber: 10,
    subject: 'Science (विज्ञान)',
    chapterNumber: 1,
    titleHindi: 'रासायनिक अभिक्रियाएं एवं समीकरण',
    titleSantaliDeva: 'रासायनिक औरसोङ आर समीकरण',
    titleOlChiki: 'ᱨᱟᱥᱟᱭᱚᱱᱤᱠ ᱚᱨᱥᱚᱝ ᱟᱨ ᱥᱚᱢᱤᱠᱚᱨᱚᱱ',
    titleEnglish: 'Chemical Reactions and Equations',
    summaryHindi: 'जब दो या दो से अधिक पदार्थ मिलकर नए गुण वाले पदार्थ बनाते हैं, तो उसे रासायनिक अभिक्रिया कहते हैं।',
    summarySantaliDeva: 'तिनजोक बारिया या बाढिये समान मिसा काटे नवा गुण आनाः समान बेनावा, ओना दो रासायनिक औरसोङ बो मेताःआ।',
    sections: [
      {
        id: 'c10-sec-1',
        headingHindi: '१. रासायनिक परिवर्तन की पहचान (नवा गुण बेनाव)',
        headingSantaliDeva: '१. नवा गुण बेनाव',
        contentHindi: 'रंग में परिवर्तन, तापमान में बदलाव, गैस का उत्सर्जन और अवस्था में बदलाव रासायनिक अभिक्रिया के लक्षण हैं।',
        contentSantaliDeva: 'रंङ बदलोः, लोल बदलोः, गैस ओडोोः आर गोड़हन बदलोः रासायनिक औरसोङ रेनाः चिनहा काना।',
        contentOlChiki: 'ᱨᱚᱝ ᱵᱚᱫᱚᱞᱳᱜ, ᱞᱳᱞ ᱵᱚᱫᱚᱞᱳᱜ, ᱜᱮᱥ ᱚᱰᱳᱜ ᱟᱨ ᱜᱚᱲᱦᱚᱱ ᱵᱚᱫᱚᱞᱳᱜ ᱨᱟᱥᱟᱭᱚᱱᱤᱠ ᱚᱨᱥᱚᱝ ᱨᱮᱱᱟᱜ ᱪᱤᱱᱦᱟᱹ ᱠᱟᱱᱟ ᱾',
        villageAnalogy: 'जैसे चूने (Chuna) में पानी मिलाने पर ज़ोरदार गर्मी और बुलबुले निकलते हैं, वह एक रासायनिक अभिक्रिया है।'
      },
      {
        id: 'c10-sec-2',
        headingHindi: '२. संयोजन एवं वियोजन अभिक्रियाएँ (मिदाओ आर हाटीञ औरसोङ)',
        headingSantaliDeva: '२. मिदाओ आर हाटीञ औरसोङ',
        contentHindi: 'संयोजन अभिक्रिया में दो अभिकारक मिलकर एकल उत्पाद बनाते हैं। वियोजन में एक यौगिक टूटकर कई उत्पाद देता है।',
        contentSantaliDeva: 'मिदाओ औरसोङ रे बारिया अभिकारक मिसा काटे मिद् उत्पाद बेनावा। हाटीञ औरसोङ रे मिद् यौगिक रापुद् काटे बाढिये उत्पाद एमा।',
        contentOlChiki: 'ᱢᱤᱫᱟᱣ ᱚᱨᱥᱚᱝ ᱨᱮ ᱵᱟᱨᱭᱟ ᱟᱵᱷᱤᱠᱟᱨᱚᱠ ᱢᱤᱥᱟ ᱠᱟᱛᱮ ᱢᱤᱫ ᱩᱛᱯᱟᱫ ᱵᱮᱱᱟᱣᱟ ᱾ ᱦᱟᱹᱴᱤᱧ ᱚᱨᱥᱚᱝ ᱨᱮ ᱢᱤᱫ ᱭᱚᱣᱜᱤᱠ ᱨᱟᱹᱯᱩᱫ ᱠᱟᱛᱮ ᱵᱟᱹᱲᱛᱤ ᱩᱛᱯᱟᱫ ᱮᱢᱟ ᱾',
        villageAnalogy: 'जैसे मिट्टी और पानी मिलाकर गीली गारा बनाई जाती है, वैसे ही संयोजन में दो तत्व जुड़ते हैं।'
      }
    ],
    keyTerms: [
      { english: 'Chemical Reaction', hindi: 'रासायनिक अभिक्रिया', santaliDeva: 'रासायनिक औरसोङ', santaliOlChiki: 'ᱨᱟᱥᱟᱭᱚᱱᱤᱠ ᱚᱨᱥᱚᱝ', romanized: 'Rasayanik Orsong' },
      { english: 'Reactants', hindi: 'अभिकारक', santaliDeva: 'अभिकारक / मिसाव समान', santaliOlChiki: 'ᱟᱵᱷᱤᱠᱟᱨᱚᱠ / ᱢᱤᱥᱟᱣ ᱥᱟᱢᱟᱱ', romanized: 'Abhikarak' },
      { english: 'Products', hindi: 'उत्पाद', santaliDeva: 'उत्पाद / ओडोोः समान', santaliOlChiki: 'ᱩᱛᱯᱟᱫ / ᱚᱰᱳᱜ ᱥᱟᱢᱟᱱ', romanized: 'Utpad' }
    ],
    practiceQuestions: [
      {
        id: 'q10-1',
        questionSantali: 'चुना रे दाः मिसा लेरे लोल आर गेंस ओडोोःआ, नोआ ओका लेकाना औरसोङ काना?',
        questionHindi: 'चूने में पानी मिलाने पर गर्मी निकलना किस प्रकार की अभिक्रिया है?',
        options: ['उष्माक्षेपी रासायनिक औरसोङ (Exothermic Reaction)', 'उष्माशोषी औरसोङ', 'खाली भौतिक बदलोः', 'ओकोयाः हो बाङ'],
        answerIndex: 0,
        explanation: 'चूने और पानी की अभिक्रिया में ऊष्मा (गर्मी) बाहर निकलती है, अतः यह उष्माक्षेपी रासायनिक अभिक्रिया (Exothermic Reaction) है।'
      }
    ]
  },

  // CLASS 12 - BIOLOGY / ECOSYSTEM
  {
    id: 'c12-bio-ch14',
    classNumber: 12,
    subject: 'Biology (जीव विज्ञान)',
    chapterNumber: 14,
    titleHindi: 'पारिस्थितिकी तंत्र एवं जैव विविधता',
    titleSantaliDeva: 'पारिस्थितिकी तंत्र आर जीव-भिन्नता',
    titleOlChiki: 'ᱯᱚᱨᱤᱥᱛᱷᱤᱛᱤᱠᱤ ᱛᱚᱱᱛᱨᱚ ᱟᱨ ᱡᱤᱣᱼᱵᱷᱤᱱᱟᱹ',
    titleEnglish: 'Ecosystem and Biodiversity',
    summaryHindi: 'पारिस्थितिक तंत्र जैविक एवं अजैविक घटकों के बीच ऊर्जा प्रवाह और पोषक तत्वों के चक्रण की प्राकृतिक व्यवस्था है।',
    summarySantaliDeva: 'पारिस्थितिक तंत्र दो जीवी आर बोजीवी समान को ताला रे दड़े चलाव आर पोषाहार फिरोव रेनाः कुदरती नियम काना।',
    sections: [
      {
        id: 'c12-sec-1',
        headingHindi: '१. जैविक एवं अजैविक घटक (जीवी आर बोजीवी अंग)',
        headingSantaliDeva: '१. जीवी आर बोजीवी अंग',
        contentHindi: 'उत्पादक (पौधे), उपभोक्ता (हिरण, शेर) और अपघटक (कवक, जीवाणु) जैविक घटक हैं; जबकि जल, हवा, मिट्टी अजैविक घटक हैं।',
        contentSantaliDeva: 'बेनाविज (दारे), जोमिज (जंतू को) आर रापुदिज (जीवाणु) जीवी अंग कानाको; आर दाः, होय, हासा दो बोजीवी अंग काना।',
        contentOlChiki: 'ᱵᱮᱱᱟᱣᱤᱡ (ᱫᱟᱨᱮ), ᱡᱚᱢᱤᱡ (ᱡᱟᱹᱱᱛᱩ ᱠᱚ) ᱟᱨ ᱨᱟᱹᱯᱩᱫᱤᱡ (ᱡᱤᱣᱟᱬᱩ) ᱡᱤᱣᱤ ᱟᱝ ᱠᱟᱱᱟᱠᱳ ᱾ ᱟᱨ ᱫᱟᱜ, ᱦᱳᱭ, ᱦᱟᱥᱟ ᱫᱚ ᱵᱚᱡᱤᱣᱤ ᱟᱝ ᱠᱟᱱᱟ ᱾',
        villageAnalogy: 'हमारा सरना स्थल (जाहेर थान) और पवित्र वन (Jahir Bonga) जैव विविधता संरक्षण का प्राचीन जनजातीय उदाहरण हैं।'
      },
      {
        id: 'c12-sec-2',
        headingHindi: '२. खाद्य श्रृंखला एवं ऊर्जा का १०% नियम (जोमाः माला आर दड़े)',
        headingSantaliDeva: '२. जोमाः माला आर दड़े',
        contentHindi: 'एक पोषी स्तर से अगले पोषी स्तर में केवल १०% ऊर्जा ही स्थानांतरित होती है, शेष ९०% ऊर्जा ऊष्मा के रूप में क्षय हो जाती है।',
        contentSantaliDeva: 'मिद् पोषी स्तर खोच लाहा पोषी स्तर रे खाली १०% दड़े गे चलाःआ, बांकी ९०% दड़े दो लोल रूप ते नासआ।',
        contentOlChiki: 'ᱢᱤᱫ ᱯᱳᱥᱤ ᱥᱛᱚᱨ ᱠᱷᱚᱱ ᱞᱟᱦᱟ ᱯᱳᱥᱤ ᱥᱛᱚᱨ ᱨᱮ ᱠᱷᱟᱞᱤ ᱑᱐% ᱫᱟᱹᱲᱮ ᱜᱮ ᱪᱟᱞᱟᱜᱼᱟ, ᱵᱟᱹᱠᱤ ᱙᱐% ᱫᱟᱹᱲᱮ ᱫᱚ ᱞᱳᱞ ᱨᱩᱯ ᱛᱮ ᱱᱟᱥᱚᱜᱼᱟ ᱾',
        villageAnalogy: 'जैसे घास को हिरण खाता है और हिरण को बाघ, वैसे ही ऊर्जा एक से दूसरे जीव तक पहुँचती है।'
      }
    ],
    keyTerms: [
      { english: 'Ecosystem', hindi: 'पारिस्थितिक तंत्र', santaliDeva: 'पारिस्थितिक तंत्र / कुदरती घर', santaliOlChiki: 'ᱯᱚᱨᱤᱥᱛᱷᱤᱛᱤᱠᱤ ᱛᱚᱱᱛᱨᱚ', romanized: 'Kudurti Ghar' },
      { english: 'Biodiversity', hindi: 'जैव विविधता', santaliDeva: 'जीव-भिन्नता', santaliOlChiki: 'ᱡᱤᱣᱼᱵᱷᱤᱱᱟᱹ', romanized: 'Jiw-Bhinna' },
      { english: 'Producers', hindi: 'उत्पादक', santaliDeva: 'बेनाविज (दारे)', santaliOlChiki: 'ᱵᱮᱱᱟᱣᱤᱡ (ᱫᱟᱨᱮ)', romanized: 'Benawij' },
      { english: 'Decomposers', hindi: 'अपघटक', santaliDeva: 'रापुदिज / मिलाविज', santaliOlChiki: 'ᱨᱟᱹᱯᱩᱫᱤᱡ / ᱢᱤᱞᱟᱹᱣᱤᱡ', romanized: 'Rapudij' }
    ],
    practiceQuestions: [
      {
        id: 'q12-1',
        questionSantali: 'खाद्य श्रृंखला रे मिद् स्तर खोच लाहा स्तर रे तिनाः दड़े (Energy) चलाःआ?',
        questionHindi: 'खाद्य श्रृंखला में एक स्तर से अगले स्तर पर कितने प्रतिशत ऊर्जा स्थानांतरित होती है?',
        options: ['१०% (10 Percent)', '५०%', '१००%', '०%'],
        answerIndex: 0,
        explanation: 'लिंडमैन के नियम के अनुसार केवल १०% ऊर्जा अगले पोषी स्तर तक पहुँचती है।'
      }
    ]
  }
];
