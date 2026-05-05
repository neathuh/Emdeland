import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-16">
      <section className="text-center py-12 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-5 pointer-events-none">
          <Activity size={400} className="text-blue-500 absolute -top-20 -left-40 rotate-12" />
          <HeartPulse size={300} className="text-green-500 absolute -bottom-20 -right-40 -rotate-12" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            {t.home.title.split(' ').map((word, i) => (
              <span key={i} className={i > 2 ? 'text-blue-600 dark:text-blue-400' : ''}>{word} </span>
            ))}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.home.subtitle}
          </p>
          <button 
            onClick={() => navigate('/analysis')}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xl font-bold transition-all shadow-2xl shadow-blue-300 dark:shadow-none hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          >
            <Activity className="animate-pulse" />
            {t.home.startBtn}
          </button>
        </motion.div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">{t.home.howItWorks.title}</h2>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {t.home.howItWorks.steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {index + 1}
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
        <ShieldCheck className="absolute top-10 right-10 opacity-10 w-64 h-64" />
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Безопасность прежде всего</h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Наш ИИ обучен быть осторожным. Он умеет распознавать критические ситуации и всегда подскажет, когда нужно срочно вызвать помощь. Ваши данные защищены и используются только для вашего удобства.
          </p>
          <div className="flex flex-wrap gap-4 underline underline-offset-4 decoration-blue-300">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={20} /> Конфиденциальность
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Stethoscope size={20} /> Профессиональная база данных
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Search size={20} /> Постоянное обновление
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
