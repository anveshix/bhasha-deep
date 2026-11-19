import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, MessageSquare, Send, Mic, Volume2, Square, Sparkles, 
  Trash2, Trophy, CheckCircle2, XCircle, ArrowRight, BookOpen, RotateCcw, 
  HelpCircle, Compass, Copy, Check, ChevronRight, Zap, RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { initialDictionary } from '../data/dictionary';
import { searchFullSantaliDatabase } from '../data/santaliGrammarContext';
import type { AiClient } from '../lib/aiClient';
import { DictionaryEntry } from '../types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

interface QuizState {
  active: boolean;
  question: DictionaryEntry;
  options: string[];
  score: number;
  streak: number;
  totalAnswered: number;
  feedback: { message: string; isCorrect: boolean } | null;
  selectedOption: string | null;
}

interface LanguageTutorProps {
  getAI: () => AiClient;
  speakText: (text: string, id: string) => void;
  speakingId: string | null;
  showToast: (message: string, type?: 'error' | 'warning' | 'info') => void;
  isListening?: boolean;
  toggleListening?: (mode: string) => void;
  voiceTranscript?: string;
}

const MODEL_NAME = 'gemini-2.5-flash';

const TUTOR_SYSTEM_INSTRUCTION = (level: string) => `You are "मि़रु", a culturally rooted, deeply patient, and emotionally warm Language Intelligence Engine acting as a Language Tutor. You possess "God Mode" linguistic capabilities for Santali.

PERSONA:
- Intelligent, soft-spoken, respectful, and encouraging.
- A blend of village heritage and modern educational intelligence.
- Emotionally stable, never robotic. Provide human warmth and educational presence.
- Your phrasing should imply a calming, polite, and reassuring tone. Use gentle introductory or encouraging words.

CURRENT LEARNING LEVEL: ${level.toUpperCase()}
- Beginner: Focus on basic vocabulary, simple greetings, and fundamental sentence structures. Use more English/Hindi for explanations.
- Intermediate: Introduce complex grammar rules, cultural idioms, and varied dialogue scenarios. Mix languages equally.
- Advanced: Deep linguistic analysis, rare vocabulary, classical literature references, and immersive Santali explanations.

RULES:
- Explain clearly in Hindi and English alongside Santali.
- Provide structured answers with clear headings or bullet points: Breakdown, Meaning, Grammar notes, and Daily-use Examples.
- Use Devanagari script for Santali phrases with Roman transliteration in parentheses.
- If user input is voice transcribed and phonetically scrambled, reconstruct their intended meaning gracefully.`;

const STARTER_CATEGORIES = [
  {
    category: "Greetings & Basics",
    icon: MessageSquare,
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
    prompts: [
      "How do I say 'Hello' and greet elders respectfully in Santali?",
      "Teach me how to introduce myself in Santali with examples.",
      "What are standard daily polite phrases in Santali?"
    ]
  },
  {
    category: "Grammar & Structure",
    icon: BookOpen,
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
    prompts: [
      "Explain Santali pronouns (Ing, Am, Uni, Aven) with simple sentences.",
      "How do past, present, and future verb tenses work in Santali?",
      "Explain sentence word order in Santali vs Hindi/English."
    ]
  },
  {
    category: "Daily Conversation",
    icon: Compass,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    prompts: [
      "Teach me a practical conversation at a local market in Santali.",
      "How do I ask for directions or help in Santali?",
      "Common phrases for asking someone how they are doing."
    ]
  },
  {
    category: "Cultural Wisdom",
    icon: Sparkles,
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
    prompts: [
      "Share famous Santali proverbs with their deep cultural meanings.",
      "Explain the significance of Sohrai festival terms in Santali.",
      "Teach me Santali numbers 1 to 10 with Ol Chiki references."
    ]
  }
];

