import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { HealthRecord } from '../types';
import { Calendar, Trash2, ChevronRight, Activity, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRecords = async () => {
      try {
        const q = query(
          collection(db, 'healthRecords'), 
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HealthRecord[];
        setRecords(data);
      } catch (error) {
        console.error("Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Вы уверены?')) return;
    try {
      await deleteDoc(doc(db, 'healthRecords', id));
      setRecords(records.filter(r => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (!user) return <div className="text-center py-20">Войдите, чтобы увидеть историю</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black mb-2 tracking-tight">{t.nav.history}</h1>
        <p className="text-slate-500">Ваши прошлые анализы и рекомендации</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* List */}
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-3xl animate-pulse" />
            ))
          ) : records.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="mx-auto mb-4 text-slate-300" size={40} />
              <p className="text-slate-500">История пуста</p>
            </div>
          ) : (
            records.map((record) => (
              <div 
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={cn(
                  "p-6 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between",
                  selectedRecord?.id === record.id 
                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    selectedRecord?.id === record.id ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                  )}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-0.5 line-clamp-1">{record.symptoms}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Calendar size={12} />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDelete(record.id, e)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      selectedRecord?.id === record.id ? "hover:bg-red-500" : "hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-300 hover:text-red-500"
                    )}
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight className={cn(
                    "transition-transform",
                    selectedRecord?.id === record.id ? "translate-x-1" : "group-hover:translate-x-1"
                  )} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Details */}
        <AnimatePresence mode="wait">
          {selectedRecord ? (
            <motion.div
              key={selectedRecord.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-fit sticky top-8"
            >
              <h2 className="text-2xl font-black mb-6">Детали анализа</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Симптомы</label>
                  <p className="font-medium text-lg">{selectedRecord.symptoms}</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {(selectedRecord as any).structuredData ? (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                        <h4 className="font-bold text-sm text-blue-600 mb-2 uppercase tracking-tight">Возможные причины</h4>
                        <ul className="space-y-1 text-sm">
                          {(selectedRecord as any).structuredData.possibleCauses.map((c: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-blue-500">•</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl">
                        <h4 className="font-bold text-sm text-green-600 mb-2 uppercase tracking-tight">Рекомендации</h4>
                        <ul className="space-y-1 text-sm">
                          {(selectedRecord as any).structuredData.recommendations.map((c: string, i: number) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-green-500">•</span> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm italic text-slate-500">
                      Подробные данные недоступны для старых записей.
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Полный анализ ИИ</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {selectedRecord.analysis}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Выберите запись из списка слева</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
