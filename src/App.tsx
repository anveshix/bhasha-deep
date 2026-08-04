import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Square, ArrowRightLeft, Send, BookOpen, GraduationCap, MessageSquare, Copy, CheckCircle2, Languages, User, FilePlus, Loader2, Leaf, X, ThumbsUp, ThumbsDown, Download, FileText, Settings, ShieldCheck, Zap, Search, AlertTriangle, Info, PanelLeftClose, Library, School, Globe, Sparkles, PlusCircle, Database, Upload, Trash2, Paperclip, FileCode } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { marked } from 'marked';
import { DictionaryEntry } from './types';
import { initialDictionary } from './data/dictionary';
import { validatePhoneticSantali, normalizeDialect, ValidationResult } from './lib/phoneticValidator';
import { santaliTTS } from './lib/santaliTTSEngine';
import { transliterateDevaToRoman } from './lib/transliteration';
import { SohraiRobot } from './components/SohraiRobot';
import { getSantaliLinguisticContext, parseTextOrMarkdownContent, NCERT_BHASHA_SANGAM_CONVERSATIONS, SANTALI_GRAMMAR_PARADIGMS, searchFullSantaliDatabase } from './data/santaliGrammarContext';

// Lazy load heavy submodules for instant initial paint & minimal bundle size
const BhashaSetuBridge = React.lazy(() => import('./components/BhashaSetuBridge').then(m => ({ default: m.BhashaSetuBridge })));
const NEPEducationHub = React.lazy(() => import('./components/NEPEducationHub').then(m => ({ default: m.NEPEducationHub })));
const LanguageGuardian = React.lazy(() => import('./components/LanguageGuardian').then(m => ({ default: m.LanguageGuardian })));
const LanguageTutor = React.lazy(() => import('./components/LanguageTutor').then(m => ({ default: m.LanguageTutor })));

