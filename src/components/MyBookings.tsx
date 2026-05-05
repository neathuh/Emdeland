import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { DoctorAppointment } from '../types';
import { Calendar, Clock, User, XCircle, CheckCircle2, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function MyBookings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, 'appointments'), 
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DoctorAppointment[];
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить запись?')) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (error) {
      console.error("Cancel failed:", error);
    }
  };

  if (!user) return <div className="text-center py-20">Войдите, чтобы увидеть свои записи</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'cancelled': return 'Отменено';
      default: return 'Ожидает';
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black mb-2 tracking-tight">{t.nav.myBookings}</h1>
        <p className="text-slate-500">Управление вашими записями к врачам</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <Calendar className="mx-auto mb-4 text-slate-300" size={64} />
           <p className="text-xl font-bold text-slate-500">Записей пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group"
            >
              <div className={cn(
                "absolute top-0 left-0 w-2 h-full",
                app.status === 'confirmed' ? "bg-green-500" : app.status === 'cancelled' ? "bg-red-500" : "bg-amber-500"
              )} />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                   <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", getStatusColor(app.status))}>
                    {getStatusLabel(app.status)}
                  </span>
                  <h3 className="text-2xl font-black mt-3">{app.doctorType}</h3>
                </div>
                <div className="flex flex-col items-end text-sm font-bold text-slate-400">
                   <div className="flex items-center gap-2"><Calendar size={14} /> {app.date}</div>
                   <div className="flex items-center gap-2"><Clock size={14} /> {app.time}</div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl italic text-slate-600 dark:text-slate-400 text-sm">
                "{app.description}"
              </div>

              {app.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancel(app.id)}
                  className="w-full py-4 border-2 border-red-100 hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-red-900/30 text-red-500 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Отменить запись
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
