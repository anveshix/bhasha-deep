import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, Square, RefreshCw, ArrowRightLeft, Sparkles, 
  Globe, AlertTriangle, Copy, Check, Stethoscope, Building2, School, 
  Sprout, VolumeX, MessageSquare, ShieldAlert, ArrowRight
} from 'lucide-react';
import { validatePhoneticSantali } from '../lib/phoneticValidator';
import { searchFullSantaliDatabase } from '../data/santaliGrammarContext';

interface BhashaSetuBridgeProps {
  getAI: () => any;
  speakText: (text: string, id: string, lang?: string) => void;
  speakingId: string | null;
  user: any;
  db: any;
  showToast: (msg: string, type?: 'error' | 'warning' | 'info') => void;
}

interface PresetScenario {
  title: string;
  icon: React.ElementType;
  color: string;
  outsiderPhrase: string;
  localPhrase: string;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    title: "स्वास्थ्य सेवा (Healthcare)",
    icon: Stethoscope,
    color: "from-rose-500/20 to-red-600/20 text-rose-300 border-rose-500/30",
    outsiderPhrase: "आपको क्या तकलीफ है? दवाई लेने में कोई दिक्कत तो नहीं?",
    localPhrase: "इञाः बोहोः हासु एदिञ काना, डॉक्टर साओ ञापाम सानाञा।"
  },
  {
    title: "सरकारी योजना (Govt Schemes)",
    icon: Building2,
    color: "from-blue-500/20 to-cyan-600/20 text-cyan-300 border-cyan-500/30",
    outsiderPhrase: "राशन कार्ड और आधार कार्ड जमा करने की अंतिम तारीख क्या है?",
    localPhrase: "आतो रे राशन बाङ ञामोः काना, ओकोयाः ठीेन चलाव हुयुःआ?"
  },
  {
    title: "शिक्षा & स्कूल (Education)",
    icon: School,
    color: "from-emerald-500/20 to-teal-600/20 text-emerald-300 border-emerald-500/30",
    outsiderPhrase: "बच्चों की पढ़ाई कैसी चल रही है? स्कूल में किताबें मिल गई?",
    localPhrase: "गिद्राः ओल-पढ़हाओ नापाय गे चलाः काना, पोथो को ञाम कादा।"
  },
  {
    title: "कृषि & बाजार (Agriculture)",
    icon: Sprout,
    color: "from-amber-500/20 to-orange-600/20 text-amber-300 border-amber-500/30",
    outsiderPhrase: "फसल का दाम कितना है? इस बार बारिश कैसी हुई?",
    localPhrase: "दाः नापाय गे हुय अकाना, चाेष काम नापाय गे हुयुःआ।"
  }
];

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

