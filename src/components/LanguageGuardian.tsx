import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Search, Trash2, Send, Award, FileText, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { attributionFor } from '../lib/attribution';

interface LanguageGuardianProps {
  user: any;
  db: any;
  showToast: (msg: string, type?: 'error' | 'warning' | 'info') => void;
  getAI: () => any;
}

interface LocalContribution {
  id?: string;
  santali_deva: string;
  roman_student: string;
  pos: string;
  hindi: string;
  english: string;
  example_santali: string;
  example_hindi: string;
  contributed_by: string;
  timestamp: number;
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

export function LanguageGuardian({ user, db, showToast, getAI }: LanguageGuardianProps) {
  // Input fields for manual contribution
  const [santaliDeva, setSantaliDeva] = useState('');
  const [romanStudent, setRomanStudent] = useState('');
  const [pos, setPos] = useState('Noun (संज्ञा)');
  const [hindi, setHindi] = useState('');
  const [english, setEnglish] = useState('');
  const [exampleSantali, setExampleSantali] = useState('');
  const [exampleHindi, setExampleHindi] = useState('');

  // Bulk Glossary parser
  const [unstructuredGlossary, setUnstructuredGlossary] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedEntries, setParsedEntries] = useState<LocalContribution[]>([]);

  // Contribution history
  const [contributions, setContributions] = useState<LocalContribution[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load live community contributions from Firestore if logged in, otherwise local fallback
  useEffect(() => {
    if (!db) {
      const offlineList = JSON.parse(localStorage.getItem('local_contributions') || '[]');
      if (offlineList.length > 0) setContributions(offlineList);
      return;
    }
    try {
      const q = query(
        collection(db, 'contributions'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: LocalContribution[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as LocalContribution);
        });
        setContributions(list);
      }, (error) => {
        console.warn("Firestore read contributions fallback:", error);
        const offlineList = JSON.parse(localStorage.getItem('local_contributions') || '[]');
        if (offlineList.length > 0) setContributions(offlineList);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Firestore read contributions error", err);
    }
  }, [db, user]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!santaliDeva.trim() || !hindi.trim()) {
      showToast('Please fill in at least the Santali Devanagari and Hindi translation', 'warning');
      return;
    }

    setIsSubmitting(true);
    const newEntry: LocalContribution = {
      santali_deva: santaliDeva.trim(),
      roman_student: romanStudent.trim() || santaliDeva.trim(),
      pos,
      hindi: hindi.trim(),
      english: english.trim(),
      example_santali: exampleSantali.trim(),
      example_hindi: exampleHindi.trim(),
      contributed_by: attributionFor(user),
      timestamp: Date.now()
    };

    try {
      if (db && user) {
        await addDoc(collection(db, 'contributions'), newEntry);
        showToast('Successfully submitted to District Language Bank! 🎉', 'info');
      } else {
        // Save to local list if offline
        setContributions(prev => [newEntry, ...prev]);
        const offlineList = JSON.parse(localStorage.getItem('local_contributions') || '[]');
        offlineList.unshift(newEntry);
        localStorage.setItem('local_contributions', JSON.stringify(offlineList));
        showToast('Saved locally. Login to sync with District Language Bank!', 'info');
      }

      // Reset Form
      setSantaliDeva('');
      setRomanStudent('');
      setHindi('');
      setEnglish('');
      setExampleSantali('');
      setExampleHindi('');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParseGlossary = async () => {
    if (!unstructuredGlossary.trim()) {
      showToast('Please paste some unstructured text or glossary words first', 'warning');
      return;
    }

    setIsParsing(true);
    try {
      const ai = getAI();
      const prompt = `You are a linguistic database compiler.
You will be given unstructured Santali words, phrases, translation notes, or general text.
Your task is to parse this text, extract the vocabulary words and sentence examples, and output them as a clean JSON array of database entries.

Unstructured input text:
"${unstructuredGlossary}"

Format your response as a JSON array of objects with the exact schema below. Do not add markdown backticks or any conversational text around the JSON.
Schema:
[
  {
    "santali_deva": "string (Santali in Devanagari script)",
    "roman_student": "string (Romanized student pronunciation)",
    "pos": "Noun / Verb / Adjective / Pronoun / Phrase / Idiom",
    "hindi": "string (Hindi meaning)",
    "english": "string (English meaning)",
    "example_santali": "string (Example sentence in Santali Devanagari)",
    "example_hindi": "string (Example sentence in Hindi)"
  }
]`;

      const response = await callGeminiWithRetry(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.1 }
      });

      const responseText = response.text || '[]';
      // Clean possible markdown codeblocks
      const cleanedJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJSON);

      if (Array.isArray(parsed)) {
        const parsedWithMeta = parsed.map(item => ({
          ...item,
          contributed_by: attributionFor(user),
          timestamp: Date.now()
        }));
        setParsedEntries(parsedWithMeta);
        showToast(`Successfully extracted ${parsedWithMeta.length} terms!`, 'info');
      } else {
        showToast('Failed to parse into structured glossary objects', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error during AI glossary parsing. Check formatting.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const addParsedToBank = async (entry: LocalContribution, index: number) => {
    try {
      if (db && user) {
        await addDoc(collection(db, 'contributions'), entry);
      }
      setContributions(prev => [entry, ...prev]);
      setParsedEntries(prev => prev.filter((_, i) => i !== index));
      showToast('Saved to District Language Bank!', 'info');
    } catch (err) {
      showToast('Failed to save entry', 'error');
    }
  };

  return (
    <div id="language-guardian-panel" className="w-full flex-1 flex flex-col gap-4 overflow-hidden h-full">
      <div className="p-4 bg-slate-900/60 border border-cyan-500/20 rounded-2xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">भाषा प्रहरी: Community Vocab Guardian</h3>
            <p className="text-xs text-cyan-200/60">Contribute your digital Santali glossaries, typed vocabulary lists, or raw text to secure our language</p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-emerald-950/20 border border-emerald-500/10 px-4 py-2 rounded-xl text-xs text-emerald-400 font-bold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>District Guardian Level: Bronze</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        
        {/* Left Form Panel: Manual & AI Glossary Input (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-950/40 border border-cyan-500/10 rounded-3xl p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          
          <div className="border-b border-cyan-500/10 pb-3">
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Option 1: AI Bulk Glossary Parser (For lists/documents)
            </span>
            <p className="text-[11px] text-cyan-200/40 mt-1 leading-normal">
              Have an Excel list, digital dictionary, or scanned text? Paste it below and let the AI automatically organize, translate, and extract structured vocabulary cards.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={unstructuredGlossary}
              onChange={(e) => setUnstructuredGlossary(e.target.value)}
              placeholder="Example:
काठ (Wood) - संथाली में इसे 'सहान' कहते हैं। उदाहरण: सहान को आगुएदा (वे लकड़ी ला रहे हैं)।"
              className="w-full p-4 bg-slate-900/50 border border-cyan-500/10 rounded-2xl outline-none text-white text-xs h-28 resize-none"
            />
            <button
              onClick={handleParseGlossary}
              disabled={isParsing || !unstructuredGlossary.trim()}
              className="w-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            >
              {isParsing ? 'Processing AI Parser...' : 'Auto-Extract Vocabulary from Text'}
            </button>
          </div>

          {/* Render Parsed Entries */}
          {parsedEntries.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">AI Extracted Cards ({parsedEntries.length})</h4>
              <div className="space-y-2">
                {parsedEntries.map((pe, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-emerald-500/10 p-3 rounded-xl flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <p className="font-bold text-emerald-200">{pe.santali_deva} <span className="text-slate-400 font-normal">({pe.roman_student})</span></p>
                      <p className="text-[11px] text-cyan-100/50 mt-0.5">Hindi: {pe.hindi} | English: {pe.english}</p>
                    </div>
                    <button 
                      onClick={() => addParsedToBank(pe, idx)}
                      className="p-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-b border-cyan-500/10 pb-3 mt-4">
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider">Option 2: Manual Word Contributor</span>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">Santali (Devanagari)</label>
                <input
                  type="text"
                  required
                  value={santaliDeva}
                  onChange={(e) => setSantaliDeva(e.target.value)}
                  placeholder="e.g. चेकालेका"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">Romanization</label>
                <input
                  type="text"
                  value={romanStudent}
                  onChange={(e) => setRomanStudent(e.target.value)}
                  placeholder="e.g. cekaleka"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">POS</label>
                <select
                  value={pos}
                  onChange={(e) => setPos(e.target.value)}
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                >
                  <option>Noun (संज्ञा)</option>
                  <option>Verb (क्रिया)</option>
                  <option>Adjective (विशेषण)</option>
                  <option>Phrase (वाक्यांश)</option>
                  <option>Idiom (मुहावरा)</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">Hindi Translation</label>
                <input
                  type="text"
                  required
                  value={hindi}
                  onChange={(e) => setHindi(e.target.value)}
                  placeholder="कैसे हो"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">English Translation</label>
                <input
                  type="text"
                  value={english}
                  onChange={(e) => setEnglish(e.target.value)}
                  placeholder="How are you"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">Santali Sentence Example</label>
                <input
                  type="text"
                  value={exampleSantali}
                  onChange={(e) => setExampleSantali(e.target.value)}
                  placeholder="आम दो चेकालेका मेनामा?"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-cyan-400/70 font-semibold uppercase">Hindi Sentence Translation</label>
                <input
                  type="text"
                  value={exampleHindi}
                  onChange={(e) => setExampleHindi(e.target.value)}
                  placeholder="तुम कैसे हो?"
                  className="w-full p-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-xl outline-none text-white text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding entry...' : 'Submit Word to District Language Bank'}
            </button>
          </form>
        </div>

        {/* Right Panel: Contributions Registry List (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-950/40 border border-cyan-500/10 rounded-3xl p-5 flex flex-col overflow-hidden">
          <div className="border-b border-cyan-500/10 pb-3 mb-3">
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-300" />
              District Language Bank Registry (Contributions Feed)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {contributions.length > 0 ? (
              contributions.map((item, idx) => (
                <div key={item.id || idx} className="bg-slate-900/50 border border-cyan-500/10 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/30 transition-all">
                  <div className="absolute top-2 right-2 text-[9px] bg-cyan-950/40 border border-cyan-400/20 px-2 py-0.5 rounded text-cyan-400">
                    {item.pos}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white font-hindi">{item.santali_deva}</span>
                      <span className="text-xs text-cyan-400 italic font-medium">({item.roman_student})</span>
                    </div>
                    <div className="text-xs text-cyan-100/70">
                      <strong>Hindi:</strong> {item.hindi} {item.english && <span>| <strong>English:</strong> {item.english}</span>}
                    </div>
                    {item.example_santali && (
                      <div className="mt-2 text-xs bg-slate-950/40 p-2.5 rounded-lg border border-cyan-500/5">
                        <p className="font-bold text-cyan-200">Ex: {item.example_santali}</p>
                        <p className="text-slate-400 italic text-[11px] mt-0.5">Translation: {item.example_hindi}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 border-t border-cyan-500/5 pt-2 flex justify-between items-center text-[9px] text-slate-500">
                    <span>By: <strong className="text-cyan-400/70 font-semibold">{item.contributed_by}</strong></span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cyan-200/20">
                <ShieldCheck className="w-12 h-12 mb-2 text-cyan-500/10" />
                <p className="text-xs">No contributions found yet. Be the first to secure Santali words!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