const TabLoadingSkeleton = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-cyan-400 min-h-[400px]">
    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    <span className="text-xs text-cyan-300/70 font-mono tracking-widest uppercase animate-pulse">Loading Module...</span>
  </div>
);
import { 
  auth, 
  db, 
  loginWithGoogle, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit, 
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc
} from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const QUICK_TEMPLATES = [
  { label: '👋 Greetings', hi: 'जोहार! आप कैसे हैं?', sat: 'जोहार! चेकालेका मेनामा?' },
  { label: '🤔 Name (NCERT)', hi: 'आपका नाम क्या है?', sat: 'आमाक् ञतुमु चेत?' },
  { label: '🏫 Class (NCERT)', hi: 'आप किस कक्षा में पढ़ते हैं?', sat: 'आम दो ऑका चानच रेम ऑलॉक् काना?' },
  { label: '🏠 Residence', hi: 'आप कहाँ रहते हैं?', sat: 'आम दो ओकारेम ताहनँा ?' },
  { label: '✍️ Career (NCERT)', hi: 'मैं लेखक बनना चाहता हूँ।', sat: 'इञ दो ओनोकल्ा ़ बेनावोक् सानाञ काना।' },
  { label: '🏃 Sports (NCERT)', hi: 'मुझे बाहर खेलना पसंद है, जैसे कबड्डी।', sat: 'ईञ दो बाहरे खेल गेञ कुसीयाक् आ जेलेका कबड्डी।' },
  { label: '🚶 Where going?', hi: 'आप कहां जा रहे हैं?', sat: 'आम दो ओकातेम सेनोक् काना?' },
  { label: '🆘 Urgent help', hi: 'कृपया मेरी मदद करें।', sat: 'दया खाते इञ गोड़ोअञ मे।' },
  { label: '🍽️ Food/Drink', hi: 'मुझे भूख और प्यास लगी है।', sat: 'इञ रेङ्गेच आर तेताङ कीदिञा।' },
  { label: '✨ Awesome', hi: 'यह बहुत अच्छा है।', sat: 'नुवा दो आडी मोज गेया।' },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Gemini API
const getApiKey = () => {
  // @ts-ignore
  return localStorage.getItem('custom_gemini_key') || process.env.GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_API_KEY || '';
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

type Attachment = {
  name: string;
  mimeType: string;
  data: string;
};

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are a real-time Santali Translator with "God Mode" linguistic capabilities.

Your primary function is to provide direct, high-quality translations between:
- Santali ↔ Hindi ↔ English

━━━━━━━━━━━━━━━━━━━━━━━
⚙️ CORE LOGIC & RULES:
- Output ONLY the translated text.
- No explanation, no labels, no original text.
- Auto-detect source language.
- Use natural, real spoken Santali (not literal/robotic).
- Preserve tone (formal/informal).
- Santali MUST be written ONLY in Devanagari script.
- GOD MODE ASR HANDLING: If translating from Santali to Hindi/English, be aware that the input text might be generated by a Hindi voice recognition engine. It will sound like Santali phonetically but spelled using incorrect Hindi words (e.g., 'आम दो', 'इन', 'चेत' written as separate Hindi words). Use your advanced phonetic understanding to reconstruct the intended Santali meaning before translating.
- If unsure, return the closest natural equivalent.
- Never return blank.

${getSantaliLinguisticContext()}

CRITICAL: You must append the exact text "[END_OF_TRANSLATION]" at the very end of your response when you have fully completed the task.`;

const VOICE_ASR_SYSTEM_INSTRUCTION = `ROLE:
Strict translation pipe. ZERO conversation, ZERO filler, ZERO acknowledgments. You possess "God Mode" phonetic understanding.

TASK:
Translate the input speech immediately, accurately, and directly.

RULES:
- Output ONLY the translated text.
- Do NOT include conversational filler, greetings, or acknowledgments.
- GOD MODE PHONETIC RECONSTRUCTION: If the source is Santali, the text provided is likely a Hindi speech-to-text transcript of Santali speech. It consists of phonetically similar Hindi words. You must "listen" to the vibrations of the text (read it phonetically), reconstruct the true Santali sentence, and ONLY output the correct translation in the target language.
- Do NOT add internal tags.
- Direct output only.

${getSantaliLinguisticContext()}`;

const DICTIONARY_AI_PROMPT = `You are “Santali Language Intelligence Engine – Pro Max” acting as a Semantic Dictionary, featuring "God Mode" phonetic intuition.

STRICT RULE: All Santali text MUST be written ONLY in Devanagari script. 
CRITICAL: Do NOT use Ol Chiki script. If you use Ol Chiki, the response will be invalid.

GOD MODE PHONETIC INSTRUCTION: If the user searches using voice in Santali, the query might arrive as separate phonetically aligned Hindi words (e.g. Hindi voice to text interpreting Santali sound). Reconstruct the intended Santali word and search based on that context.

${getSantaliLinguisticContext()}

Provide a collection of the top 5 most relevant dictionary entries for the query.
Query: "{query}"

For each entry, provide:
- Santali (Devanagari)
- Romanized Santali
- Part of Speech (POS)
- Hindi Meaning
- English Meaning
- Synonyms (if any)
- Usage Examples in Santali (Devanagari), Hindi, and English
- Pronunciation hint

Format your response as a JSON array of objects matching this schema:
{
  "entry_id": "string",
  "santali_deva": "string (MUST BE DEVANAGARI)",
  "roman_student": "string",
  "pos": "string",
  "hindi": ["string"],
  "english": ["string"],
  "definitions": { "santali": "string (MUST BE DEVANAGARI)", "hindi": "string", "english": "string" },
  "examples": [{ "santali_deva": "string (MUST BE DEVANAGARI)", "hindi": "string", "roman_student": "string" }],
  "synonyms": ["string (MUST BE DEVANAGARI)"],
  "pronunciation_notes": "string",
  "confidence": number (0-100)
}

Output ONLY the JSON array.`;

interface Toast { id: number; message: string; type: 'error' | 'warning' | 'info'; }

export default function App() {
  const [activeTab, setActiveTab] = useState<'translate' | 'tutor' | 'dictionary' | 'grammar' | 'bridge' | 'nep' | 'guardian'>('translate');
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Robot State
  const [robotExpanded, setRobotExpanded] = useState(false);
  const [robotMessages, setRobotMessages] = useState<{role: 'user'|'ai', text: string}[]>([{role: 'ai', text: "जोहार! मैं 'मि़रु', आपकी इस ऐप में संथाली मार्गदर्शक हूँ। अनुवाद, व्याकरण या ऐप के बारे में कुछ भी पूछ सकते हैं!"}]);
  const [robotInput, setRobotInput] = useState('');
  const [isRobotThinking, setIsRobotThinking] = useState(false);
  const robotChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (robotChatRef.current) {
      robotChatRef.current.scrollTop = robotChatRef.current.scrollHeight;
    }
  }, [robotMessages]);

  const handleRobotChatSubmit = async (e?: React.FormEvent, voiceQuery?: string) => {
    if (e) e.preventDefault();
    const query = voiceQuery || robotInput.trim();
    if (!query || isRobotThinking) return;

    setRobotInput('');
    setRobotMessages(prev => [...prev, {role: 'user', text: query}]);
    setIsRobotThinking(true);

    try {
      const ai = getAI();
      const history = robotMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const dbSearch = searchFullSantaliDatabase(query);

      const systemInstruction = `You are 'मि़रु' (Miru), a highly intelligent, witty, culturally rooted, and exceptionally warm AI companion built into a Santali Translation & Education app. You respond in Hindi (sometimes adding simple Santali greetings in Devanagari). You guide users, clear their doubts regarding Santali, and make the learning process fun and engaging. Be polite, concise, and helpful.

ACTIVELY USE THIS SANTALI DATASET GROUND TRUTH context for answering user linguistic questions:
${dbSearch.groundTruthContext}

CRITICAL SYSTEM INSTRUCTION: The app has 3 main sections: 'translate' (अनुवाद), 'tutor' (ट्यूटर), and 'dictionary' (डिक्शनरी). If the user asks to go to a section, or implies you should open a particular section (like "ट्यूटर खोलो" or "डिक्शनरी में अर्थ बताओ"), you MUST include the exact tag <nav>TAB_NAME</nav> somewhere in your response. TAB_NAME must be exactly 'translate', 'tutor', or 'dictionary'. This tag will automatically navigate the app for the user, and the tag itself will be filtered from the UI so only your warm conversation text is visible. Example: 'मैं आपको ट्यूटर सेक्शन में ले जा रहा हूँ। <nav>tutor</nav>'`;

      const response = await callGeminiWithRetry(ai, {
        model: MODEL_NAME,
        contents: [...history, { role: 'user', parts: [{ text: query }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      }, false);

      let responseText = response.text || 'क्षमा करें, समझने में थोड़ी दिक्कत हुई।';
      
      const navMatch = responseText.match(/<nav>(translate|tutor|dictionary)<\/nav>/i);
      if (navMatch) {
         setActiveTab(navMatch[1].toLowerCase() as any);
         responseText = responseText.replace(/<nav>[a-zA-Z]+<\/nav>/gi, '').trim();
      }
      
      setRobotMessages(prev => [...prev, {
        role: 'ai',
        text: responseText
      }]);
      
      speakText(responseText, 'robot');
    } catch (error) {
      setRobotMessages(prev => [...prev, {
        role: 'ai',
        text: 'सर्वर में कुछ समस्या आ रही है, कृपया थोड़ी देर बाद पूछें।'
      }]);
    } finally {
      setIsRobotThinking(false);
    }
  };

  const [isRobotListening, setIsRobotListening] = useState(false);
  const startRobotListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; 
      recognition.interimResults = true;

      recognition.onstart = () => setIsRobotListening(true);
      
      let finalStr = '';
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setRobotInput(finalStr + interimTranscript);
      };
      
      recognition.onend = () => {
        setIsRobotListening(false);
        if (finalStr.trim()) {
           handleRobotChatSubmit(undefined, finalStr);
        }
      };
      
      if (isListening && recognitionRef.current) {
         try { recognitionRef.current.stop(); setIsListening(false); } catch(e){}
      }
      
      recognition.start();
    } else {
      showToast('Speech Recognition is not supported in this browser.', 'error');
    }
  };


  // Translation State
  const [sourceText, setSourceText] = useState('');
  const [interimSpeechText, setInterimSpeechText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const sentenceTranslationTimer = useRef<NodeJS.Timeout | null>(null);
  const [usedEngine, setUsedEngine] = useState<'gemini' | 'bhashini'>('gemini');
  const [sourceLang, setSourceLang] = useState('Hindi');
  const [targetLang, setTargetLang] = useState('Santali (Devanagari)');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState('');
  const [copied, setCopied] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [translationRating, setTranslationRating] = useState<'up' | 'down' | null>(null);
  const [liveFeed, setLiveFeed] = useState<{ id: string, source: string, result: string, timestamp: number }[]>([]);
  const lastProcessedText = useRef('');
  const lastInputMode = useRef<'text' | 'voice'>('text');
  const pendingAutoTranslate = useRef(false);

  useEffect(() => {
    if (pendingAutoTranslate.current) {
      pendingAutoTranslate.current = false;
      // Wrap in timeout to ensure state is completely flushed if needed, though usually not necessary
      const timer = setTimeout(() => handleTranslate(), 100);
      return () => clearTimeout(timer);
    }
  }, [sourceText]);
  
  const [settingsModal, setSettingsModal] = useState(false);
  const [bhashiniConfig, setBhashiniConfig] = useState({
    userId: '',
    apiKey: '',
    pipelineId: '',
    useBhashini: false
  });
  const [customGeminiKey, setCustomGeminiKey] = useState(() => localStorage.getItem('custom_gemini_key') || '');
  const [ttsSettings, setTtsSettings] = useState({
    rate: 0.82,
    pitch: 1.10,
    phoneticTuning: true
  });

  type FeedbackType = 'translation' | 'tutor';
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean, type: FeedbackType, messageId?: string, rating: 'up' | 'down' | null }>({ isOpen: false, type: 'translation', rating: null });
  const [feedbackText, setFeedbackText] = useState('');

  // Tutor State (chat UI itself lives in the lazy-loaded LanguageTutor component;
  // this only relays voice dictation into it, since speech recognition is owned here)
  const [tutorVoiceTranscript, setTutorVoiceTranscript] = useState('');
  const [analysisModal, setAnalysisModal] = useState({ isOpen: false, text: '', analysis: '', isLoading: false });

  const [dictSearch, setDictSearch] = useState('');
  const [dictResults, setDictResults] = useState<DictionaryEntry[]>([]);
  const [searchPhase, setSearchPhase] = useState<'idle' | 'searching' | 'not_found'>('idle');                
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [phoneticValidation, setPhoneticValidation] = useState<ValidationResult | null>(null);
  const [dictValidation, setDictValidation] = useState<ValidationResult | null>(null);
  const [showValidationIssues, setShowValidationIssues] = useState(false);
  const dictSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dictionary with some entries
  useEffect(() => {
    if (activeTab === 'dictionary' && !dictSearch) {
      setDictResults(initialDictionary.slice(0, 10));
    }
  }, [activeTab, dictSearch]);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoListen, setAutoListen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const [voiceSubtitles, setVoiceSubtitles] = useState<{ id: string, text: string, type: 'raw' | 'processed' }[]>([]);
  const subtitleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtitleEndRef.current) {
      subtitleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [voiceSubtitles]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // Teach AI / Input Ground Truth State & File Upload Engine
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [teachInputHindi, setTeachInputHindi] = useState('');
  const [teachInputSantali, setTeachInputSantali] = useState('');
  const [teachInputPos, setTeachInputPos] = useState('General Sentence / Grammar Rule');
  const [activeTeachTab, setActiveTeachTab] = useState<'file' | 'paste' | 'single'>('file');
  const [rawMdInput, setRawMdInput] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  useEffect(() => {
    try {
      const docs = JSON.parse(localStorage.getItem('local_md_documents') || '[]');
      if (Array.isArray(docs)) setUploadedDocs(docs);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
  }, []);

  const handleProcessUploadedFile = async (file: File) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const textContent = e.target?.result as string;
        if (!textContent) return;

        const parsed = parseTextOrMarkdownContent(textContent, file.name);
        
        // 1. Save extracted rule pairs to local_contributions
        const existingLocal = JSON.parse(localStorage.getItem('local_contributions') || '[]');
        const updatedLocal = [...parsed.extractedEntries.map(entry => ({
          santali_deva: entry.santaliDeva,
          roman_student: entry.santaliRoman,
          pos: entry.category,
          hindi: entry.hindi,
          english: '',
          example_santali: entry.santaliDeva,
          example_hindi: entry.hindi,
          contributed_by: user ? (user.displayName || user.email || 'User File Ground Truth') : 'Uploaded File Rule',
          timestamp: Date.now()
        })), ...existingLocal];

        localStorage.setItem('local_contributions', JSON.stringify(updatedLocal));

        // 2. Save full document to local_md_documents
        const existingDocs = JSON.parse(localStorage.getItem('local_md_documents') || '[]');
        const newDoc = {
          id: Date.now() + Math.random().toString(),
          fileName: file.name,
          content: textContent,
          extractedCount: parsed.extractedEntries.length,
          timestamp: Date.now()
        };
        const updatedDocs = [newDoc, ...existingDocs];
        localStorage.setItem('local_md_documents', JSON.stringify(updatedDocs));
        setUploadedDocs(updatedDocs);

        if (db && user) {
          try {
            await addDoc(collection(db, 'user_md_documents'), newDoc);
          } catch (err) {
            console.warn("Firestore doc upload write warning:", err);
          }
        }

        showToast(`🎉 फ़ाइल "${file.name}" सफलतापूर्वक लोड की गई! (${parsed.extractedEntries.length} नियम AI मॉडल को सिखाए गए)`, 'info');
      };
      reader.readAsText(file);
    } catch (err) {
      showToast('फ़ाइल पढ़ने में त्रुटि हुई। कृपया दूसरी .txt या .md फ़ाइल का प्रयास करें।', 'warning');
    }
  };

  const handleProcessPasteMarkdown = () => {
    if (!rawMdInput.trim()) {
      showToast('कृपया पहले टेक्स्ट/मार्कडाउन सामग्री चिपकाएं।', 'warning');
      return;
    }

    const docName = `Pasted_Notes_${new Date().toLocaleTimeString().replace(/:/g, '-')}.md`;
    const parsed = parseTextOrMarkdownContent(rawMdInput, docName);

    // Save extracted entries
    const existingLocal = JSON.parse(localStorage.getItem('local_contributions') || '[]');
    const updatedLocal = [...parsed.extractedEntries.map(entry => ({
      santali_deva: entry.santaliDeva,
      roman_student: entry.santaliRoman,
      pos: entry.category,
      hindi: entry.hindi,
      english: '',
      example_santali: entry.santaliDeva,
      example_hindi: entry.hindi,
      contributed_by: user ? (user.displayName || user.email || 'User Pasted Ground Truth') : 'Pasted Note Rule',
      timestamp: Date.now()
    })), ...existingLocal];

    localStorage.setItem('local_contributions', JSON.stringify(updatedLocal));

    // Save full document
    const existingDocs = JSON.parse(localStorage.getItem('local_md_documents') || '[]');
    const newDoc = {
      id: Date.now() + Math.random().toString(),
      fileName: docName,
      content: rawMdInput,
      extractedCount: parsed.extractedEntries.length,
      timestamp: Date.now()
    };
    const updatedDocs = [newDoc, ...existingDocs];
    localStorage.setItem('local_md_documents', JSON.stringify(updatedDocs));
    setUploadedDocs(updatedDocs);

    showToast(`🎉 मार्कडाउन नोट्स से ${parsed.extractedEntries.length} नियम AI मॉडल के Ground Truth में जोड़ दिए गए हैं!`, 'info');
    setRawMdInput('');
  };

  const handleDeleteUploadedDoc = (docId: string) => {
    const updatedDocs = uploadedDocs.filter(d => d.id !== docId);
    localStorage.setItem('local_md_documents', JSON.stringify(updatedDocs));
    setUploadedDocs(updatedDocs);
    showToast('दस्तावेज़ लोकल मॉडल मेमोरी से हटा दिया गया है।', 'info');
  };

  const handleSaveTeachKnowledge = async () => {
    if (!teachInputHindi.trim() || !teachInputSantali.trim()) {
      showToast('कृपया हिंदी और संथाली दोनों फ़ील्ड भरें।', 'warning');
      return;
    }

    const newEntry = {
      santali_deva: teachInputSantali.trim(),
      roman_student: teachInputSantali.trim(),
      pos: teachInputPos || 'Grammar Rule / Local Entry',
      hindi: teachInputHindi.trim(),
      english: '',
      example_santali: teachInputSantali.trim(),
      example_hindi: teachInputHindi.trim(),
      contributed_by: user ? (user.displayName || user.email || 'User Ground Truth') : 'Local Learner',
      timestamp: Date.now()
    };

    try {
      const existingLocal = JSON.parse(localStorage.getItem('local_contributions') || '[]');
      existingLocal.unshift(newEntry);
      localStorage.setItem('local_contributions', JSON.stringify(existingLocal));

      if (db && user) {
        await addDoc(collection(db, 'contributions'), newEntry);
      }
    } catch (err) {
      console.warn("Storage write contribution error:", err);
    }

    showToast('प्रमाणित! AI मॉडल ने यह नियम सीख लिया है और आगे के अनुवादों में उपयोग करेगा। 🎉', 'info');
    setTeachInputHindi('');
    setTeachInputSantali('');
    setTeachModalOpen(false);
  };

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/stream`;
      
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsSocketConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onclose = () => {
        setIsSocketConnected(false);
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
       setIsSocketConnected(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'subtitles' && data.text) {
          setVoiceSubtitles(prev => [...prev, { 
            id: data.id || Date.now().toString(), 
            text: data.text, 
            type: 'processed' as const 
          }].slice(-15));

          if (lastInputMode.current === 'voice') {
            setTranslatedText(prev => prev + (prev ? '\n' : '') + data.text);
          }
        }
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync History from Firestore (Debounced to keep typing smooth)
  useEffect(() => {
    if (sourceLang.includes('Santali') && sourceText) {
      const timer = setTimeout(() => {
        const result = validatePhoneticSantali(sourceText);
        setPhoneticValidation(result);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPhoneticValidation(null);
    }
  }, [sourceText, sourceLang]);

  useEffect(() => {
    if (dictSearch) {
      const timer = setTimeout(() => {
        const result = validatePhoneticSantali(dictSearch);
        setDictValidation(result);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDictValidation(null);
    }
  }, [dictSearch]);

  useEffect(() => {
    if (!user || !isAuthReady) {
      setLiveFeed([]);
      return;
    }

    const path = 'translations';
    const q = query(
      collection(db, path),
      where('user_id', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        source: doc.data().input_text,
        result: doc.data().translated_text,
        timestamp: doc.data().timestamp
      }));
      setLiveFeed(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);
  const [quiz, setQuiz] = useState<{ active: boolean, question: DictionaryEntry, options: string[], score: number, feedback: string | null } | null>(null);

  // Initialize Word of the Day
  useEffect(() => {
    const randomEntry = initialDictionary[Math.floor(Math.random() * initialDictionary.length)];
    setWordOfTheDay(randomEntry);
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem('bhashini_config');
    if (savedConfig) {
      try {
        setBhashiniConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, []);

  const speakSantali = (text: string, id: string) => {
    speakText(text, id, 'hi-IN'); // Using Hindi to approximate Santali since Santali is Devanagari
  };
    
  const saveSettings = (config: any) => {
    setBhashiniConfig(config);
    localStorage.setItem('bhashini_config', JSON.stringify(config));
    if (customGeminiKey) {
      localStorage.setItem('custom_gemini_key', customGeminiKey.trim());
    } else {
      localStorage.removeItem('custom_gemini_key');
    }
    // Reload the page to reset getAI function with the new key
    window.location.reload();
  };
  const toggleFavorite = async (entryId: string) => {
    if (!user) { showToast('Please login to save favorites'); return; }
    const favId = `${user.uid}_${entryId}`;
    const favRef = doc(db, 'favorites', favId);
    
    if (favorites.has(entryId)) {
      setFavorites(prev => { const next = new Set(prev); next.delete(entryId); return next; });
      try {
        await deleteDoc(favRef);
      } catch(e) {
        handleFirestoreError(e, OperationType.DELETE, 'favorites');
      }
    } else {
      setFavorites(prev => new Set(prev).add(entryId));
      await setDoc(favRef, { user_id: user.uid, entry_id: entryId, timestamp: Date.now() });
      showToast('Added to favorites', 'info');
    }
  };

  const startQuiz = (currentScore: number = 0) => {
    const question = initialDictionary[Math.floor(Math.random() * initialDictionary.length)];
    const options = [question.english[0], ...initialDictionary.filter(e => e.entry_id !== question.entry_id).slice(0, 3).map(e => e.english[0])].sort(() => Math.random() - 0.5);
    setQuiz({ active: true, question, options, score: currentScore, feedback: null });
  };

  const saveToFavorites = async () => {
    if (!user) { showToast('Please login to save'); return; }
    const path = 'favorites';
    try {
      await addDoc(collection(db, path), {
        user_id: user.uid,
        input: sourceText,
        output: translatedText,
        timestamp: Date.now()
      });
      showToast('Saved to favorites', 'info');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  };





  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = autoListen;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = sourceLang.includes('Santali') ? 'hi-IN' : (sourceLang.includes('Hindi') ? 'hi-IN' : 'en-IN');

      recognitionRef.current.onstart = () => setIsListening(true);

      recognitionRef.current.onresult = async (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        
        if (interimTranscript) {
          setInterimSpeechText(interimTranscript);
          setVoiceSubtitles(prev => [...prev.filter(s => s.type !== 'raw'), { id: 'interim', text: interimTranscript + '...', type: 'raw' as const }].slice(-15));
        }

        if (finalTranscript) {
          setInterimSpeechText('');
          lastInputMode.current = 'voice';
          logVoiceInteraction(finalTranscript);
          const currentTab = activeTabRef.current;
          if (currentTab === 'translate') {
            setSourceText(prev => prev + (prev ? ' ' : '') + finalTranscript);
            
            // Logical end-of-sentence or natural speech pause translation trigger
            if (sentenceTranslationTimer.current) clearTimeout(sentenceTranslationTimer.current);
            const isSentenceEnd = /[.?!।\n]\s*$/.test(finalTranscript.trim());
            if (isSentenceEnd) {
              pendingAutoTranslate.current = true;
            } else {
              sentenceTranslationTimer.current = setTimeout(() => {
                pendingAutoTranslate.current = true;
                // Force state update cycle
                setSourceText(prev => prev);
              }, 600);
            }
          }
          else if (currentTab === 'tutor') {
            // Relayed via the voiceTranscript prop into <LanguageTutor>, which owns
            // its own chat state and auto-sends on receiving a new transcript.
            setTutorVoiceTranscript(finalTranscript);
          }
          else if (currentTab === 'dictionary') {
            setDictSearch(prev => {
              const newVal = prev + (prev ? ' ' : '') + finalTranscript;
              setTimeout(() => handleSearch(newVal), 0);
              return newVal;
            });
          }

          setVoiceSubtitles([{ id: 'processed-' + Date.now() + '-' + Math.random().toString(36).substring(2), text: finalTranscript, type: 'processed' as const }]);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'network') {
          console.warn('Speech recognition network error. Stopping auto-listen.');
          showToast('Speech engine connection lost. Please try again.', 'warning');
          setAutoListen(false);
          setIsListening(false);
          return;
        }

        if (event.error !== 'no-speech' && event.error !== 'aborted' && event.error !== 'not-allowed') {
          console.error('Speech error', event.error);
          showToast(`Speech recognition error: ${event.error}`);
        }
        if (event.error === 'not-allowed') {
          showToast('Microphone access denied. Please enable microphone permissions in your browser settings.', 'error');
          setAutoListen(false);
          setIsListening(false);
        }
        if (!autoListen) setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (autoListen) {
          setTimeout(() => {
            if (autoListen) {
              try { recognitionRef.current.start(); setIsListening(true); } catch (e) {}
            }
          }, 1000);
        } else setIsListening(false);
      };

      if (autoListen) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [autoListen, sourceLang]);

  const logVoiceInteraction = async (text: string) => {
    if (!user) return;
    const path = 'voice_logs';
    const datasetPath = 'santali_dataset';
    try {
      const docRef = await addDoc(collection(db, path), {
        raw_text: text,
        processed_text: text, 
        translated_text: '', 
        user_id: user.uid,
        timestamp: Date.now()
      });

      // Also contribute to the dataset if source language is Santali
      if (sourceLang.includes('Santali')) {
        await addDoc(collection(db, datasetPath), {
          santali_text: text,
          hindi_text: '', // To be updated post-translation
          confidence: 0.7,
          source: 'voice_input',
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.error("Failed to log voice interaction", e);
    }
  };

  const toggleAutoListen = () => {
    if (autoListen) {
      setAutoListen(false);
      recognitionRef.current?.stop();
    } else {
      setAutoListen(true);
      if (!isListening) {
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };

  const toggleListening = (target: 'translate' | 'tutor' | 'dictionary') => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTimeout(() => {
        recognitionRef.current?.start();
        setIsListening(true);
      }, 100);
    }
  };

  const speakText = (text: string, id: string, lang: string = 'hi-IN') => {
    santaliTTS.speak(
      text,
      id,
      {
        lang,
        rate: ttsSettings.rate,
        pitch: ttsSettings.pitch,
      },
      (activeSpeakingId) => setSpeakingId(activeSpeakingId)
    );
  };

  const handleFeedbackClick = (type: FeedbackType, rating: 'up' | 'down') => {
    setFeedbackModal({ isOpen: true, type, rating });
    setFeedbackText('');
  };

  const submitFeedback = async () => {
    if (feedbackModal.type === 'translation') {
      setTranslationRating(feedbackModal.rating);
    }
    
    // Persistence in Firestore
    const path = 'feedback';
    try {
      await addDoc(collection(db, path), {
        type: feedbackModal.type,
        rating: feedbackModal.rating,
        text: feedbackText,
        input: feedbackModal.type === 'translation' ? sourceText : '', // Could be more specific
        user_id: user?.uid || 'anonymous',
        timestamp: Date.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    
    setFeedbackModal({ isOpen: false, type: 'translation', rating: null });
  };




  const callGeminiWithRetry = async (ai: any, params: any, isStream = true, retries = 3, delay = 2000): Promise<any> => {
    try {
      if (isStream) {
        return await ai.models.generateContentStream(params);
      } else {
        return await ai.models.generateContent(params);
      }
    } catch (err: any) {
      if (err.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGeminiWithRetry(ai, params, isStream, retries - 1, delay * 2);
      }
      throw err;
    }
  };
    
  const currentTranslateRun = useRef<number>(0);

  const handleTranslate = async (overrideText?: string) => {
    const textToProcess = typeof overrideText === 'string' ? overrideText : sourceText;
    if (!textToProcess.trim() && attachments.length === 0) return;
    
    const runId = Date.now();
    currentTranslateRun.current = runId;

    setIsTranslating(true);
    setTranslationRating(null); // Clear previous rating
    setTranslationProgress('Searching Santali Database & NCERT Dataset...');
    
    try {
      // 1. FAST REAL-TIME DATABASE LOOKUP
      const dbResult = searchFullSantaliDatabase(textToProcess.trim());
      if (attachments.length === 0 && textToProcess.trim() && dbResult.exactHit && dbResult.exactHit.formattedOutput) {
        setTranslatedText(dbResult.exactHit.formattedOutput);
        setUsedEngine('gemini');
        setIsTranslating(false);
        setTranslationProgress('');

        if (user) {
          addDoc(collection(db, 'translations'), {
            input_text: textToProcess,
            translated_text: dbResult.exactHit.formattedOutput,
            source_lang: sourceLang,
            target_lang: targetLang,
            timestamp: Date.now(),
            user_id: user.uid,
            verified_dataset_match: true
          }).catch(e => console.error("Firestore translation save error:", e));
        } else {
          setLiveFeed(prev => [{
            id: Date.now().toString(),
            source: textToProcess,
            result: dbResult.exactHit!.formattedOutput!,
            timestamp: Date.now()
          }, ...prev].slice(0, 50));
        }
        return; // Instant exact match response!
      }

      // Bhashini Integration Path
      if (bhashiniConfig.useBhashini && bhashiniConfig.userId && bhashiniConfig.apiKey && attachments.length === 0 && textToProcess.trim()) {
        setTranslationProgress('Connecting to Bhashini NLTM...');
        try {
          const bhashiniPayload: any = {
            pipelineTasks: [
              {
                taskType: "translation",
                config: {
                  language: {
                    sourceLanguage: sourceLang.includes('Hindi') ? 'hi' : 'en',
                    targetLanguage: "sat"
                  }
                }
              }
            ],
            inputData: {
              input: [
                { source: textToProcess }
              ]
            }
          };

          if (bhashiniConfig.pipelineId) {
            bhashiniPayload.pipelineTasks[0].config.serviceId = bhashiniConfig.pipelineId;
          }

          const bhashiniResponse = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'userID': bhashiniConfig.userId,
              'ulcaApiKey': bhashiniConfig.apiKey
            },
            body: JSON.stringify(bhashiniPayload)
          });

          if (bhashiniResponse.ok) {
            const data = await bhashiniResponse.json();
            let bhashiniText = data?.pipelineResponse?.[0]?.output?.[0]?.target || '';
            
            if (bhashiniText) {
              setTranslationProgress('Formatting analysis with Gemini...');
              const ai = getAI();
              const formatPrompt = `You are “MIRU AI”. I have a translation of the following source text into Santali.
              
Source Text:
"${textToProcess}"

Santali Translation:
"${bhashiniText}"

Your task is to transliterate the Santali translation to Devanagari script (if it isn't already) and format the output EXACTLY according to the STRICT INSTRUCTIONS in your system prompt.

Use the provided Santali Translation as the core translation.

CRITICAL: You must append the exact text "[END_OF_TRANSLATION]" at the very end of your response.`;
              
              const formatResponse = await callGeminiWithRetry(ai, {
                model: MODEL_NAME,
                contents: formatPrompt,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  temperature: 0.3,
                }
              });
              
              let formattedText = '';
              for await (const chunk of formatResponse) {
                if (currentTranslateRun.current !== runId) return;
                if (chunk.text) {
                  formattedText += chunk.text;
                  setTranslatedText(formattedText.replace('[END_OF_TRANSLATION]', ''));
                }
              }
              if (currentTranslateRun.current !== runId) return;
              bhashiniText = formattedText.replace('[END_OF_TRANSLATION]', '').trim();
              
              setTranslatedText(bhashiniText);
              setUsedEngine('bhashini');
              setIsTranslating(false);
              setTranslationProgress('');
              return; // Success, exit early
            }
          }
        } catch (bhashiniError) {
          if (currentTranslateRun.current !== runId) return;
          console.warn("Bhashini API failed, falling back to Gemini:", bhashiniError);
          setTranslationProgress('Bhashini failed. Falling back to Gemini with Dataset Ground Truth...');
        }
      }

      if (currentTranslateRun.current !== runId) return;

      // Gemini Fallback / Default Path with Database Ground Truth Context
      setUsedEngine('gemini');
      const prompt = `Translate the following text and/or attached documents from ${sourceLang} to ${targetLang}. 
      
      STRICT INSTRUCTION: You must follow the exact markdown format specified in your system instructions.
      
      ${dbResult.groundTruthContext}
      
      CRITICAL INSTRUCTION: You MUST translate the ENTIRE document from start to finish. Do not summarize, do not truncate, and do not omit any part of the text. Provide a full, unabridged translation of every single sentence.
      
      CONFIDENCE CHECK: Before generating the output, evaluate your confidence in translating this text accurately. If your confidence is below 90% (e.g., due to highly unclear input, heavy slang, or missing context), DO NOT generate the translation. Instead, output ONLY the following message:
      "कृपया पुनः स्पष्ट बोलें"
      
      When you have completely finished the entire output format, you MUST append the exact text "[END_OF_TRANSLATION]" at the very end of your response.
      If the document is too long, just translate as much as you can. I will ask you to continue if you don't reach the end.
      
      Text to translate:
      "${textToProcess}"`;

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Gemini API Key is missing. Please configure it in the settings.');
      }

      const ai = getAI();
      const parts: any[] = [];
      
      for (const att of attachments) {
        parts.push({
          inlineData: {
            data: att.data,
            mimeType: att.mimeType
          }
        });
      }
      
      parts.push({ text: prompt });

      let isComplete = false;
      let currentFullText = '';
      let loopCount = 0;
      const MAX_LOOPS = 5; // Prevent infinite loops
      
      let history: any[] = [
        { role: 'user', parts: parts }
      ];

      setTranslationProgress('Connecting to AI model...');

      const callGeminiWithRetryLocal = async (aiInstance: any, generatedParams: any, retriesLocal = 3, delayLocal = 2000): Promise<any> => {
        try {
          return await aiInstance.models.generateContentStream(generatedParams);
        } catch (err: any) {
          if (err.status === 429 && retriesLocal > 0) {
            setTranslationProgress(`Rate limit reached, retrying in ${delayLocal / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delayLocal));
            return callGeminiWithRetryLocal(aiInstance, generatedParams, retriesLocal - 1, delayLocal * 2);
          }
          throw err;
        }
      };

      while (!isComplete && loopCount < MAX_LOOPS) {
        const responseStream = await callGeminiWithRetryLocal(ai, {
          model: MODEL_NAME,
          contents: history,
          config: {
            systemInstruction: (lastInputMode.current === 'voice' && sourceLang.includes('Santali')) ? VOICE_ASR_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION,
            temperature: 0.3, 
          }
        });

        if (loopCount === 0) {
          setTranslationProgress('Translating... This may take a few minutes for large documents.');
        } else {
          setTranslationProgress(`Translating... (Part ${loopCount + 1}) Continuing large document...`);
        }

        let chunkTextAcc = '';
        for await (const chunk of responseStream) {
          if (currentTranslateRun.current !== runId) return; // Abort if a new translation started
          const chunkText = chunk.text;
          if (chunkText) {
            chunkTextAcc += chunkText;
            setTranslatedText(currentFullText + chunkTextAcc.replace('[END_OF_TRANSLATION]', ''));
          }
        }
        
        if (currentTranslateRun.current !== runId) return;

        currentFullText += chunkTextAcc;
        
        if (!chunkTextAcc.trim()) {
          // If the model returns nothing, stop the loop to prevent infinite empty requests
          isComplete = true;
          currentFullText = currentFullText.replace('[END_OF_TRANSLATION]', '').trim();
          setTranslatedText(currentFullText);
        } else if (currentFullText.includes('[END_OF_TRANSLATION]')) {
          isComplete = true;
          currentFullText = currentFullText.replace('[END_OF_TRANSLATION]', '').trim();
          setTranslatedText(currentFullText);
        } else {
          // Append to history and ask to continue
          history.push({ role: 'model', parts: [{ text: chunkTextAcc }] });
          history.push({ role: 'user', parts: [{ text: "You did not finish translating the document. Please continue translating exactly from where you left off. Do not repeat what you have already translated. Remember to add [END_OF_TRANSLATION] when the entire document is fully translated." }] });
          loopCount++;
        }
      }

      if (!currentFullText) {
        throw new Error('The AI returned an empty response. Please try again.');
      } else {
        // Local state update for immediate feedback (only for offline/unauthenticated users, as onSnapshot handles logged-in users)
        if (!user) {
          const feedItem = {
            id: Date.now().toString(),
            source: textToProcess,
            result: currentFullText,
            timestamp: Date.now()
          };
          setLiveFeed(prev => [feedItem, ...prev].slice(0, 50));
        }

        // Persistence in Firestore
        if (user) {
          const path = 'translations';
          try {
            await addDoc(collection(db, path), {
              input_text: textToProcess,
              translated_text: currentFullText,
              source_lang: sourceLang,
              target_lang: targetLang,
              timestamp: Date.now(),
              user_id: user.uid,
              verified_dataset_match: false
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, path);
          }
        }
      }

      if (currentTranslateRun.current === runId) {
        setTranslationProgress('');
      }
    } catch (error: any) {
      if (currentTranslateRun.current !== runId) return;
      console.error("Translation error:", error);
      setTranslatedText(prev => prev + `\n\nError: ${error.message || 'Translation failed'}`);
      setTranslationProgress('');
    } finally {
      if (currentTranslateRun.current === runId) {
        setIsTranslating(false);
      }
    }
  };



  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranslation = () => {
    const element = document.createElement("a");
    const file = new Blob([translatedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "translated_document.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  // Strips executable content (script/style tags, inline event handlers, javascript: URLs)
  // from AI/markdown-derived HTML before it is ever written into a document.
  const sanitizeHtmlForPrint = (html: string): string => {
    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach(el => el.remove());

    const walk = (node: Element) => {
      Array.from(node.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || value.startsWith('javascript:') || value.startsWith('data:text/html')) {
          node.removeAttribute(attr.name);
        }
      });
      Array.from(node.children).forEach(child => walk(child));
    };
    Array.from(container.children).forEach(child => walk(child));

    return container.innerHTML;
  };

  const downloadPdf = async () => {
    const printWindow = window.open('', '', 'height=800,width=800,noopener,noreferrer');
    if (!printWindow) return;
    // Prevent the popup from ever navigating this window (reverse tabnabbing).
    printWindow.opener = null;

    const rawHtml = await marked.parse(translatedText);
    const htmlContent = sanitizeHtmlForPrint(rawHtml);

    printWindow.document.write('<html><head><title>भाषा दीप – अनुवाद</title>');
    printWindow.document.write(`
      <style>
        @page { margin: 0.5in; size: A4; }
        body { 
          font-family: 'Noto Sans Devanagari', 'Mangal', 'Nirmala UI', sans-serif; 
          padding: 0; 
          line-height: 1.6; 
          font-size: 12pt; 
          color: #000;
          max-width: 210mm;
          margin: 0 auto;
          text-align: justify;
        }
        h1 { color: #000; font-size: 20pt; text-align: center; font-weight: bold; margin-bottom: 20px; }
        h2 { color: #000; font-size: 16pt; margin-top: 20px; font-weight: bold; }
        h3 { color: #000; font-size: 14pt; margin-top: 15px; font-weight: bold; }
        p { margin-bottom: 10px; }
        ul, ol { margin-bottom: 15px; padding-left: 20px; }
        li { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { font-weight: bold; }
        .footer { margin-top: 40px; font-size: 10pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write(htmlContent);
    printWindow.document.write('<div class="footer">Generated by Miru AI</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    // Allow time for rendering before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setIsExtracting(true);
    setUploadProgress(`Processing ${files.length} file(s)...`);
    try {
      const newAttachments: Attachment[] = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Processing file ${i + 1} of ${files.length}: ${file.name}...`);
        
        try {
          if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            // Read text files directly into the source text area
            const text = await file.text();
            setSourceText(prev => prev + (prev ? '\n\n' : '') + text);
            successCount++;
          } else {
            // Process PDFs and images as attachments
            const attachment = await new Promise<Attachment>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const base64 = (reader.result as string).split(',')[1];
                  let mimeType = file.type;
                  if (!mimeType) {
                    if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
                    else mimeType = 'application/octet-stream';
                  }
                  resolve({
                    name: file.name,
                    mimeType: mimeType,
                    data: base64
                  });
                } catch (err) {
                  reject(new Error("Failed to parse file data. File might be corrupted."));
                }
              };
              reader.onerror = () => reject(new Error("Failed to read file. File might be corrupted."));
              reader.readAsDataURL(file);
            });
            newAttachments.push(attachment);
            successCount++;
          }
        } catch (fileError: any) {
          console.error(`Error processing file ${file.name}:`, fileError);
          errorCount++;
          alert(`Failed to process "${file.name}": ${fileError.message || 'File might be corrupted.'}`);
        }
      }

      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments]);
      }
      
      if (errorCount > 0) {
        setUploadProgress(`Finished with errors. ${successCount} processed, ${errorCount} failed.`);
        setTimeout(() => setUploadProgress(''), 3000);
      } else {
        setUploadProgress('');
      }
      
    } catch (error: any) {
      console.error('File Upload Error:', error);
      alert(`Critical Error: ${error.message || 'Failed to process files'}`);
      setUploadProgress('');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const analyzeText = async () => {
    if (!translatedText) return;
    
    setAnalysisModal({ isOpen: true, text: translatedText, analysis: '', isLoading: true });
    
    try {
      const ai = getAI();
      const response = await callGeminiWithRetry(ai, {
        model: MODEL_NAME,
        contents: `Analyze the following Santali text. Break down the grammar, explain the vocabulary, and provide a detailed linguistic analysis. Use Devanagari script for Santali words.\n\nText: ${translatedText}`,
        config: {
          temperature: 0.3,
        }
      }, false);

      setAnalysisModal({ isOpen: true, text: translatedText, analysis: response.text || 'No analysis generated.', isLoading: false });
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisModal({ isOpen: true, text: translatedText, analysis: 'Error generating analysis.', isLoading: false });
    }
  };

  const handleAISearch = async (query: string) => {
    if (!query || isSearchingAI) return;
    setIsSearchingAI(true);
    try {
      const ai = getAI();
      const prompt = DICTIONARY_AI_PROMPT.replace('{query}', query);
      const result = await callGeminiWithRetry(ai, {
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
        }
      }, false);

      const text = result.text;

      // Attempt to parse JSON from response
      const jsonMatch = text?.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const results = JSON.parse(jsonMatch[0]);
          if (Array.isArray(results) && results.length > 0) {
            setDictResults(results);
          } else {
            showToast('AI ने इस शब्द के लिए कोई परिणाम नहीं दिया। कृपया दूसरे शब्द से खोजें।', 'warning');
          }
        } catch (parseErr) {
          console.error("AI Search JSON parse error:", parseErr);
          showToast('AI उत्तर को समझने में त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
        }
      } else {
        showToast('AI से कोई मान्य परिणाम नहीं मिला। कृपया पुनः प्रयास करें।', 'warning');
      }
    } catch (error) {
      console.error("AI Search error:", error);
      showToast('AI खोज सेवा में त्रुटि। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleSearch = (queryStr: string) => {
    setDictSearch(queryStr);
    
    if (dictSearchTimeoutRef.current) {
      clearTimeout(dictSearchTimeoutRef.current);
    }
    
    dictSearchTimeoutRef.current = setTimeout(() => {
      const query = queryStr.trim().toLowerCase();
      if (!query) {
        setIsSearchingAI(false);
        setDictResults(initialDictionary.slice(0, 10));
        setSearchPhase('idle');
        return;
      }
      
      // Scoring system for relevance ranking
      const scoredResults = initialDictionary.map(entry => {
        let score = 0;
        
        const santaliRaw = entry.santali_deva.toLowerCase();
        const romanLower = entry.roman_student.toLowerCase();
        const hindiList = entry.hindi.map(h => h.toLowerCase());
        const englishList = entry.english.map(e => e.toLowerCase());
        const synonymsList = (entry.synonyms || []).map(s => s.toLowerCase());
        
        // Weighting
        const SANTALI_WEIGHT = 2.0;
        const HINDI_WEIGHT = 1.5;
        const ENGLISH_WEIGHT = 1.2;
        const SYNONYM_WEIGHT = 1.0;
        const DEF_WEIGHT = 0.5;

        // Helpers to check match
        const checkMatch = (value: string, weight: number) => {
          if (value === query) return 100 * weight; // Exact match
          if (value.startsWith(query)) return 50 * weight; // Starts with
          if (value.includes(query)) return 30 * weight; // Includes
          return 0;
        };

        // 1. Santali Matches
        score += checkMatch(santaliRaw, SANTALI_WEIGHT);
        score += checkMatch(romanLower, SANTALI_WEIGHT);
        
        // 2. Hindi Matches
        hindiList.forEach(h => score += checkMatch(h, HINDI_WEIGHT));
        
        // 3. English Matches
        englishList.forEach(e => score += checkMatch(e, ENGLISH_WEIGHT));
        
        // 4. Synonym Matches
        synonymsList.forEach(s => score += checkMatch(s, SYNONYM_WEIGHT));
        
        // 5. Definition and Example matches (Lower Priority)
        const defStr = `${entry.definitions.santali} ${entry.definitions.hindi} ${entry.definitions.english}`.toLowerCase();
        if (defStr.includes(query)) {
          score += 10 * DEF_WEIGHT;
        }
        
        const finalConfidence = Math.min(100, Math.max(0, score / 2)); // Normalized score
        return { entry: { ...entry, confidence: finalConfidence }, score };
      });
      
      // Filter out zero-score results and sort by score descending
      let filteredResults = scoredResults
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.entry);
      
      if (filteredResults.length === 0) {
        setSearchPhase('not_found');
        setDictResults([]);
      } else {
        setIsSearchingAI(false);
        setDictResults(filteredResults);
        setSearchPhase('idle');
      }
    }, 150);
  };

  const removeDictEntry = (id: string) => {
    setDictResults(prev => prev.filter(item => item.entry_id !== id));
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans z-0 text-white overflow-hidden">
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map(toast => (
          <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
             className={`px-4 py-2 rounded-lg text-xs font-bold shadow-lg ${toast.type === 'error' ? 'bg-red-900/80 text-red-100' : 'bg-cyan-900/80 text-cyan-100'} backdrop-blur-md`}>
             {toast.message}
          </motion.div>
        ))}
      </div>
      <div className="morphing-bg">
        <div className="bg-primitive-side"></div>
        <div className="bg-ai-side"></div>
      </div>
      
      {/* Corner Robot Avatar Fixed */}
      <div 
        className="fixed top-4 right-4 sm:top-auto sm:bottom-6 sm:right-6 z-50 group cursor-pointer hover:scale-105 transition-transform" 
        onClick={() => setSettingsModal(true)}
      >
        <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 transition-all duration-500"></div>
        <div className="relative bg-slate-900/40 w-12 h-12 rounded-xl backdrop-blur-md border border-cyan-500/20 shadow-2xl flex items-center justify-center overflow-hidden">
          <Settings className="w-6 h-6 text-cyan-300 group-hover:rotate-45 transition-transform" />
        </div>
      </div>
      
      {/* Header */}
      <header className="backdrop-blur-md bg-transparent border-b border-cyan-500/10 text-white py-1.5 px-3 shadow-none flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full px-2 sm:px-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl cultural-header tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent opacity-0 sm:opacity-100 transition-opacity leading-tight">
                  भाषा दीप
                </h1>
                <span className="text-[11px] sm:text-xs font-hindi text-cyan-400/90 font-medium tracking-wide opacity-0 sm:opacity-100 transition-opacity">
                  संथाली ट्रांसलेटर
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2.5 bg-white/5 pl-1 pr-3 py-0.5 rounded-full border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold uppercase">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-cyan-50 hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
                <button 
                  onClick={() => auth.signOut()}
                  className="text-xs text-cyan-200 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-1.5 organic-btn-primary px-4 py-1.5 text-xs font-bold shadow-md group"
              >
                <User className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Login
              </button>
            )}
            <button 
              onClick={() => setSettingsModal(true)}
              className="p-2 bg-white/5 hover:bg-white/10 organic-btn-round transition-colors border border-white/10"
            >
              <Settings className="w-4 h-4 text-cyan-100" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 lg:p-4 flex flex-col gap-2 relative z-10 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Compact Icon-Based Tab Switcher - Now Collapsible */}
        <div className={`fixed left-6 top-1/2 -translate-y-1/2 z-[60] transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-20'}`}>
           <div className={`flex flex-col gap-4 p-2.5 backdrop-blur-xl bg-slate-900/60 rounded-2xl border border-cyan-500/30 shadow-2xl`}>
             <button 
               onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
               className="flex items-center justify-center w-full h-12 rounded-xl text-cyan-400 hover:bg-white/10 transition-all"
             >
               {isSidebarCollapsed ? <PanelLeftClose className="w-6 h-6 rotate-180" /> : <PanelLeftClose className="w-6 h-6" />}
             </button>
             {!isSidebarCollapsed && (
               <>
                 <button 
                   onClick={() => setActiveTab('translate')}
                   title="अनुवाद (Translate)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'translate' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <Languages className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('tutor')}
                   title="शिक्षक (Language Tutor)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'tutor' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <GraduationCap className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('bridge')}
                   title="भाषा सेतु (Live Interpreter)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'bridge' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <Globe className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('nep')}
                   title="NEP शिक्षा सेतु (Education Hub)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'nep' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <School className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('dictionary')}
                   title="शब्दकोश (Dictionary)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'dictionary' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <BookOpen className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('grammar')}
                   title="व्याकरण (Grammar)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'grammar' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <Library className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => setActiveTab('guardian')}
                   title="भाषा प्रहरी (Community Guardian)"
                   className={`flex items-center justify-center w-full h-12 rounded-xl border transition-all duration-300 ${activeTab === 'guardian' ? 'bg-cyan-500/30 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-slate-400 border-transparent hover:bg-white/10 hover:text-cyan-200'}`}
                 >
                   <ShieldCheck className="w-6 h-6" />
                 </button>
               </>
             )}
            </div>
         </div>

         <div className={`flex-1 flex flex-col lg:flex-row gap-6 transition-all duration-500 ${isSidebarCollapsed ? 'ml-0 md:ml-4' : 'ml-0 md:ml-24'}`}>
           <AnimatePresence mode="wait">
             {activeTab === 'translate' && (
               <motion.div 
                 key="translate"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -30 }}
                 className="flex-1 flex flex-col items-center justify-center py-1 lg:py-2 h-full w-full"
               >
                 {/* Immersive Glassmorphic Panel - MAXIMIZED WORKSPACE AREA */}
                 <div className={`digital-slate w-full ${isSidebarCollapsed ? 'max-w-6xl' : 'max-w-5xl'} flex-1 flex flex-col shadow-[0_0_100px_rgba(6,182,212,0.3)] border-cyan-400/20 relative backdrop-blur-3xl rounded-[2rem] overflow-hidden transition-all duration-300`}>
                  
                   {/* Top Bar: Language Toggle - SLIMMER */}
                   <div className="flex items-center justify-center py-1.5 px-3 border-b border-cyan-500/10 bg-slate-900/60 gap-3 shrink-0">
                    <div className={`px-4 py-1.5 rounded-lg border transition-all duration-500 ${sourceLang.includes('Santali') ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-slate-800 text-slate-500'}`}>
                      <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{sourceLang}</span>
                    </div>
                    
                    <button 
                      className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full transition-all text-cyan-200 border border-cyan-500/20 hover:scale-110 active:rotate-180 duration-500 cursor-pointer"
                      onClick={() => {
                        setSourceLang(targetLang);
                        setTargetLang(sourceLang);
                        setSourceText(translatedText);
                        setTranslatedText(sourceText);
                      }}
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                    </button>

                    <div className={`px-4 py-1.5 rounded-lg border transition-all duration-500 ${targetLang.includes('Santali') ? 'border-cyan-400 bg-cyan-400/20 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-slate-800 text-slate-500'}`}>
                      <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{targetLang}</span>
                    </div>
                  </div>

                  {/* Input & Output Stack with Central Mic */}
                  <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden">
                    <div className="flex-1 flex flex-col gap-2 relative h-full">
                      
                      {/* Horizontally Scrollable Quick Phrase Templates */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide shrink-0 px-1">
                        <span className="text-[10px] font-black uppercase text-cyan-500/50 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" /> QUICK:
                        </span>
                        {QUICK_TEMPLATES.map((tpl, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const text = sourceLang.includes('Santali') ? tpl.sat : tpl.hi;
                              setSourceText(text);
                              lastInputMode.current = 'text';
                              setTimeout(() => handleTranslate(text), 150);
                            }}
                            className="bg-slate-900/60 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-400/50 text-cyan-100 rounded-full py-1 px-3.5 text-xs font-semibold tracking-wide transition-all duration-300 transform hover:scale-102 flex items-center justify-center shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            {tpl.label}
                          </button>
                        ))}
                      </div>

                      {/* Input Section - Minimized to give space to product */}
                      <div className="h-[105px] sm:h-[125px] relative bg-slate-950/40 rounded-xl border border-cyan-500/15 p-1.5 shadow-inner shrink-0 flex flex-col justify-between group focus-within:border-cyan-400/40 transition-all">
                        <textarea
                          value={sourceText + (interimSpeechText ? (sourceText ? ' ' : '') + interimSpeechText : '')}
                          onChange={(e) => {
                            lastInputMode.current = 'text';
                            setSourceText(e.target.value);
                            setInterimSpeechText('');
                          }}
                          placeholder={sourceLang.includes('Santali') ? "संथाली लिखें या बोलें..." : "हिंदी में लिखें या बोलें..."}
                          className="w-full h-full p-2 lg:p-4 resize-none outline-none text-xl bg-transparent text-white placeholder:text-cyan-200/20 font-medium overflow-y-auto custom-scrollbar"
                        />
                        {interimSpeechText && (
                          <div className="absolute bottom-2 left-4 text-xs text-emerald-400 font-mono flex items-center gap-1.5 animate-pulse z-10">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Live speech streaming...
                          </div>
                        )}
                        {(sourceText || interimSpeechText) && (
                          <button onClick={() => { setSourceText(''); setInterimSpeechText(''); setTranslatedText(''); }} className="absolute top-4 right-4 p-2 text-cyan-500/40 hover:text-rose-400 transition-colors z-20">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {attachments.length > 0 && (
                          <div className="absolute top-2 left-6 flex flex-wrap gap-2">
                             {attachments.map((a, i) => (
                               <span key={i} className="text-[10px] bg-cyan-400/20 text-cyan-100 px-3 py-1 rounded-full border border-cyan-400/30 animate-pulse uppercase font-black tracking-tighter">
                                  {a.name}
                                </span>
                             ))}
                          </div>
                        )}
                        
                        {/* Real-time Roman Transliteration Preview */}
                        {sourceText && sourceLang.includes('Santali') && (
                          <div className="text-[11px] font-medium text-cyan-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-400/20 pointer-events-none italic max-w-max self-start mb-2 ml-2 shadow-[0_0_15px_rgba(6,182,212,0.1)] z-10">
                            Student Roman: {transliterateDevaToRoman(sourceText)}
                          </div>
                        )}
                      </div>
                      
                      {/* Phonetic Validation Feedback */}
                      {sourceLang.includes('Santali') && phoneticValidation && (!phoneticValidation.isValid || phoneticValidation.suggestions.length > 0) && (
                        <div className="flex flex-col gap-1 px-2 py-1 mt-1 bg-amber-500/10 border border-amber-500/20 rounded-lg max-h-32 overflow-y-auto">
                          {phoneticValidation.issues.map((issue, idx) => (
                            <p key={idx} className="text-[11px] text-amber-200/80 flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 mt-[1px] shrink-0" />
                              {issue}
                            </p>
                          ))}
                          {phoneticValidation.suggestions.map((sug, idx) => (
                            <p key={`sug-${idx}`} className="text-[11px] text-cyan-200/80 flex items-start gap-1">
                              <Info className="w-3 h-3 mt-[1px] shrink-0" />
                              Did you mean <strong className="text-cyan-400">"{sug.standard}"</strong> instead of "{sug.original}"? ({sug.reason})
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Floating Slim Mic Section */}
                      <div className="flex items-center justify-center py-1 relative z-30 shrink-0">
                        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -z-10"></div>
                        <div className="relative group/mic">
                          <div className={`absolute -inset-2 rounded-full blur-[20px] transition-all duration-700 ${isListening || autoListen ? 'bg-cyan-400/40 opacity-100 scale-125' : 'bg-cyan-500/5 opacity-0 group-hover/mic:opacity-30'}`}></div>
                          <button
                            onClick={toggleAutoListen}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 relative z-10 ${
                              autoListen 
                                ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                                : isListening 
                                  ? 'bg-cyan-500/30 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                                  : 'bg-slate-900 border-white/10 hover:border-cyan-500/50 hover:scale-105'
                            }`}
                          >
                            {autoListen ? (
                              <MicOff className="w-5 h-5 text-rose-300 animate-pulse" />
                            ) : (
                              <Mic className={`w-5 h-5 ${isListening ? 'text-white' : 'text-cyan-400/80'}`} />
                            )}
                          </button>
                          <div className={`absolute -top-0 -right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${isSocketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        </div>
                      </div>

                      {/* Output Section - MAXIMIZED SURFACE */}
                      <div className="flex-[8] bg-cyan-500/[0.03] rounded-2xl border border-cyan-400/10 p-4 sm:p-6 relative shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
                         {translatedText ? (
                            <div className="flex flex-col flex-1 pb-16">
                               <div className="markdown-body text-white font-medium text-4xl md:text-5xl leading-relaxed flex-1">
                                  <Markdown>{translatedText}</Markdown>
                                  {isTranslating && (
                                     <span className="inline-block ml-2 w-4 h-8 bg-cyan-400 animate-pulse align-middle"></span>
                                  )}
                               </div>
                               
                               <div className="mt-6 border-t border-cyan-500/10 pt-4 flex flex-wrap justify-end gap-2">
                                   <button 
                                     onClick={analyzeText}
                                     title="व्याकरण और भाषाई विश्लेषण (Analyze Grammar)"
                                     className="p-2.5 bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/20 rounded-xl transition-all shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                                   >
                                     <Sparkles className="w-4 h-4 text-amber-400" />
                                     <span className="hidden sm:inline">Grammar Analysis</span>
                                   </button>
                                   <button 
                                     onClick={() => {
                                       setTeachInputHindi(sourceText);
                                       setTeachInputSantali(translatedText);
                                       setTeachModalOpen(true);
                                     }}
                                     title="AI को सिखाएं / लोकल डेटासेट में जोड़ें (Teach AI / Input Ground Truth)"
                                     className="p-2.5 bg-slate-900/60 backdrop-blur-md border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all shadow-lg flex items-center gap-1.5 text-xs font-semibold"
                                   >
                                     <PlusCircle className="w-4 h-4 text-emerald-400" />
                                     <span className="hidden sm:inline">Teach AI</span>
                                   </button>
                                   <button 
                                     onClick={copyToClipboard}
                                     className="p-2.5 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400 rounded-xl transition-all shadow-lg"
                                   >
                                     {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                   </button>
                                   <button 
                                     onClick={saveToFavorites}
                                     className="p-2.5 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400 rounded-xl transition-all shadow-lg"
                                   >
                                     <ThumbsUp className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={downloadTranslation}
                                     className="p-2.5 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400 rounded-xl transition-all shadow-lg"
                                   >
                                     <Download className="w-4 h-4" />
                                   </button>
                                </div>
                            </div>
                         ) : isTranslating ? (
                            <div className="space-y-6 flex flex-col items-center justify-center h-full">
                              <div className="text-cyan-400/50 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Processing Neural Stream</div>
                              <div className="w-full space-y-3">
                                <div className="h-6 bg-cyan-400/20 rounded-full w-2/3 animate-[pulse_1.5s_infinite] mx-auto"></div>
                                <div className="h-6 bg-cyan-400/10 rounded-full w-full animate-[pulse_2s_infinite]"></div>
                                <div className="h-6 bg-cyan-400/20 rounded-full w-1/2 animate-[pulse_2.5s_infinite] mx-auto"></div>
                              </div>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-20 group">
                              <Languages className="w-20 h-20 mb-6 text-cyan-200 group-hover:scale-110 transition-transform duration-700" />
                              <span className="text-cyan-100 text-2xl font-light tracking-widest uppercase italic font-outfit">Translation will appear here</span>
                            </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar Footer */}
                  <div className="px-3 sm:px-5 py-2 border-t border-cyan-500/20 bg-slate-900/90 rounded-b-2xl flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/*,.txt" multiple className="hidden" />
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                         >
                           <FilePlus className="w-4 h-4" /> ATTACH
                         </button>
                         <button onClick={() => setSettingsModal(true)} className="p-3 bg-slate-900/60 border border-slate-700 text-slate-500 hover:text-cyan-300 rounded-2xl transition-all">
                           <Settings className="w-5 h-5" />
                         </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                           onClick={() => {
                             const text = translatedText || sourceText;
                             const isOutput = !!translatedText;
                             const langStr = isOutput ? targetLang : sourceLang;
                             const langCode = langStr.toLowerCase().includes('english') ? 'en-IN' : 'hi-IN';
                             speakText(text, isOutput ? 'output' : 'source', langCode);
                           }}
                           className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer ${
                             speakingId 
                               ? 'bg-rose-500/20 border-rose-500 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.4)]' 
                               : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-cyan-400 hover:text-cyan-100'
                           }`}
                        >
                          {speakingId ? <Square className="w-4 h-4 fill-current animate-pulse" /> : <Volume2 className="w-5 h-5" />}
                          सुनें (Listen)
                        </button>

                        <button 
                          onClick={() => handleTranslate()}
                          disabled={isTranslating || !sourceText.trim() && attachments.length === 0}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-cyan-500/30 active:scale-95 flex items-center gap-2 disabled:opacity-30 disabled:grayscale cursor-pointer"
                        >
                          {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
                          अनुवाद करें
                        </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'tutor' && (
              <motion.div 
                key="tutor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[500px]"
              >
                <React.Suspense fallback={<TabLoadingSkeleton />}>
                  <LanguageTutor
                    getAI={getAI}
                    speakText={speakText}
                    speakingId={speakingId}
                    showToast={showToast}
                    isListening={isListening}
                    toggleListening={toggleListening}
                    voiceTranscript={tutorVoiceTranscript}
                  />
                </React.Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'dictionary' && (
              <motion.div 
                key="dictionary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col h-[600px]"
              >
                <div className="p-4 border-b border-cyan-500/20 bg-slate-900/40 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg">
                      <BookOpen className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-cyan-50">Santali Dictionary</h2>
                      <p className="text-xs text-cyan-200/70">Search words in Santali, Hindi, or English</p>
                    </div>
                  </div>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={dictSearch}
                        placeholder="Search Santali, Hindi, or English..." 
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-slate-900/50 border border-cyan-500/30 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 rounded-2xl px-4 py-3.5 outline-none transition-all pl-12 pr-20 shadow-sm text-white placeholder:text-cyan-200/50"
                      />
                      <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-200 transition-colors" />
                      
                      {dictSearch && dictValidation && dictValidation.score < 80 && (
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-1 text-amber-500">
                           <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}

                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {dictSearch && (
                          <button 
                            onClick={() => handleSearch('')}
                            className="p-1.5 text-cyan-500/60 hover:text-rose-400 hover:bg-rose-500/20 rounded-full transition-all"
                            aria-label="Clear search"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => toggleListening('dictionary')}
                          className={`p-1.5 rounded-full transition-colors ${
                            isListening && activeTab === 'dictionary'
                              ? 'text-rose-400 bg-rose-500/20 animate-pulse' 
                              : 'text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/50'
                          }`}
                          aria-label="Voice search"
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 bg-slate-900/20">
                  {dictSearch.length === 0 && wordOfTheDay && (
                    <div className="bg-gradient-to-br from-cyan-900/40 to-slate-900/40 p-6 rounded-2xl border border-cyan-500/20 mb-6">
                      <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-2">Word of the Day</h3>
                      <div className="flex items-center justify-between">
                         <h2 className="text-4xl font-bold text-white">{wordOfTheDay.santali_deva}</h2>
                         <button 
                             onClick={() => speakText(wordOfTheDay.santali_deva, wordOfTheDay.entry_id)}
                             className="p-3 bg-cyan-900/50 text-cyan-300 rounded-full hover:bg-cyan-900 transition-all">
                             <Volume2 className="w-5 h-5" />
                         </button>
                      </div>
                      <p className="text-cyan-100 mt-2 italic">{wordOfTheDay.hindi[0]} / {wordOfTheDay.english[0]}</p>
                    </div>
                  )}
                  {dictResults.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cyan-200/50">
                      {isSearchingAI ? (
                        <>
                          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                          <p className="text-sm font-medium">Semantic AI is generating results...</p>
                        </>
                      ) : searchPhase === 'searching' ? (
                        <>
                          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                          <p className="text-sm font-medium">Searching in expanded database...</p>
                        </>
                      ) : (
                        <>
                          <Search className="w-12 h-12 text-cyan-500/40 mb-4" />
                          <p className="text-sm font-medium">No results found for "{dictSearch}"</p>
                          <button 
                            onClick={() => handleAISearch(dictSearch)}
                            className="mt-4 organic-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md transition-all font-medium text-sm"
                          >
                            <Zap className="w-4 h-4" />
                            Search with Miru DNA Engine
                          </button>
                          <p className="text-xs mt-3 text-cyan-400/50">Suggests terms using semantic similarity if not in database</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dictResults.map((entry) => (
                        <div key={entry.entry_id} className="bg-slate-900/60 p-5 rounded-2xl border border-cyan-500/30 shadow-sm relative group hover:border-cyan-400/50 transition-all backdrop-blur-md">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-cyan-50">{entry.santali_deva}</h3>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => speakText(entry.santali_deva, entry.entry_id)}
                                    className={`p-1.5 rounded-lg transition-colors ${speakingId === entry.entry_id ? 'bg-cyan-900 text-cyan-300 animate-pulse' : 'text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/50'}`}
                                  >
                                    {speakingId === entry.entry_id ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(entry.santali_deva);
                                      // Optional: show a small toast or change icon briefly
                                    }}
                                    className="p-1.5 text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/50 rounded-lg transition-colors"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-cyan-200/50 font-medium mt-1">
                                <span className="text-cyan-400 italic">{entry.roman_student}</span> 
                                {entry.ipa && <span className="text-cyan-100/30 font-normal ml-2">/{entry.ipa}/</span>}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-cyan-900/80 text-cyan-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-cyan-500/30">
                              {entry.pos}
                            </span>
                          </div>
                          
                          {entry.confidence && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${entry.confidence > 80 ? 'bg-green-400' : entry.confidence > 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                  style={{ width: `${entry.confidence}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-cyan-400/50">Match: {entry.confidence}%</span>
                            </div>
                          )}

                          {entry.synonyms && entry.synonyms.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {entry.synonyms.map((syn, idx) => (
                                <span key={`${entry.entry_id}-syn-${idx}`} className="text-[9px] bg-slate-900/50 text-cyan-200/70 px-1.5 py-0.5 rounded border border-cyan-500/20">{syn}</span>
                              ))}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                            <div>
                              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">Hindi</h4>
                              <p className="text-sm font-medium text-cyan-50">{entry.hindi.join(', ')}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">English</h4>
                              <p className="text-sm font-medium text-cyan-50">{entry.english.join(', ')}</p>
                            </div>
                          </div>
                          
                          <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/20">
                            <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3">Definitions</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex gap-3">
                                <span className="flex-shrink-0 w-16 text-[10px] font-bold text-cyan-600 uppercase mt-1">Santali</span>
                                <p className="text-cyan-100 leading-relaxed">{entry.definitions.santali}</p>
                              </div>
                              <div className="flex gap-3">
                                <span className="flex-shrink-0 w-16 text-[10px] font-bold text-cyan-600 uppercase mt-1">Hindi</span>
                                <p className="text-cyan-100 leading-relaxed">{entry.definitions.hindi}</p>
                              </div>
                              <div className="flex gap-3">
                                <span className="flex-shrink-0 w-16 text-[10px] font-bold text-cyan-600 uppercase mt-1">English</span>
                                <p className="text-cyan-100 leading-relaxed">{entry.definitions.english}</p>
                              </div>
                            </div>
                          </div>

                          {entry.examples && entry.examples.length > 0 && (
                            <div className="mt-5">
                              <h4 className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-widest mb-3">Usage Examples</h4>
                              <div className="space-y-3">
                                {entry.examples.map((ex, i) => (
                                  <div key={`${entry.entry_id}-ex-${i}`} className="text-sm bg-slate-900/40 p-3.5 rounded-xl border border-cyan-500/10 group/ex relative">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-1">
                                        <p className="font-bold text-cyan-100 text-base">{ex.santali_deva}</p>
                                        <p className="text-cyan-400 italic text-xs">{ex.roman_student}</p>
                                        <p className="text-cyan-200/70 mt-2 font-medium">{ex.hindi}</p>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(`${ex.santali_deva}\n${ex.hindi}`);
                                        }}
                                        className="opacity-0 group-hover/ex:opacity-100 p-1.5 text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/50 rounded-lg transition-all shadow-sm"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'grammar' && (
              <motion.div 
                key="grammar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col min-h-[600px] h-full"
              >
                <div className="p-4 border-b border-cyan-500/20 bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg">
                      <Library className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-cyan-50">व्याकरण (Grammar)</h2>
                      <p className="text-sm font-medium text-cyan-200/50">संथाली भाषा की संरचना के नियम</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-8 text-cyan-100">
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">1. वाक्य संरचना (Sentence Structure)</h3>
                    <p className="mb-4">संथाली में वाक्यों की संरचना आम तौर पर <strong>SOV (Subject-Object-Verb / कर्ता-कर्म-क्रिया)</strong> होती है, जो हिंदी के काफी करीब है।</p>
                    <div className="bg-cyan-900/20 p-4 rounded-xl">
                      <p className="font-semibold text-cyan-50">उदाहरण:</p>
                      <ul className="list-disc list-inside mt-2 space-y-2 text-sm text-cyan-200">
                        <li><strong>हिंदी:</strong> मैं खाना खा रहा हूँ। (कर्ता: मैं, कर्म: खाना, क्रिया: खा रहा हूँ)</li>
                        <li><strong>संथाली:</strong> इञ् दाकाञ् जोमेदा। (कर्ता: इञ् [मैं], कर्म: दाका [चावल/खाना], क्रिया: जोमेदा [खा रहा हूँ])</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">2. सर्वनाम (Pronouns)</h3>
                    <p className="mb-4">संथाली में सर्वनाम तीन वचनों (एकवचन, द्विवचन, बहुवचन) में होते हैं और 'हम' (We) के लिए दो भेद (Inclusive - श्रोता सहित, Exclusive - श्रोता रहित) होते हैं।</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-cyan-500/30 text-cyan-300">
                            <th className="py-2.5 pr-4 font-semibold">स्थिति</th>
                            <th className="py-2.5 px-4 font-semibold">एकवचन (1)</th>
                            <th className="py-2.5 px-4 font-semibold">द्विवचन (2)</th>
                            <th className="py-2.5 pl-4 font-semibold">बहुवचन (3+)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/10">
                          <tr>
                            <td className="py-3 pr-4 font-medium">प्रथम पुरुष (I/We)</td>
                            <td className="py-3 px-4">इञ् (मैं)</td>
                            <td className="py-3 px-4">आलाङ (हम दोनों-सहित)<br/>आलिञ (हम दोनों-रहित)</td>
                            <td className="py-3 pl-4">आबो (हम सब-सहित)<br/>आले (हम सब-रहित)</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">मध्यम पुरुष (You)</td>
                            <td className="py-3 px-4">आम (तुम/आप)</td>
                            <td className="py-3 px-4">आबेन (तुम दोनों)</td>
                            <td className="py-3 pl-4">आपे (तुम सब)</td>
                          </tr>
                          <tr>
                            <td className="py-3 pr-4 font-medium">अन्य पुरुष (He/They)</td>
                            <td className="py-3 px-4">उनि (वह-सजीव)<br/>ओना (वह-निर्जीव)</td>
                            <td className="py-3 px-4">उनकिन (वे दोनों)</td>
                            <td className="py-3 pl-4">उनुको / ओन्को (वे सब)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">3. क्रिया रूप और काल (Verb Conjugation & Tenses)</h3>
                    <p className="mb-4">संथाली में क्रिया के अंत में प्रत्यय (suffixes) लगाकर काल और कर्ता को दर्शाया जाता है। कर्ता का सूचक (जैसे 'ञ्' "मैं" के लिए) अक्सर क्रिया के साथ जुड़ जाता है।</p>
                    <div className="space-y-4">
                      <div className="bg-cyan-900/20 p-4 rounded-xl border-l-2 border-cyan-400 text-sm">
                        <strong className="text-cyan-100 block mb-1">वर्तमान काल (Present Tense) - 'जोम' (खाना):</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-cyan-200">
                          <li>इञ् दाकाञ् जोमेदा (मैं खाना खा रहा हूँ / खाता हूँ)</li>
                          <li>आम दाकाम जोमेदा (तुम खाना खा रहे हो)</li>
                        </ul>
                      </div>
                      <div className="bg-cyan-900/20 p-4 rounded-xl border-l-2 border-amber-400 text-sm">
                        <strong className="text-amber-100 block mb-1">भूतकाल (Past Tense) - 'जोम' (खाना):</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-amber-200/80">
                          <li>इञ् दाकाञ् जोमकेदा (मैंने खाना खाया)</li>
                          <li>आम दाकाम जोमकेदा (तुमने खाना खाया)</li>
                        </ul>
                      </div>
                      <div className="bg-cyan-900/20 p-4 rounded-xl border-l-2 border-emerald-400 text-sm">
                        <strong className="text-emerald-100 block mb-1">भविष्य काल (Future Tense) - 'जोम' (खाना):</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-emerald-200/80">
                          <li>इञ् दाकाञ् जोमा (मैं खाना खाऊंगा)</li>
                          <li>आम दाकाम जोमा (तुम खाना खाओगे)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-cyan-500/20">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">4. कारक (Noun Cases)</h3>
                    <p className="mb-4">संथाली में संज्ञा के साथ विशेष प्रत्यय जोड़कर कारक का निर्माण किया जाता है (जैसे हिंदी में 'का/की', 'को', 'में' इत्यादि)।</p>
                    <ul className="space-y-3 text-sm text-cyan-200">
                      <li className="flex gap-4 items-start"><span className="w-24 flex-shrink-0 font-bold text-cyan-50">सम्बन्ध (-रेयाक् / -आक्):</span><span>दारे रेयाक् साकाम (पेड़ का पत्ता)</span></li>
                      <li className="flex gap-4 items-start"><span className="w-24 flex-shrink-0 font-bold text-cyan-50">अधिकरण (-रे):</span><span>ओड़ाक् रे (घर में)</span></li>
                      <li className="flex gap-4 items-start"><span className="w-24 flex-shrink-0 font-bold text-cyan-50">दिशा/को (-ठेन):</span><span>इञ् ठेन हिजुक् मे (मेरे पास आओ)</span></li>
                      <li className="flex gap-4 items-start"><span className="w-24 flex-shrink-0 font-bold text-cyan-50">से (-खोन):</span><span>ओड़ाक् खोन (घर से)</span></li>
                    </ul>
                  </div>

                  {/* 5. Teach AI & Input Local Ground Truth / Upload Files */}
                  <div className="bg-gradient-to-r from-slate-900/80 via-slate-900/90 to-cyan-950/40 p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-emerald-400" />
                          5. एआई मॉडल को टेक्स्ट/मार्कडाउन फ़ाइलों से सिखाएं (Teach AI with .txt & .md Files)
                        </h3>
                        <p className="text-xs text-cyan-200/70 mt-1">
                          प्रयोक्ता द्वारा अपलोड किए गए टेक्स्ट/मार्कडाउन फ़ाइलों एवं नियमों को मॉडल तुरंत निष्पादित कर अपने Ground Truth में जोड़ लेता है।
                        </p>
                      </div>
                      <button
                        onClick={() => setTeachModalOpen(true)}
                        className="organic-btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 self-start sm:self-auto"
                      >
                        <Upload className="w-4 h-4 text-emerald-300" />
                        फ़ाइल / नोट्स अपलोड करें
                      </button>
                    </div>

                    {/* Quick File Dropzone Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-dashed border-cyan-500/30 rounded-xl p-4 bg-slate-950/60 flex flex-col justify-center items-center text-center relative group hover:border-cyan-400 transition-colors">
                        <input 
                          type="file" 
                          accept=".txt,.md,.markdown,.csv"
                          multiple
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              Array.from(files).forEach(file => handleProcessUploadedFile(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload className="w-8 h-8 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-cyan-200">.txt या .md फ़ाइल अपलोड करने हेतु यहाँ क्लिक करें</p>
                        <p className="text-[10px] text-cyan-200/50">स्वचालित व्याकरण नियम व अनुवाद निष्कर्षण</p>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 flex flex-col justify-between">
                        <div>
                          <label className="block text-xs font-semibold text-cyan-300 mb-1">त्वरित एकल इनपुट (Hindi ➔ Santali)</label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              value={teachInputHindi}
                              onChange={(e) => setTeachInputHindi(e.target.value)}
                              placeholder="हिंदी: पानी"
                              className="bg-slate-900 border border-cyan-500/30 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <input
                              type="text"
                              value={teachInputSantali}
                              onChange={(e) => setTeachInputSantali(e.target.value)}
                              placeholder="संथाली: दाः"
                              className="bg-slate-900 border border-cyan-500/30 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleSaveTeachKnowledge}
                          disabled={!teachInputHindi.trim() || !teachInputSantali.trim()}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          नियम सीखें (Teach Pair)
                        </button>
                      </div>
                    </div>

                    {/* Loaded Docs Counter */}
                    {uploadedDocs.length > 0 && (
                      <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-xs text-cyan-200">
                            <strong>{uploadedDocs.length}</strong> टेक्स्ट/मार्कडाउन फ़ाइलें AI मॉडल की ग्राउंड ट्रुथ मेमोरी में सक्रिय हैं।
                          </p>
                        </div>
                        <button 
                          onClick={() => setTeachModalOpen(true)}
                          className="text-xs text-cyan-400 hover:text-cyan-200 underline font-semibold"
                        >
                          प्रबंधित करें
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
            
            {activeTab === 'bridge' && (
              <motion.div 
                key="bridge"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[500px]"
              >
                <React.Suspense fallback={<TabLoadingSkeleton />}>
                  <BhashaSetuBridge 
                    getAI={getAI} 
                    speakText={speakText} 
                    speakingId={speakingId} 
                    user={user} 
                    db={db} 
                    showToast={showToast} 
                  />
                </React.Suspense>
              </motion.div>
            )}

            {activeTab === 'nep' && (
              <motion.div 
                key="nep"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col h-[calc(100vh-120px)] min-h-[500px]"
              >
                <React.Suspense fallback={<TabLoadingSkeleton />}>
                  <NEPEducationHub 
                    getAI={getAI} 
                    speakText={speakText} 
                    speakingId={speakingId} 
                    showToast={showToast} 
                  />
                </React.Suspense>
              </motion.div>
            )}

            {activeTab === 'guardian' && (
              <motion.div 
                key="guardian"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex-1 digital-slate overflow-hidden flex flex-col h-full"
              >
                <React.Suspense fallback={<TabLoadingSkeleton />}>
                  <LanguageGuardian 
                    user={user} 
                    db={db} 
                    showToast={showToast} 
                    getAI={getAI} 
                  />
                </React.Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analysisModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="digital-slate max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/40">
                <h3 className="font-semibold text-cyan-50 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Text Analysis & Vocabulary
                </h3>
                <button onClick={() => setAnalysisModal({ ...analysisModal, isOpen: false })} className="text-cyan-500/60 hover:text-cyan-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-slate-900/20">
                {analysisModal.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-cyan-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-medium">Analyzing text and extracting vocabulary...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-cyan-500/30">
                      <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Original Text</h4>
                      <p className="text-cyan-50">{analysisModal.text}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Analysis</h4>
                      <div className="markdown-body text-sm">
                        <Markdown>{analysisModal.analysis}</Markdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="digital-slate max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/40">
                <h3 className="font-semibold text-cyan-50 flex items-center gap-2">
                  {feedbackModal.rating === 'up' ? <ThumbsUp className="w-5 h-5 text-green-400" /> : <ThumbsDown className="w-5 h-5 text-rose-400" />}
                  Provide Feedback
                </h3>
                <button onClick={() => setFeedbackModal({ isOpen: false, type: 'translation', rating: null })} className="text-cyan-500/60 hover:text-cyan-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 bg-slate-900/20">
                <p className="text-sm text-cyan-200/70 mb-4">
                  {feedbackModal.rating === 'up' 
                    ? "What did you like about this response?" 
                    : "What was the issue with this response? Your feedback helps us improve."}
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Optional: Provide details or suggest a better translation..."
                  className="w-full h-32 p-3 bg-slate-900/50 border border-cyan-500/30 rounded-xl resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 outline-none text-sm text-white placeholder:text-cyan-200/50"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setFeedbackModal({ isOpen: false, type: 'translation', rating: null })}
                    className="px-4 py-2 text-cyan-400 hover:bg-cyan-900/50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitFeedback}
                    className="organic-btn-primary px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Robot */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end pointer-events-none max-w-[calc(100vw-1.5rem)]">
        
        <AnimatePresence>
          {robotExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-3 sm:mb-4 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] p-0 w-[calc(100vw-1.5rem)] sm:w-80 md:w-96 max-w-[360px] sm:max-w-md flex flex-col overflow-hidden pointer-events-auto h-[400px] sm:h-[450px] max-h-[calc(100vh-100px)]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-3 sm:p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/40 to-transparent shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40">
                    <SohraiRobot className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-cyan-100 text-xs sm:text-sm">मि़रु</h3>
                    <p className="text-[9px] sm:text-[10px] text-cyan-400/80">आपका संथाली मार्गदर्शक</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button 
                    onClick={() => {
                      const lastMsg = robotMessages[robotMessages.length - 1];
                      if (lastMsg) speakText(lastMsg.text, 'robot');
                    }}
                    className={`p-1.5 rounded-full ${speakingId === 'robot' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' : 'hover:bg-slate-800 text-cyan-500/70 hover:text-cyan-300'} transition-all`}
                  >
                    {speakingId === 'robot' ? <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button onClick={() => setRobotExpanded(false)} className="text-cyan-600 hover:text-cyan-400 p-1.5">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 custom-scrollbar" ref={robotChatRef}>
                {robotMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2.5 sm:p-3 rounded-2xl max-w-[88%] text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-cyan-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800/80 border border-cyan-500/20 text-cyan-50 rounded-tl-sm'
                    }`}>
                      <div className="prose prose-invert prose-xs sm:prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-cyan-500/30">
                        <Markdown>
                          {msg.text}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isRobotThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/80 border border-cyan-500/20 p-2.5 sm:p-3 rounded-2xl rounded-tl-sm text-cyan-400 flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-2.5 sm:p-3 bg-slate-900/60 border-t border-cyan-500/20 shrink-0">
                <form onSubmit={handleRobotChatSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={robotInput}
                      onChange={(e) => setRobotInput(e.target.value)}
                      placeholder="मुझसे कुछ भी पूछें..."
                      className="w-full bg-slate-800/50 border border-cyan-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 rounded-xl pl-3 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm outline-none text-white placeholder:text-cyan-200/50"
                    />
                    <button
                      type="button"
                      onClick={startRobotListening}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isRobotListening ? 'text-rose-400 bg-rose-500/20 animate-pulse' : 'text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/50'}`}
                      aria-label="Speak to Miru"
                    >
                      <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!robotInput.trim() || isRobotThinking}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 text-white p-1.5 sm:p-2 rounded-xl transition-colors flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
           drag
           dragConstraints={{ top: -300, left: -300, right: 0, bottom: 0 }}
           className="pointer-events-auto cursor-grab active:cursor-grabbing relative group"
        >
          <div onClick={() => setRobotExpanded(!robotExpanded)} className="relative">
            {!robotExpanded && (
              <div className="absolute -top-6 -left-6 bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap animate-bounce font-medium">
                जोहार! मैं 'मि़रु'
              </div>
            )}
            <SohraiRobot className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-transform duration-700 ease-in-out hover:scale-110 cursor-pointer ${speakingId === 'robot' ? 'animate-pulse' : ''}`} />
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="digital-slate max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/40">
                <h3 className="font-semibold text-cyan-50 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  System Configuration
                </h3>
                <button onClick={() => setSettingsModal(false)} className="text-cyan-500/60 hover:text-cyan-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 bg-slate-900/20">
                <div className="mb-6 bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-cyan-50">Bhashini (NLTM) Integration</h4>
                  </div>
                  <p className="text-sm text-cyan-200/70 mb-4">
                    Connect to the National Language Translation Mission for official, leaderboard-quality translations. If disabled, the system falls back to Gemini 3.1 Pro tuned for Bhashini standards.
                  </p>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={bhashiniConfig.useBhashini}
                        onChange={(e) => setBhashiniConfig({...bhashiniConfig, useBhashini: e.target.checked})}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${bhashiniConfig.useBhashini ? 'bg-cyan-600' : 'bg-slate-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${bhashiniConfig.useBhashini ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="font-medium text-cyan-100">Enable Bhashini API</span>
                  </label>
                </div>

                {bhashiniConfig.useBhashini && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-sm font-medium text-cyan-200/70 mb-1">User ID</label>
                      <input 
                        type="text" 
                        value={bhashiniConfig.userId}
                        onChange={(e) => setBhashiniConfig({...bhashiniConfig, userId: e.target.value})}
                        placeholder="Enter Bhashini User ID"
                        className="w-full bg-slate-900/50 border border-cyan-500/30 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cyan-200/70 mb-1">API Key (ULCA)</label>
                      <input 
                        type="password" 
                        value={bhashiniConfig.apiKey}
                        onChange={(e) => setBhashiniConfig({...bhashiniConfig, apiKey: e.target.value})}
                        placeholder="Enter ULCA API Key"
                        className="w-full bg-slate-900/50 border border-cyan-500/30 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-cyan-200/70 mb-1">Pipeline ID (Optional)</label>
                      <input 
                        type="text" 
                        value={bhashiniConfig.pipelineId}
                        onChange={(e) => setBhashiniConfig({...bhashiniConfig, pipelineId: e.target.value})}
                        placeholder="Default pipeline will be used if empty"
                        className="w-full bg-slate-900/50 border border-cyan-500/30 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 mb-6 bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-semibold text-cyan-50">Gemini API Key (Custom)</h4>
                  </div>
                  <p className="text-sm text-cyan-200/70 mb-4">
                    Provide your own Google Gemini API key to avoid rate limits on the public preview tier.
                  </p>
                  <div>
                    <input 
                      type="password" 
                      value={customGeminiKey}
                      onChange={(e) => setCustomGeminiKey(e.target.value)}
                      placeholder="Enter Gemini API Key"
                      className="w-full bg-slate-900/50 border border-cyan-500/30 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="mt-6 mb-6 bg-cyan-950/40 p-4 rounded-xl border border-cyan-400/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-cyan-300" />
                      <h4 className="font-semibold text-cyan-50">Santali Phonetic TTS Engine</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Tuned Engine
                    </span>
                  </div>
                  <p className="text-xs text-cyan-200/70 mb-4">
                    Custom phonetic synthesizer tuned for Santali glottal stops ( checked vowels / ः ), Ol Chiki script transliteration, and rhythmic postposition prosody.
                  </p>
                  
                  <div className="space-y-4 text-xs text-cyan-100">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Speech Pace / Cadence</span>
                        <span className="text-cyan-300 font-mono">{ttsSettings.rate.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.70" 
                        max="1.00" 
                        step="0.02" 
                        value={ttsSettings.rate}
                        onChange={(e) => setTtsSettings({ ...ttsSettings, rate: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Voice Pitch Tone</span>
                        <span className="text-cyan-300 font-mono">{ttsSettings.pitch.toFixed(2)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.80" 
                        max="1.30" 
                        step="0.05" 
                        value={ttsSettings.pitch}
                        onChange={(e) => setTtsSettings({ ...ttsSettings, pitch: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between">
                      <span className="text-cyan-200/80">Test Santali Phonetic Speech:</span>
                      <button
                        type="button"
                        onClick={() => speakText('जोहार! इञाः बोहोः हासु काना। दाः ञूँ मे।', 'tts-test-sample')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-lg border border-cyan-400/30 transition-colors text-xs font-medium"
                      >
                        {speakingId === 'tts-test-sample' ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                            Stop Speech
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            Test Pronunciation
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setSettingsModal(false)}
                    className="px-4 py-2 text-cyan-400 hover:bg-cyan-900/50 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => saveSettings(bhashiniConfig)}
                    className="organic-btn-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teach AI / Local Knowledge Base Input Modal */}
      <AnimatePresence>
        {teachModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="digital-slate max-w-2xl w-full overflow-hidden shadow-2xl border border-cyan-500/40 rounded-2xl my-8"
            >
              <div className="p-4 border-b border-cyan-500/20 flex justify-between items-center bg-slate-900/80">
                <h3 className="font-bold text-cyan-50 flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Teach AI Model / Input Text & Markdown Knowledge Base
                </h3>
                <button 
                  onClick={() => setTeachModalOpen(false)}
                  className="text-cyan-500/60 hover:text-cyan-300 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-slate-900/60 space-y-5">
                <p className="text-xs text-cyan-200/80 leading-relaxed">
                  उपयोगकर्ता द्वारा अपलोड की गई <strong>.txt</strong> और <strong>.md</strong> फ़ाइलों या सीधे दर्ज किए गए व्याकरण नियमों को मॉडल तुरंत सीख लेता है और सभी अनुवादों में Ground Truth के रूप में प्रयोग करता है।
                </p>

                {/* Sub-tab selection */}
                <div className="flex rounded-xl bg-slate-950/80 p-1 border border-cyan-500/20 gap-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTeachTab('file')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTeachTab === 'file' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-cyan-200/60 hover:text-cyan-200'}`}
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    .txt / .md फ़ाइल अपलोड
                  </button>
                  <button
                    onClick={() => setActiveTeachTab('paste')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTeachTab === 'paste' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-cyan-200/60 hover:text-cyan-200'}`}
                  >
                    <FileCode className="w-4 h-4 text-amber-400" />
                    मार्कडाउन नोट्स चिपकाएं
                  </button>
                  <button
                    onClick={() => setActiveTeachTab('single')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTeachTab === 'single' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-cyan-200/60 hover:text-cyan-200'}`}
                  >
                    <PlusCircle className="w-4 h-4 text-cyan-400" />
                    एकल वाक्य इनपुट
                  </button>
                </div>

                {/* Tab 1: File Upload */}
                {activeTeachTab === 'file' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-cyan-500/30 rounded-2xl p-6 text-center bg-slate-950/40 hover:bg-slate-950/60 transition-colors relative group">
                      <input 
                        type="file" 
                        accept=".txt,.md,.markdown,.csv"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            Array.from(files).forEach(file => handleProcessUploadedFile(file));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload className="w-10 h-10 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-cyan-200">
                        यहाँ .txt या .md फ़ाइलें ड्राप करें या ब्राउज़ करने के लिए क्लिक करें
                      </p>
                      <p className="text-xs text-cyan-200/50 mt-1">
                        समर्थित प्रारूप: Markdown (.md), Plain Text (.txt), CSV Data (.csv)
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        स्वचालित टेबल एवं सूची नियम निष्कर्षण चालू
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Paste Raw Markdown */}
                {activeTeachTab === 'paste' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-cyan-200">
                      संथाली-हिंदी व्याकरण मार्कडाउन नोट्स या तालिका चिपकाएं (.md content)
                    </label>
                    <textarea 
                      rows={6}
                      value={rawMdInput}
                      onChange={(e) => setRawMdInput(e.target.value)}
                      placeholder={`उदा:\n| Hindi | Santali |\n| --- | --- |\n| पानी | दाः |\n| घर | ओड़ाक् |\n\nया साधारण लाइनें:\nमैं जाता हूँ | इञ् चलाक् काना`}
                      className="w-full bg-slate-950 border border-cyan-500/30 text-white rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono placeholder:text-cyan-200/30"
                    />
                    <button
                      onClick={handleProcessPasteMarkdown}
                      disabled={!rawMdInput.trim()}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <FileCode className="w-4 h-4" />
                      नोट्स निष्पादित करें और AI को सिखाएं
                    </button>
                  </div>
                )}

                {/* Tab 3: Single Pair */}
                {activeTeachTab === 'single' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-cyan-200 mb-1">
                        हिंदी वाक्य / नियम (Hindi Source Text) *
                      </label>
                      <input 
                        type="text"
                        value={teachInputHindi}
                        onChange={(e) => setTeachInputHindi(e.target.value)}
                        placeholder="उदा: हम सब विद्यालय जा रहे हैं"
                        className="w-full bg-slate-950 border border-cyan-500/30 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-cyan-200 mb-1">
                        संथाली अनुवाद / व्याकरण नियम (Santali Devanagari / Ol Chiki) *
                      </label>
                      <input 
                        type="text"
                        value={teachInputSantali}
                        onChange={(e) => setTeachInputSantali(e.target.value)}
                        placeholder="उदा: आबो जोतो इसकुल बोन चलाक् काना"
                        className="w-full bg-slate-950 border border-cyan-500/30 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-cyan-200 mb-1">
                        व्याकरण श्रेणी / टिप्पणी (Grammar POS / Note)
                      </label>
                      <select 
                        value={teachInputPos}
                        onChange={(e) => setTeachInputPos(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500/30 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                      >
                        <option value="General Sentence / Grammar Rule">General Sentence / Grammar Rule</option>
                        <option value="Noun (संज्ञा)">Noun (संज्ञा)</option>
                        <option value="Pronoun (सर्वनाम)">Pronoun (सर्वनाम)</option>
                        <option value="Verb Conjugation (क्रिया काल रूप)">Verb Conjugation (क्रिया काल रूप)</option>
                        <option value="Postposition / Case (कारक प्रत्यय)">Postposition / Case (कारक प्रत्यय)</option>
                        <option value="Cultural Idiom (सांस्कृतिक मुहावरा)">Cultural Idiom (सांस्कृतिक मुहावरा)</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleSaveTeachKnowledge}
                      disabled={!teachInputHindi.trim() || !teachInputSantali.trim()}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
                    >
                      <Database className="w-4 h-4 text-emerald-300" />
                      सहेजें और AI को सिखाएं
                    </button>
                  </div>
                )}

                {/* Active Uploaded Documents & Memory List */}
                {uploadedDocs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-2.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      सक्रिय अपलोड की गई टेक्स्ट/मार्कडाउन फ़ाइलें ({uploadedDocs.length}):
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                      {uploadedDocs.map((doc) => (
                        <div 
                          key={doc.id}
                          className="bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/20 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-semibold text-cyan-200 truncate">{doc.fileName}</p>
                              <p className="text-[10px] text-cyan-200/50">
                                {doc.extractedCount} व्याकरण नियम निकाले गए • {new Date(doc.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteUploadedDoc(doc.id)}
                            title="हटाएं"
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-end border-t border-cyan-500/20">
                  <button 
                    onClick={() => setTeachModalOpen(false)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold transition-colors"
                  >
                    बंद करें (Close)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
