import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db, handleFirestoreError } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { OperationType } from '../types';
import { Calendar, Clock, User, MessageSquare, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Booking() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    doctorType: t.booking.doctors[0],
    date: '',
    time: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: user.uid,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({
        doctorType: t.booking.doctors[0],
        date: '',
        time: '',
        description: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="text-center py-20 font-bold text-2xl">Войдите, чтобы записаться к врачу</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight">{t.booking.title}</h1>
        <p className="text-slate-500">Забронируйте удобное время для консультации</p>
      </header>

      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 p-12 rounded-[3rem] text-center"
          >
            <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 dark:shadow-none">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">{t.booking.success}</h2>
            <p className="text-green-700 dark:text-green-400 mb-8 max-w-sm mx-auto">
              Мы свяжемся с вами в ближайшее время для подтверждения записи.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors"
            >
              Сделать еще одну запись
            </button>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-sm space-y-8"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User size={14} className="text-blue-500" /> {t.booking.doctorType}
                </label>
                <select 
                  value={formData.doctorType}
                  onChange={e => setFormData({...formData, doctorType: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all font-medium appearance-none"
                >
                  {t.booking.doctors.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> {t.booking.date}
                  </label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" /> {t.booking.time}
                  </label>
                  <input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" /> {t.booking.description}
                </label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all font-medium h-32 resize-none"
                  placeholder="Опишите ваши симптомы или цель визита..."
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-xl font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 disabled:bg-slate-400"
            >
              {loading ? <Activity className="animate-spin" /> : <ChevronRight />}
              {t.booking.submit}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
