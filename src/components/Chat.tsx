import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAIAnalysis, parseAnalysisToJSON } from '../services/geminiService';
import { ChatMessage, HealthRecord, OperationType } from '../types';
import { Send, User, Bot, AlertTriangle, ChevronRight, FileDown, Calendar, Map as MapIcon, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, handleFirestoreError } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

export default function Chat() {
  const { user, profile, signIn } = useAuth();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [structuredResult, setStructuredResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial message
    setMessages([{ role: 'model', content: t.analysis.initialMessage }]);
  }, [t.analysis.initialMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    const response = await getAIAnalysis(newMessages, language);
    
    if (response) {
      setMessages(prev => [...prev, { role: 'model', content: response }]);
      
      // If the response is long enough, try to extract structured data
      if (newMessages.length >= 3) {
        const json = await parseAnalysisToJSON(response);
        if (json) {
          setStructuredResult(json);
          saveRecord(userMessage, response, json);
        }
      }
    }
    setLoading(false);
  };

  const saveRecord = async (symptoms: string, fullAnalysis: string, structured: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'healthRecords'), {
        userId: user.uid,
        date: new Date().toISOString(),
        symptoms,
        analysis: fullAnalysis,
        structuredData: structured,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-100px)] relative">
      {/* Header Info */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-4 rounded-3xl mb-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold">Emdeland AI</h2>
            <p className="text-[10px] text-green-500 font-black tracking-widest uppercase items-center flex gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-1 pb-24 scrollbar-hide"
      >
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex group",
              m.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[90%] md:max-w-[70%] p-4 rounded-3xl shadow-sm",
              m.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-200"
            )}>
              <div className="markdown-body text-sm leading-relaxed">
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <span className="text-sm font-black uppercase tracking-widest animate-pulse">{t.analysis.thinking}</span>
            </div>
          </div>
        )}

        {structuredResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-6"
          >
            <div className={cn(
              "p-6 rounded-[2rem] border-2 shadow-xl",
              structuredResult.severity === 'emergency' 
                ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30" 
                : "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30"
            )}>
              {structuredResult.severity === 'emergency' && (
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-6 font-black uppercase tracking-tighter">
                  <AlertTriangle className="animate-bounce" />
                  {t.emergency}
                </div>
              )}
              
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" />
                {t.analysis.result.title}
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-slate-500 text-xs uppercase uppercase tracking-widest mb-3">{t.analysis.result.causes}</h4>
                  <ul className="space-y-2">
                    {structuredResult.possibleCauses.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium">
                        <ChevronRight size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-500 text-xs uppercase uppercase tracking-widest mb-3">{t.analysis.result.recs}</h4>
                  <ul className="space-y-2">
                    {structuredResult.recommendations.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium">
                        <ChevronRight size={16} className="text-green-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-500 text-xs uppercase uppercase tracking-widest mb-3">{t.analysis.result.summary}</h4>
                <p className="text-slate-800 dark:text-white leading-relaxed">{structuredResult.overallSummary}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/booking')}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  <Calendar size={20} />
                  {t.analysis.result.bookDoctor}
                </button>
                <button 
                  onClick={() => navigate('/map')}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all"
                >
                  <MapIcon size={20} />
                  {t.analysis.result.openMap}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Field */}
      <div className="sticky bottom-0 left-0 right-0 pt-4 pb-2 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-100 dark:shadow-none">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.disclaimer}
            className="flex-1 bg-transparent border-none focus:ring-0 px-5 py-4 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 placeholder:italic"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-[1.25rem] flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper icons
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