export const LanguageTutor: React.FC<LanguageTutorProps> = ({
  getAI,
  speakText,
  speakingId,
  showToast,
  isListening = false,
  toggleListening,
  voiceTranscript = ''
}) => {
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPromptsModal, setShowPromptsModal] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const callGeminiWithRetry = async (ai: AiClient, params: any, retries = 3, delay = 2000): Promise<any> => {
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

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const dbSearch = searchFullSantaliDatabase(query);
      const systemInst = `${TUTOR_SYSTEM_INSTRUCTION(level)}\n\nACTIVELY QUERY AND REFER TO THIS SANTALI GROUND TRUTH DATASET:\n${dbSearch.groundTruthContext}`;

      const response = await callGeminiWithRetry(ai, {
        model: MODEL_NAME,
        contents: [...history, { role: 'user', parts: [{ text: query }] }],
        config: {
          systemInstruction: systemInst,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'क्षमा करें, उत्तर तैयार नहीं हो सका। (Sorry, I could not generate a response.)';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Tutor Chat Error:', err);
      showToast('Error connecting to AI Tutor', 'error');
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: '⚠️ AI connection issue. Please verify your internet connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastVoiceTranscriptRef = useRef('');
  useEffect(() => {
    if (voiceTranscript && voiceTranscript.trim() && voiceTranscript !== lastVoiceTranscriptRef.current) {
      lastVoiceTranscriptRef.current = voiceTranscript;
      handleSendMessage(voiceTranscript);
    }
  }, [voiceTranscript]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start or advance Quiz
  const startNewQuizQuestion = (currentScore = 0, currentStreak = 0, currentTotal = 0) => {
    if (!initialDictionary || initialDictionary.length === 0) return;

    const randomQuestion = initialDictionary[Math.floor(Math.random() * initialDictionary.length)];
    const correctAnswer = randomQuestion.english?.[0] || randomQuestion.hindi?.[0] || 'meaning';

    const otherEntries = initialDictionary.filter(e => e.entry_id !== randomQuestion.entry_id);
    const distractors = otherEntries
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(e => e.english?.[0] || e.hindi?.[0] || 'option');

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    setQuiz({
      active: true,
      question: randomQuestion,
      options,
      score: currentScore,
      streak: currentStreak,
      totalAnswered: currentTotal,
      feedback: null,
      selectedOption: null
    });
  };

  const handleAnswerQuiz = (selectedOption: string) => {
    if (!quiz || quiz.selectedOption !== null) return;

    const correctAnswer = quiz.question.english?.[0] || quiz.question.hindi?.[0];
    const isCorrect = selectedOption === correctAnswer || (quiz.question.hindi && quiz.question.hindi.includes(selectedOption));

    const newScore = isCorrect ? quiz.score + 1 : quiz.score;
    const newStreak = isCorrect ? quiz.streak + 1 : 0;
    const newTotal = quiz.totalAnswered + 1;

    setQuiz({
      ...quiz,
      selectedOption,
      score: newScore,
      streak: newStreak,
      totalAnswered: newTotal,
      feedback: {
        isCorrect,
        message: isCorrect 
          ? `🎉 Correct! "${quiz.question.santali_deva}" (${quiz.question.roman_student}) means "${selectedOption}".`
          : `❌ Not quite! The correct meaning is "${correctAnswer}".`
      }
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/70 rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl backdrop-blur-xl relative">
      
      {/* HEADER BAR */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900/80 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Title & Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Santali AI Tutor <span className="text-cyan-400 font-normal text-sm">("मि़रु")</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Interactive Learning
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Learn grammar, vocabulary, Devanagari script, and conversation naturally
            </p>
          </div>
        </div>

        {/* Level Switcher & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap sm:flex-nowrap">
          
          {/* Level Toggle */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-cyan-500/20 text-xs font-medium">
            {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  showToast(`Level changed to ${lvl.toUpperCase()}`, 'info');
                }}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all duration-200 ${
                  level === lvl 
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' 
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Quiz Toggle Button */}
          <button
            onClick={() => {
              if (quiz?.active) {
                setQuiz(null);
              } else {
                startNewQuizQuestion();
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-md ${
              quiz?.active 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/30'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="hidden xs:inline">{quiz?.active ? 'Close Quiz' : 'Vocab Quiz'}</span>
          </button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                showToast('Chat history cleared', 'info');
              }}
              title="Clear Conversation"
              className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* QUIZ OVERLAY CARD (IF ACTIVE) */}
      {quiz?.active && (
        <div className="bg-slate-900/90 border-b border-cyan-500/30 p-4 sm:p-6 backdrop-blur-2xl relative z-20 transition-all duration-300">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            
            {/* Quiz Header Bar */}
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>Santali Vocab Mastery</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Score: <strong className="text-cyan-400 font-bold text-sm">{quiz.score}</strong></span>
                <span>Streak: <strong className="text-emerald-400 font-bold text-sm">🔥 {quiz.streak}</strong></span>
              </div>
            </div>

            {/* Question Display */}
            <div className="text-center py-2">
              <span className="text-xs uppercase tracking-widest text-cyan-400/80 font-medium block mb-1">
                Select the correct translation:
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-cyan-100 tracking-wide">
                  {quiz.question.santali_deva}
                </span>
                <button
                  onClick={() => speakText(quiz.question.santali_deva, 'quiz-audio')}
                  className="p-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-colors"
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm font-mono text-cyan-300/70 italic mt-1">
                Pronunciation: "{quiz.question.roman_student}" {quiz.question.ipa ? `• IPA ${quiz.question.ipa}` : ''}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quiz.options.map((opt, idx) => {
                const isSelected = quiz.selectedOption === opt;
                const correctAnswer = quiz.question.english?.[0] || quiz.question.hindi?.[0];
                const isThisCorrect = opt === correctAnswer || (quiz.question.hindi && quiz.question.hindi.includes(opt));
                
                let buttonStyle = "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-cyan-950/30";
                
                if (quiz.selectedOption !== null) {
                  if (isThisCorrect) {
                    buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10 font-bold";
                  } else if (isSelected) {
                    buttonStyle = "bg-rose-500/20 border-rose-500 text-rose-200 font-bold";
                  } else {
                    buttonStyle = "bg-slate-950/40 border-slate-900 text-slate-500 opacity-50";
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={quiz.selectedOption !== null}
                    onClick={() => handleAnswerQuiz(opt)}
                    className={`p-3.5 rounded-2xl border text-left text-sm font-medium transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-mono text-cyan-400 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {quiz.selectedOption !== null && isThisCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {quiz.selectedOption !== null && isSelected && !isThisCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {quiz.feedback && (
              <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-950/90 rounded-2xl border border-cyan-500/30">
                <p className="text-xs sm:text-sm font-medium text-cyan-200">
                  {quiz.feedback.message}
                </p>
                <button
                  onClick={() => startNewQuizQuestion(quiz.score, quiz.streak, quiz.totalAnswered)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>Next Word</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar relative">
        
        {/* EMPTY STATE / STARTER PROMPTS HUB */}
        {messages.length === 0 && !quiz?.active && (
          <div className="max-w-3xl mx-auto my-auto py-6 flex flex-col items-center justify-center text-center space-y-6">
            
            <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-xl shadow-cyan-500/5">
              <Sparkles className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Johar! (जोहार) Welcome to your Santali Language Studio
              </h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                I am your personal AI tutor <strong>"मि़रु"</strong>. Ask me grammar questions, practice sentence translations, or pick a starter topic below to begin!
              </p>
            </div>

            {/* Categorized Starter Prompt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left mt-2">
              {STARTER_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col gap-2.5 backdrop-blur-md group"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl bg-gradient-to-r ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        {cat.category}
                      </h4>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {cat.prompts.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(p)}
                          className="text-xs text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-2 rounded-xl text-left transition-colors flex items-center justify-between group/p"
                        >
                          <span className="line-clamp-1">{p}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/p:text-cyan-400 shrink-0 ml-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHAT MESSAGES FEED */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-1">
                  <GraduationCap className="w-4 h-4" />
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[88%] sm:max-w-[80%]`}>
                
                {/* Bubble Container */}
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-lg shadow-cyan-600/20 font-medium'
                      : 'bg-slate-900/80 border border-cyan-500/20 text-slate-100 rounded-tl-xs shadow-xl backdrop-blur-md'
                  }`}
                >
                  {/* Markdown Renderer */}
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                    <Markdown>{msg.text}</Markdown>
                  </div>

                  {/* Actions for AI Messages */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-cyan-500/10 flex items-center justify-between gap-2 text-xs text-slate-400">
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-cyan-400/70 font-mono">
                          {msg.timestamp || 'Just now'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Listen Speech Button */}
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          title="Listen Pronunciation"
                          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                            speakingId === msg.id 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                              : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
                          }`}
                        >
                          {speakingId === msg.id ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current text-cyan-400" />
                              <span className="text-[10px] text-cyan-400">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Listen</span>
                            </>
                          )}
                        </button>

                        {/* Copy Text Button */}
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          title="Copy Answer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Follow-up Chips under AI Response */}
                {!isUser && (
                  <div className="flex flex-wrap gap-1.5 mt-1 ml-1">
                    <button
                      onClick={() => handleSendMessage("Give another example with breakdown")}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all"
                    >
                      💡 Give 2 more examples
                    </button>
                    <button
                      onClick={() => handleSendMessage("Explain this grammar rule step-by-step in simple Hindi")}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all"
                    >
                      🇮🇳 Hindi Breakdown
                    </button>
                    <button
                      onClick={() => handleSendMessage("Show this response in Ol Chiki script too")}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-all"
                    >
                      ✍️ Show Ol Chiki
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-cyan-400 text-xs font-medium bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-500/20 max-w-xs shadow-lg animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>मि़रु AI is thinking and formulating response...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* FOOTER INPUT BAR */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-cyan-500/20 backdrop-blur-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 relative max-w-4xl mx-auto"
        >
          {/* Prompt Topics Toggle Button */}
          <button
            type="button"
            onClick={() => handleSendMessage("Suggest 3 interesting Santali learning topics for me today")}
            title="Get Topic Suggestions"
            className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors shrink-0"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Santali tutor anything (e.g., 'How to say thank you?')"
            disabled={isLoading}
            className="flex-1 bg-slate-950/80 border border-cyan-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl px-4 py-3 sm:py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all pr-12 shadow-inner"
          />

          {/* Voice Input Button */}
          {toggleListening && (
            <button
              type="button"
              onClick={() => toggleListening('tutor')}
              title={isListening ? "Stop Voice Input" : "Start Voice Input"}
              className={`p-2.5 rounded-xl transition-all duration-300 absolute right-16 top-1/2 -translate-y-1/2 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
