import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, Gender } from '../types';
import { Save, User, Scale, Ruler, Pill, Activity, Zap, Moon, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
          <User size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Авторизация обязательна</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Пожалуйста, войдите в систему, чтобы редактировать свой профиль здоровья и сохранять данные.</p>
      </div>
    );
  }

  if (!formData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight">{t.profile.title}</h1>
        <p className="text-slate-500">Заполните данные для более точного анализа ИИ</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <User size={20} />
                </div>
                <h3 className="font-bold">Основные данные</h3>
             </div>
             
             <div>
               <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.auth.name}</label>
               <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.auth.age}</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.auth.gender}</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  >
                    <option value={Gender.MALE}>{t.auth.male}</option>
                    <option value={Gender.FEMALE}>{t.auth.female}</option>
                    <option value={Gender.OTHER}>{t.auth.other}</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Scale size={14} /> {t.profile.fields.weight}
                   </label>
                   <input 
                    type="number" 
                    value={formData.weight || ''}
                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || undefined})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Ruler size={14} /> {t.profile.fields.height}
                   </label>
                   <input 
                    type="number" 
                    value={formData.height || ''}
                    onChange={e => setFormData({...formData, height: parseFloat(e.target.value) || undefined})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                   />
                </div>
             </div>
          </div>

          {/* Medical Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                  <Activity size={20} />
                </div>
                <h3 className="font-bold">Медицинская история</h3>
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.profile.fields.allergies}</label>
               <textarea 
                value={formData.allergies || ''}
                onChange={e => setFormData({...formData, allergies: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all h-20 resize-none"
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{t.profile.fields.chronicDiseases}</label>
               <textarea 
                value={formData.chronicDiseases || ''}
                onChange={e => setFormData({...formData, chronicDiseases: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all h-20 resize-none"
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Pill size={14} /> {t.profile.fields.medications}
               </label>
               <input 
                type="text" 
                value={formData.medications || ''}
                onChange={e => setFormData({...formData, medications: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
               />
             </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                <Zap size={20} />
              </div>
              <h3 className="font-bold">Образ жизни</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Moon size={14} /> {t.profile.fields.sleep}
                </label>
                <input 
                  type="text" 
                  value={formData.lifestyle?.sleep || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    lifestyle: { ...(formData.lifestyle || { nutrition: '', sport: '' }), sleep: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  placeholder="7-8 часов"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Utensils size={14} /> {t.profile.fields.nutrition}
                </label>
                <input 
                  type="text" 
                  value={formData.lifestyle?.nutrition || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    lifestyle: { ...(formData.lifestyle || { sleep: '', sport: '' }), nutrition: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  placeholder="Сбалансированное"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Activity size={14} /> {t.profile.fields.sport}
                </label>
                <input 
                  type="text" 
                  value={formData.lifestyle?.sport || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    lifestyle: { ...(formData.lifestyle || { sleep: '', nutrition: '' }), sport: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 focus:ring-2 ring-blue-500 transition-all"
                  placeholder="Бег 3 раза в неделю"
                />
              </div>
           </div>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-xl font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-3 disabled:bg-slate-400"
        >
          {saving ? <Activity className="animate-spin" /> : <Save />}
          {t.profile.save}
        </button>
      </form>
    </div>
  );
}
