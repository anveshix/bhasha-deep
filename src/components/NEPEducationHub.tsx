import React, { useState, useEffect } from 'react';
import { 
  School, BookOpen, Send, Sparkles, Copy, FileText, CheckCircle2, Volume2, 
  Square, Info, RefreshCw, Search, Play, Check, HelpCircle, 
  GraduationCap, Layers, Languages, BookMarked, Award, ArrowRight,
  ChevronRight, VolumeX
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  CBSE_CLASSES, 
  CBSE_SUBJECTS_BY_STAGE, 
  PRELOADED_CHAPTERS, 
  TextbookChapter, 
  KeyTerm,
  PracticeQuestion
} from '../data/cbseTextbooks';
import { searchFullSantaliDatabase } from '../data/santaliGrammarContext';

interface NEPEducationHubProps {
  getAI: () => any;
  speakText: (text: string, id: string, lang?: string) => void;
  speakingId: string | null;
  showToast: (msg: string, type?: 'error' | 'warning' | 'info') => void;
}

const callGeminiWithRetry = async (ai: any, params: any, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    if (err?.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(ai, params, retries - 1, delay * 2);
    }
    throw err;
  }
};

export function NEPEducationHub({ getAI, speakText, speakingId, showToast }: NEPEducationHubProps) {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<'textbooks' | 'ai_generator' | 'lesson_plans' | 'glossary'>('textbooks');

  // Textbooks Tab State
  const [selectedClassNum, setSelectedClassNum] = useState<number>(3);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [scriptMode, setScriptMode] = useState<'deva' | 'olchiki'>('deva');
  const [activeChapter, setActiveChapter] = useState<TextbookChapter | null>(PRELOADED_CHAPTERS[1]); // Class 3 default
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [showQuestionFeedback, setShowQuestionFeedback] = useState<Record<string, boolean>>({});

  // AI Generator Tab State
  const [genClass, setGenClass] = useState<number>(10);
  const [genSubject, setGenSubject] = useState<string>('Science (विज्ञान)');
  const [genTopic, setGenTopic] = useState<string>('');
  const [pastedTextbookText, setPastedTextbookText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [copiedAiContent, setCopiedAiContent] = useState<boolean>(false);

  // Lesson Plan Studio State
  const [lpTopic, setLpTopic] = useState<string>('Photosynthesis in Local Plants');
  const [lpClass, setLpClass] = useState<number>(6);
  const [lpResult, setLpResult] = useState<string>('');
  const [isGeneratingLp, setIsGeneratingLp] = useState<boolean>(false);

  // Glossary Search State
  const [glossarySearch, setGlossarySearch] = useState<string>('');

  // Update available subjects when class changes
  const currentClassInfo = CBSE_CLASSES.find(c => c.number === selectedClassNum) || CBSE_CLASSES[0];

  // Filter preloaded chapters
  const filteredChapters = PRELOADED_CHAPTERS.filter(ch => {
    const matchesClass = ch.classNumber === selectedClassNum;
    const matchesSub = selectedSubjectFilter === 'All' || ch.subject.includes(selectedSubjectFilter);
    return matchesClass && matchesSub;
  });

  // Collect all glossary terms from preloaded chapters
  const allGlossaryTerms: KeyTerm[] = [];
  PRELOADED_CHAPTERS.forEach(ch => {
    ch.keyTerms.forEach(term => {
      if (!allGlossaryTerms.some(t => t.english.toLowerCase() === term.english.toLowerCase())) {
        allGlossaryTerms.push(term);
      }
    });
  });

  const filteredGlossary = allGlossaryTerms.filter(term => 
    term.english.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    term.hindi.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    term.santaliDeva.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    term.santaliOlChiki.includes(glossarySearch)
  );

  const handleGenerateAiChapter = async () => {
    if (!genTopic.trim() && !pastedTextbookText.trim()) {
      showToast('Please enter a topic name or paste textbook paragraph', 'warning');
      return;
    }

    setIsGenerating(true);
    setAiGeneratedContent('');

    try {
      const ai = getAI();
      const topicText = genTopic || pastedTextbookText;
      const dbSearch = searchFullSantaliDatabase(topicText);
      const prompt = `You are a visionary CBSE Aligned Bilingual Textbook Author specialized in NEP 2020 Mother Tongue Education for Santali tribal students.
Class Level: Class ${genClass}
Subject: ${genSubject}
Topic/Content: "${topicText}"

SANTALI GROUND TRUTH DATASET CONTEXT:
${dbSearch.groundTruthContext}

Generate a complete, structured CBSE Textbook Chapter Lesson translated into Santali (Devanagari script) with Hindi and English explanations.

Include the following sections in Markdown:
1. 📖 **Chapter Header (अध्याय शीर्षक)**: English, Hindi, and Santali (Devanagari) titles.
2. 💡 **Summary & Concept (पाठ सारांश)**: Simple bilingual overview connecting the concept to village/tribal environment.
3. 📝 **Detailed Chapter Breakdown (अध्याय विस्तृत विवरण)**:
   - 2-3 sections explaining core CBSE concepts with paragraph-by-paragraph Santali Devanagari translation.
   - Include a "🌿 Tribal & Village Analogy (स्थानीय जीवन उदाहरण)" for every section to make it easy for rural kids.
4. 🔑 **Key Vocabulary Table (शब्दार्थ सारणी)**: 5 core terms with columns for English, Hindi, Santali (Devanagari), and Romanized pronunciation.
5. ✍️ **Self-Assessment Quiz (अभ्यास प्रश्न)**: 3 Multiple choice questions in Santali Devanagari with options and answer keys in Hindi.

STRICT RULE: Santali MUST be written in Devanagari script. Do not output Ol Chiki font characters unless explicitly requested.`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.3 }
      });

      setAiGeneratedContent(response.text || 'Content generation failed.');
      showToast('CBSE Santali Chapter Generated!', 'info');
    } catch (err) {
      console.error(err);
      showToast('AI Generation failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLessonPlan = async () => {
    if (!lpTopic.trim()) {
      showToast('Please enter a lesson topic', 'warning');
      return;
    }

    setIsGeneratingLp(true);
    setLpResult('');

    try {
      const ai = getAI();
      const prompt = `You are an expert NEP 2020 Teacher Educator crafting an exemplar Bilingual Classroom Lesson Plan for rural tribal schools in Jharkhand/Odisha/West Bengal.
Class: Class ${lpClass}
Topic: "${lpTopic}"

Generate a complete, practical NEP 2020 Lesson Plan in Markdown:
- 🎯 **Learning Outcomes (अधिगम प्रतिफल)**: What students will master (Bilingual).
- 🎨 **Warm-up Story / Tribal Folk Context (कक्षा प्रवेश - लोककथा/संदर्भ)**: An engaging 2-minute story in Santali Devanagari & Hindi to start the class.
- 🏫 **Interactive Teaching Activity (गतिविधि आधारित शिक्षण)**: Hands-on classroom exercise using local materials (leaves, soil, seeds, stones).
- 🗣️ **Mother Tongue Bridge Words (मातृभाषा सेतु शब्द)**: 5 crucial terms translated to Santali.
- 📊 **Continuous Assessment (सतत मूल्यांकन)**: 3 quick verbal questions for teachers to gauge understanding.

STRICT RULE: Santali text in Devanagari script.`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.3 }
      });

      setLpResult(response.text || 'Lesson plan generation failed.');
      showToast('NEP Lesson Plan Generated!', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate lesson plan.', 'error');
    } finally {
      setIsGeneratingLp(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAiContent(true);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedAiContent(false), 2000);
  };

  const handleAnswerQuestion = (qId: string, optionIdx: number) => {
    setUserQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setShowQuestionFeedback(prev => ({ ...prev, [qId]: true }));
  };

  return (
    <div id="nep-education-hub-panel" className="w-full h-full flex flex-col bg-slate-950/80 rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
      
      {/* TOP HEADER */}
      <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
            <School className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                NEP शिक्षा सेतु <span className="text-cyan-400 text-sm font-normal">(CBSE Class 1-12 Santali Portal)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                NEP 2020 Aligned
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Full curriculum textbooks (Class I to XII) with bilingual Santali translation, audio reader & NEP lesson studio
            </p>
          </div>
        </div>

        {/* Script Toggle & Navigation */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center bg-slate-950 border border-cyan-500/30 rounded-xl p-1 gap-1">
            <button
              onClick={() => setScriptMode('deva')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                scriptMode === 'deva' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              देवनागरी (Devanagari)
            </button>
            <button
              onClick={() => setScriptMode('olchiki')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                scriptMode === 'olchiki' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              ᱚᱞ ᱪᱤᱠᱤ (Ol Chiki)
            </button>
          </div>
        </div>
      </div>

      {/* SUB-NAV TABS */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-cyan-500/15 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('textbooks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'textbooks'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-300'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>CBSE Class 1-12 Library (पाठ्यपुस्तकें)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_generator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'ai_generator'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>AI Custom Textbook Builder (कस्टम अध्याय)</span>
        </button>

        <button
          onClick={() => setActiveTab('lesson_plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'lesson_plans'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-300'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>NEP Teacher Lesson Studio (शिक्षक पाठ योजना)</span>
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'glossary'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-300'
          }`}
        >
          <BookMarked className="w-4 h-4 text-cyan-400" />
          <span>Santali Academic Glossary (शब्दावली)</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        
        {/* ==================== TAB 1: CBSE CLASS 1-12 TEXTBOOK LIBRARY ==================== */}
        {activeTab === 'textbooks' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
            
            {/* LEFT COLUMN: CLASS & CHAPTER SELECTOR (4 COLS) */}
            <div className="lg:col-span-4 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-4 flex flex-col gap-4 overflow-hidden backdrop-blur-md">
              
              {/* Class Filter Grid */}
              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-2 block flex items-center justify-between">
                  <span>Select Class (कक्षा चुनें)</span>
                  <span className="text-slate-400 font-normal">{currentClassInfo.stage}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CBSE_CLASSES.map(cls => (
                    <button
                      key={cls.number}
                      onClick={() => {
                        setSelectedClassNum(cls.number);
                        const match = PRELOADED_CHAPTERS.find(ch => ch.classNumber === cls.number);
                        setActiveChapter(match || null);
                      }}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                        selectedClassNum === cls.number
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 scale-105'
                          : 'bg-slate-950/60 text-slate-300 border-cyan-500/10 hover:border-cyan-500/30'
                      }`}
                    >
                      Class {cls.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Description Banner */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs text-cyan-200/80 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="line-clamp-2">{currentClassInfo.description}</span>
              </div>

              {/* Chapter List for selected class */}
              <div className="flex-1 flex flex-col overflow-hidden border-t border-cyan-500/15 pt-3">
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-2 block">
                  Class {selectedClassNum} Chapters (अध्याय)
                </label>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                  {filteredChapters.length > 0 ? (
                    filteredChapters.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChapter(ch)}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex flex-col gap-1 ${
                          activeChapter?.id === ch.id
                            ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10'
                            : 'bg-slate-950/50 border-cyan-500/10 hover:border-cyan-500/30 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            Ch {ch.chapterNumber} • {ch.subject}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${activeChapter?.id === ch.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-1 mt-1">
                          {ch.titleHindi}
                        </h4>
                        <p className="text-[11px] text-amber-300 font-hindi line-clamp-1">
                          {scriptMode === 'deva' ? ch.titleSantaliDeva : ch.titleOlChiki}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-cyan-500/10">
                      <p className="mb-2 font-medium text-slate-400">Preloaded sample chapter not in quick offline cache for Class {selectedClassNum}.</p>
                      <button
                        onClick={() => {
                          setActiveTab('ai_generator');
                          setGenClass(selectedClassNum);
                        }}
                        className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs hover:bg-cyan-500/30 transition-all font-semibold"
                      >
                        Generate Class {selectedClassNum} Chapter with AI →
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: CHAPTER INTERACTIVE READER (8 COLS) */}
            <div className="lg:col-span-8 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 flex flex-col overflow-hidden backdrop-blur-md">
              {activeChapter ? (
                <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar space-y-6 pr-2">
                  
                  {/* Chapter Header Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 border border-cyan-500/30 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950">
                        Class {activeChapter.classNumber} • {activeChapter.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Chapter {activeChapter.chapterNumber}</span>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-white mb-1">
                      {activeChapter.titleHindi}
                    </h1>
                    <h2 className="text-base sm:text-xl font-bold text-amber-300 font-hindi mb-2">
                      {scriptMode === 'deva' ? activeChapter.titleSantaliDeva : activeChapter.titleOlChiki}
                    </h2>
                    <p className="text-xs text-cyan-200/70 italic font-mono mb-4">
                      {activeChapter.titleEnglish}
                    </p>

                    {/* Audio Summary Bar */}
                    <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                      <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                        {scriptMode === 'deva' ? activeChapter.summarySantaliDeva : activeChapter.summaryHindi}
                      </p>
                      <button
                        onClick={() => speakText(
                          scriptMode === 'deva' ? activeChapter.summarySantaliDeva : activeChapter.summaryHindi, 
                          `ch-summary-${activeChapter.id}`,
                          'hi-IN'
                        )}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                          speakingId === `ch-summary-${activeChapter.id}`
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                        }`}
                      >
                        {speakingId === `ch-summary-${activeChapter.id}` ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{speakingId === `ch-summary-${activeChapter.id}` ? 'Stop Audio' : 'Listen Summary'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Chapter Sections */}
                  <div className="space-y-5">
                    <h3 className="text-xs uppercase font-black text-cyan-400 tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-300" />
                      Textbook Content Sections (अध्याय खंड)
                    </h3>

                    {activeChapter.sections.map((sec, idx) => (
                      <div key={sec.id} className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-3 relative">
                        
                        {/* Section Title */}
                        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
                          <h4 className="font-bold text-sm text-cyan-200 flex items-center gap-2">
                            <span>{scriptMode === 'deva' ? sec.headingSantaliDeva : sec.headingHindi}</span>
                          </h4>
                          <button
                            onClick={() => speakText(
                              scriptMode === 'deva' ? sec.contentSantaliDeva : sec.contentHindi,
                              `sec-audio-${sec.id}`,
                              'hi-IN'
                            )}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                            title="Listen Section"
                          >
                            {speakingId === `sec-audio-${sec.id}` ? <Square className="w-3.5 h-3.5 text-rose-400 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Hindi Text */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Hindi (हिंदी पाठ्यपुस्तक)</span>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{sec.contentHindi}</p>
                        </div>

                        {/* Santali Text Dual Script */}
                        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
                          <span className="text-[10px] font-bold uppercase text-cyan-400 block mb-1">
                            Santali ({scriptMode === 'deva' ? 'संथाली देवनागरी' : 'ᱚᱞ ᱪᱤᱠᱤ Ol Chiki'})
                          </span>
                          <p className="text-sm sm:text-base font-bold text-amber-200 leading-relaxed font-hindi">
                            {scriptMode === 'deva' ? sec.contentSantaliDeva : sec.contentOlChiki}
                          </p>
                        </div>

                        {/* Village Analogy Box */}
                        {sec.villageAnalogy && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold block text-amber-200">ग्राम्य संदर्भ (Village Analogy):</strong>
                              <span>{sec.villageAnalogy}</span>
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>

                  {/* Key Academic Glossary Table */}
                  {activeChapter.keyTerms && activeChapter.keyTerms.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-3">
                      <h3 className="text-xs uppercase font-black text-cyan-400 tracking-wider flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-cyan-300" />
                        Key Glossary Terms (अध्याय शब्दावली)
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-cyan-500/20 text-slate-400 text-[10px] uppercase">
                              <th className="p-2">English</th>
                              <th className="p-2">Hindi</th>
                              <th className="p-2">Santali (Devanagari)</th>
                              <th className="p-2">Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)</th>
                              <th className="p-2">Pronunciation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-cyan-500/10 text-slate-200">
                            {activeChapter.keyTerms.map((kt, i) => (
                              <tr key={i} className="hover:bg-cyan-900/10">
                                <td className="p-2 font-mono font-bold text-cyan-300">{kt.english}</td>
                                <td className="p-2">{kt.hindi}</td>
                                <td className="p-2 font-bold text-amber-300">{kt.santaliDeva}</td>
                                <td className="p-2 text-amber-200">{kt.santaliOlChiki}</td>
                                <td className="p-2 text-slate-400 italic">{kt.romanized}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Practice Questions & Self Assessment */}
                  {activeChapter.practiceQuestions && activeChapter.practiceQuestions.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-3">
                      <h3 className="text-xs uppercase font-black text-cyan-400 tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-300" />
                        Self-Assessment Practice (अभ्यास प्रश्न)
                      </h3>

                      {activeChapter.practiceQuestions.map((q, idx) => {
                        const selectedAns = userQuizAnswers[q.id];
                        const showFeedback = showQuestionFeedback[q.id];

                        return (
                          <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/15 space-y-3">
                            <p className="text-sm font-bold text-cyan-100">
                              Q{idx + 1}. {q.questionSantali}
                            </p>
                            <p className="text-xs text-slate-400 font-hindi">
                              ({q.questionHindi})
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = selectedAns === oIdx;
                                const isCorrect = oIdx === q.answerIndex;
                                let btnClass = "bg-slate-950/80 border-cyan-500/20 text-slate-300 hover:border-cyan-400";
                                
                                if (showFeedback) {
                                  if (isCorrect) {
                                    btnClass = "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold";
                                  } else if (isSelected && !isCorrect) {
                                    btnClass = "bg-rose-500/20 border-rose-400 text-rose-200 font-bold";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleAnswerQuestion(q.id, oIdx)}
                                    className={`p-3 rounded-xl border text-xs text-left transition-all ${btnClass}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {showFeedback && (
                              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs text-cyan-200">
                                <strong>व्याख्या (Explanation):</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <BookOpen className="w-16 h-16 mb-4 text-cyan-500/20" />
                  <p className="text-sm">Select a Class and Chapter from the left panel to begin reading.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 2: AI CUSTOM TEXTBOOK BUILDER ==================== */}
        {activeTab === 'ai_generator' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
            
            {/* Left Controls (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-cyan-500/15 pb-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Generate Any CBSE Class 1-12 Topic</h3>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Class Level</label>
                <select
                  value={genClass}
                  onChange={(e) => setGenClass(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                >
                  {CBSE_CLASSES.map(c => (
                    <option key={c.number} value={c.number}>Class {c.number} ({c.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Subject Name</label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  placeholder="e.g. Science, Math, Social Studies, Physics, Chemistry"
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Topic Name (or Chapter Title)</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Water Cycle, Solar System, Integers, Cell Division"
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Or Paste Textbook Paragraph to Translate</label>
                <textarea
                  value={pastedTextbookText}
                  onChange={(e) => setPastedTextbookText(e.target.value)}
                  placeholder="Paste any CBSE textbook paragraph in Hindi or English here..."
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 h-24 resize-none"
                />
              </div>

              <button
                onClick={handleGenerateAiChapter}
                disabled={isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Authoring Santali Lesson...' : 'Build Santali Chapter'}</span>
              </button>
            </div>

            {/* Right Result Output (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 flex flex-col overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-3">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-300" />
                  Generated Santali Chapter
                </span>

                {aiGeneratedContent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(aiGeneratedContent)}
                      className="p-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 hover:bg-cyan-900/30"
                    >
                      {copiedAiContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                    <button
                      onClick={() => speakText(aiGeneratedContent, 'ai-chapter-speech', 'hi-IN')}
                      className="p-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 hover:bg-cyan-900/30"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {aiGeneratedContent ? (
                  <div className="markdown-body text-cyan-100 text-sm leading-relaxed space-y-4">
                    <Markdown>{aiGeneratedContent}</Markdown>
                  </div>
                ) : isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                    <p className="text-xs text-cyan-300 font-bold uppercase tracking-widest animate-pulse">
                      Generating CBSE Class {genClass} Santali Chapter...
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <Sparkles className="w-16 h-16 mb-4 text-cyan-500/20" />
                    <p className="text-sm">Enter a topic and click "Build Santali Chapter" to generate instant bilingual textbook materials.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: NEP TEACHER LESSON STUDIO ==================== */}
        {activeTab === 'lesson_plans' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
            
            <div className="lg:col-span-5 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-cyan-500/15 pb-3">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">NEP 2020 Teacher Lesson Plan Creator</h3>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Class Level</label>
                <select
                  value={lpClass}
                  onChange={(e) => setLpClass(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                >
                  {CBSE_CLASSES.map(c => (
                    <option key={c.number} value={c.number}>Class {c.number} ({c.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1 block">Classroom Topic</label>
                <input
                  type="text"
                  value={lpTopic}
                  onChange={(e) => setLpTopic(e.target.value)}
                  placeholder="e.g. Cleanliness & Health, Soil Conservation, Basic Addition"
                  className="w-full p-3 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 space-y-2">
                <strong className="font-bold block text-cyan-300">NEP 2020 Mandate:</strong>
                <p>Ensures teachers can seamlessly integrate native Santali folk stories, local environment analogies, and mother-tongue vocabulary into daily CBSE lesson plans.</p>
              </div>

              <button
                onClick={handleGenerateLessonPlan}
                disabled={isGeneratingLp}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isGeneratingLp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingLp ? 'Creating Lesson Plan...' : 'Generate Lesson Plan'}</span>
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 flex flex-col overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-3">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-300" />
                  Classroom Lesson Plan Output
                </span>

                {lpResult && (
                  <button
                    onClick={() => copyToClipboard(lpResult)}
                    className="p-1.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1 hover:bg-cyan-900/30"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Plan
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {lpResult ? (
                  <div className="markdown-body text-cyan-100 text-sm leading-relaxed space-y-4">
                    <Markdown>{lpResult}</Markdown>
                  </div>
                ) : isGeneratingLp ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest animate-pulse">
                      Synthesizing NEP Lesson Plan...
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                    <GraduationCap className="w-16 h-16 mb-4 text-cyan-500/20" />
                    <p className="text-sm">Select a topic to generate an interactive teacher lesson plan aligned with NEP 2020.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: SANTALI ACADEMIC GLOSSARY ==================== */}
        {activeTab === 'glossary' && (
          <div className="h-full flex flex-col bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-5 overflow-hidden backdrop-blur-md">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-500/15">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-cyan-400" />
                  Santali CBSE Academic Terminology Dictionary
                </h3>
                <p className="text-xs text-slate-400">Search technical terms across Science, Mathematics, Environmental Studies, and Governance</p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Search terms (e.g., Cell, Leaves, Plant)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredGlossary.map((term, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2 hover:border-cyan-400/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-300 text-sm">{term.english}</span>
                      <button
                        onClick={() => speakText(term.santaliDeva, `term-sp-${i}`, 'hi-IN')}
                        className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-400"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-slate-300">
                      <strong>Hindi:</strong> {term.hindi}
                    </div>

                    <div className="text-sm font-bold text-amber-300 font-hindi">
                      <strong>Santali:</strong> {term.santaliDeva}
                    </div>

                    <div className="text-xs text-amber-200">
                      <strong>Ol Chiki:</strong> {term.santaliOlChiki}
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      Pronunciation: {term.romanized}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