export function BhashaSetuBridge({ getAI, speakText, speakingId, user, db, showToast }: BhashaSetuBridgeProps) {
  const [outsiderText, setOutsiderText] = useState('');
  const [outsiderInterimText, setOutsiderInterimText] = useState('');
  const [outsiderTranslation, setOutsiderTranslation] = useState('');
  const [isTranslatingOutsider, setIsTranslatingOutsider] = useState(false);
  const [isListeningOutsider, setIsListeningOutsider] = useState(false);

  const [localText, setLocalText] = useState('');
  const [localInterimText, setLocalInterimText] = useState('');
  const [localTranslation, setLocalTranslation] = useState('');
  const [isTranslatingLocal, setIsTranslatingLocal] = useState(false);
  const [isListeningLocal, setIsListeningLocal] = useState(false);

  const [phoneticValidation, setPhoneticValidation] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const outsiderRecRef = useRef<any>(null);
  const localRecRef = useRef<any>(null);
  const bridgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (localText) {
      const result = validatePhoneticSantali(localText);
      setPhoneticValidation(result);
    } else {
      setPhoneticValidation(null);
    }
  }, [localText]);

  const translatePhrase = async (
    text: string, 
    fromLang: string, 
    toLang: string, 
    setTranslation: (t: string) => void, 
    setIsTranslating: (b: boolean) => void,
    outputAudioId: string
  ) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    try {
      // Direct Real-time Database Search
      const dbSearch = searchFullSantaliDatabase(text.trim());
      if (dbSearch.exactHit) {
        const outText = dbSearch.exactHit.santaliDeva || dbSearch.exactHit.hindi;
        setTranslation(outText);
        speakText(outText, outputAudioId, 'hi-IN');
        setIsTranslating(false);
        return;
      }

      const ai = getAI();
      const prompt = `You are a real-time highly accurate bidirectional translation engine specialized in official, medical, and community interaction between outsiders (Hindi/English) and tribal Santali speakers.
Translate the following text from ${fromLang} to ${toLang}.
Source text: "${text}"

${dbSearch.groundTruthContext}

STRICT RULES:
1. Return ONLY the translation output string. Do not include quotes, tags, or conversational explanations.
2. Santali MUST be written strictly in Devanagari script (e.g. जोहार, चेकालेका मेनामा).
3. Ensure natural, respectful, and crystal-clear phrasing so both parties easily understand each other.`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.2 }
      });

      const resultText = (response.text || 'Translation failed.').trim();
      setTranslation(resultText);
      
      // Auto speak for hands-free live interpreting
      speakText(resultText, outputAudioId, 'hi-IN');
    } catch (err) {
      console.error('Translation error:', err);
      showToast('Translation service temporarily busy. Please try again.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOutsiderSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    translatePhrase(
      outsiderText, 
      'Hindi/English', 
      'Santali (Devanagari script)', 
      setOutsiderTranslation, 
      setIsTranslatingOutsider,
      'bridge-outsider-out'
    );
  };

  const handleLocalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    translatePhrase(
      localText, 
      'Santali (Devanagari script)', 
      'Hindi and English', 
      setLocalTranslation, 
      setIsTranslatingLocal,
      'bridge-local-out'
    );
  };

  const triggerSentenceTranslation = (
    textToTranslate: string,
    fromLang: string,
    toLang: string,
    setTranslation: (t: string) => void,
    setIsTranslating: (b: boolean) => void,
    audioId: string,
    isSentenceEnd: boolean
  ) => {
    if (bridgeTimerRef.current) clearTimeout(bridgeTimerRef.current);
    if (isSentenceEnd) {
      translatePhrase(textToTranslate, fromLang, toLang, setTranslation, setIsTranslating, audioId);
    } else {
      bridgeTimerRef.current = setTimeout(() => {
        translatePhrase(textToTranslate, fromLang, toLang, setTranslation, setIsTranslating, audioId);
      }, 600);
    }
  };

  const startListening = (side: 'outsider' | 'local') => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Speech Recognition not supported in this browser.', 'warning');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'hi-IN'; // Works for Hindi & Phonetic Santali Devanagari

    if (side === 'outsider') {
      rec.onstart = () => setIsListeningOutsider(true);
      rec.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }

        if (interim) {
          setOutsiderInterimText(interim);
        }

        if (finalStr) {
          setOutsiderInterimText('');
          setOutsiderText(prev => {
            const nextVal = (prev ? prev + ' ' : '') + finalStr;
            const isSentenceEnd = /[.?!।\n]\s*$/.test(finalStr.trim());
            triggerSentenceTranslation(
              nextVal,
              'Hindi/English',
              'Santali (Devanagari script)',
              setOutsiderTranslation,
              setIsTranslatingOutsider,
              'bridge-outsider-out',
              isSentenceEnd
            );
            return nextVal;
          });
        }
      };
      rec.onend = () => {
        setIsListeningOutsider(false);
        setOutsiderInterimText('');
      };
      outsiderRecRef.current = rec;
      rec.start();
    } else {
      rec.onstart = () => setIsListeningLocal(true);
      rec.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }

        if (interim) {
          setLocalInterimText(interim);
        }

        if (finalStr) {
          setLocalInterimText('');
          setLocalText(prev => {
            const nextVal = (prev ? prev + ' ' : '') + finalStr;
            const isSentenceEnd = /[.?!।\n]\s*$/.test(finalStr.trim());
            triggerSentenceTranslation(
              nextVal,
              'Santali (Devanagari script)',
              'Hindi and English',
              setLocalTranslation,
              setIsTranslatingLocal,
              'bridge-local-out',
              isSentenceEnd
            );
            return nextVal;
          });
        }
      };
      rec.onend = () => {
        setIsListeningLocal(false);
        setLocalInterimText('');
      };
      localRecRef.current = rec;
      rec.start();
    }
  };

  const stopListening = (side: 'outsider' | 'local') => {
    if (side === 'outsider' && outsiderRecRef.current) {
      outsiderRecRef.current.stop();
      setIsListeningOutsider(false);
    } else if (side === 'local' && localRecRef.current) {
      localRecRef.current.stop();
      setIsListeningLocal(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetAll = () => {
    setOutsiderText('');
    setOutsiderTranslation('');
    setLocalText('');
    setLocalTranslation('');
    setPhoneticValidation(null);
    showToast('Conversation reset', 'info');
  };

  const applyPreset = (scenario: PresetScenario) => {
    setOutsiderText(scenario.outsiderPhrase);
    setLocalText(scenario.localPhrase);
    showToast(`Loaded scenario: ${scenario.title}`, 'info');
  };

  return (
    <div id="bhasha-setu-bridge-panel" className="w-full h-full flex flex-col bg-slate-950/80 rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
      
      {/* HEADER SECTION */}
      <div className="p-4 sm:px-6 bg-slate-900/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                भाषा सेतु <span className="text-amber-400 font-normal text-sm">(Live Tribal-Outsider Bridge)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Dual Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Bidirectional real-time field translator between Hindi/English speakers & Santali tribal citizens
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button 
            onClick={resetAll}
            className="px-3.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-cyan-300 text-xs font-semibold rounded-xl border border-cyan-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Conversation</span>
          </button>
        </div>
      </div>

      {/* QUICK FIELD SCENARIOS BAR */}
      <div className="px-4 py-2 bg-slate-900/50 border-b border-cyan-500/10 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Field Scenarios:
        </span>
        {PRESET_SCENARIOS.map((scenario, i) => {
          const Icon = scenario.icon;
          return (
            <button
              key={i}
              onClick={() => applyPreset(scenario)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 bg-slate-950/60 hover:bg-slate-900 transition-all shrink-0 ${scenario.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{scenario.title}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN DUAL INTERPRETER SPLIT VIEW */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto custom-scrollbar relative">
        
        {/* LEFT CHANNEL: OUTSIDE WORLD (HINDI / ENGLISH) */}
        <div className="flex flex-col bg-slate-900/70 border border-cyan-500/25 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
          
          {/* Channel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              <h3 className="font-bold text-sm text-cyan-100 flex items-center gap-1.5">
                Official / Visitor Channel
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Hindi & English
            </span>
          </div>

          {/* Form Input */}
          <form onSubmit={handleOutsiderSubmit} className="flex-1 flex flex-col gap-3">
            <div className="relative flex-1 min-h-[120px] sm:min-h-[140px]">
              <textarea
                value={outsiderText + (outsiderInterimText ? (outsiderText ? ' ' : '') + outsiderInterimText : '')}
                onChange={(e) => {
                  setOutsiderText(e.target.value);
                  setOutsiderInterimText('');
                }}
                placeholder="यहाँ हिंदी या अंग्रेजी में लिखें या नीचे माइक दबाकर बोलें... (Type Hindi/English or click mic)"
                className="w-full h-full p-3.5 bg-slate-950/80 border border-cyan-500/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl resize-none outline-none text-white placeholder:text-slate-500 text-sm leading-relaxed"
              />
              {(outsiderText || outsiderInterimText) && (
                <button
                  type="button"
                  onClick={() => { setOutsiderText(''); setOutsiderInterimText(''); }}
                  className="absolute top-2 right-2 text-xs text-slate-500 hover:text-rose-400 p-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Input Action Controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => isListeningOutsider ? stopListening('outsider') : startListening('outsider')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isListeningOutsider 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' 
                    : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                }`}
              >
                {isListeningOutsider ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListeningOutsider ? 'Listening...' : 'Voice Input'}</span>
              </button>

              <button 
                type="submit"
                disabled={isTranslatingOutsider || !outsiderText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-40 shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                {isTranslatingOutsider ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Translate to Santali</span>
              </button>
            </div>
          </form>

          {/* Translation Output Box */}
          <div className="mt-4 pt-3 border-t border-cyan-500/15 flex flex-col bg-slate-950/90 rounded-2xl p-4 border border-cyan-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Santali Devanagari Output (संथाली देवनागरी)
              </span>
              {outsiderTranslation && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakText(outsiderTranslation, 'outsider-out', 'hi-IN')}
                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                    title="Speak Translation"
                  >
                    {speakingId === 'outsider-out' ? <Square className="w-3.5 h-3.5 fill-current text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(outsiderTranslation, 'outsider-copy')}
                    className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                    title="Copy Text"
                  >
                    {copiedId === 'outsider-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {isTranslatingOutsider ? (
              <div className="animate-pulse space-y-2 py-3">
                <div className="h-4 bg-cyan-500/20 rounded w-3/4" />
                <div className="h-4 bg-cyan-500/10 rounded w-1/2" />
              </div>
            ) : outsiderTranslation ? (
              <p className="text-lg sm:text-xl font-bold text-emerald-200 leading-relaxed font-hindi">
                {outsiderTranslation}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Translated Santali speech/text will appear here...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT CHANNEL: SANTALI TRIBAL SPEAKER */}
        <div className="flex flex-col bg-slate-900/70 border border-amber-500/25 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
          
          {/* Channel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/15 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
              <h3 className="font-bold text-sm text-amber-100 flex items-center gap-1.5">
                Tribal Speaker Channel
              </h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Santali (Devanagari)
            </span>
          </div>

          {/* Form Input */}
          <form onSubmit={handleLocalSubmit} className="flex-1 flex flex-col gap-3">
            <div className="relative flex-1 min-h-[120px] sm:min-h-[140px]">
              <textarea
                value={localText + (localInterimText ? (localText ? ' ' : '') + localInterimText : '')}
                onChange={(e) => {
                  setLocalText(e.target.value);
                  setLocalInterimText('');
                }}
                placeholder="संथाली में बोलें या देवनागरी में लिखें (जैसे: जोहार! चेकालेका मेनामा?)..."
                className="w-full h-full p-3.5 bg-slate-950/80 border border-amber-500/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-2xl resize-none outline-none text-white placeholder:text-slate-500 text-sm leading-relaxed"
              />
              {(localText || localInterimText) && (
                <button
                  type="button"
                  onClick={() => { setLocalText(''); setLocalInterimText(''); }}
                  className="absolute top-2 right-2 text-xs text-slate-500 hover:text-rose-400 p-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Phonetic Validator Widget */}
            {phoneticValidation && (!phoneticValidation.isValid || phoneticValidation.suggestions.length > 0) && (
              <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="line-clamp-1">
                  Phonetic refinement active for Santali vocabulary
                </span>
              </div>
            )}

            {/* Input Action Controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => isListeningLocal ? stopListening('local') : startListening('local')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isListeningLocal 
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30' 
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {isListeningLocal ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListeningLocal ? 'Listening...' : 'Santali Voice'}</span>
              </button>

              <button 
                type="submit"
                disabled={isTranslatingLocal || !localText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-40 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                {isTranslatingLocal ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Translate to Hindi/Eng</span>
              </button>
            </div>
          </form>

          {/* Translation Output Box */}
          <div className="mt-4 pt-3 border-t border-amber-500/15 flex flex-col bg-slate-950/90 rounded-2xl p-4 border border-amber-500/20 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Hindi & English Output (अनुवादित हिंदी/अंग्रेजी)
              </span>
              {localTranslation && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speakText(localTranslation, 'local-out', 'hi-IN')}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                    title="Speak Translation"
                  >
                    {speakingId === 'local-out' ? <Square className="w-3.5 h-3.5 fill-current text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopy(localTranslation, 'local-copy')}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                    title="Copy Text"
                  >
                    {copiedId === 'local-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {isTranslatingLocal ? (
              <div className="animate-pulse space-y-2 py-3">
                <div className="h-4 bg-amber-500/20 rounded w-3/4" />
                <div className="h-4 bg-amber-500/10 rounded w-1/2" />
              </div>
            ) : localTranslation ? (
              <p className="text-lg sm:text-xl font-bold text-amber-200 leading-relaxed">
                {localTranslation}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                Translated Hindi & English speech/text will appear here...
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
