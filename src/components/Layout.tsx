import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { 
  Home, 
  Activity, 
  History as HistoryIcon, 
  User, 
  Calendar, 
  Map as MapIcon, 
  LogOut, 
  LogIn, 
  Globe,
  Menu,
  X,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signIn, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/analysis', icon: Activity, label: t.nav.analysis },
    { to: '/history', icon: HistoryIcon, label: t.nav.history },
    { to: '/booking', icon: Calendar, label: t.nav.booking },
    { to: '/my-bookings', icon: Plus, label: t.nav.myBookings },
    { to: '/map', icon: MapIcon, label: t.nav.map },
    { to: '/profile', icon: User, label: t.nav.profile },
  ];

  const bottomNavItems = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/analysis', icon: Activity, label: t.nav.analysis },
    { to: '/map', icon: MapIcon, label: t.nav.map },
    { to: '/booking', icon: Calendar, label: t.nav.booking },
    { to: '/profile', icon: User, label: t.nav.profile },
  ];

  const handleLanguageToggle = () => {
    setLanguage(language === Language.RU ? Language.KZ : Language.RU);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Emdeland</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLanguageToggle} className="p-2 text-slate-500">
            <Globe size={20} />
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-900 dark:text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Menu) */}
      <AnimatePresence>
        {(isMenuOpen || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed md:sticky top-0 h-screen w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[60] md:z-40",
              !isMenuOpen && "hidden md:block"
            )}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="hidden md:flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">EMDELAND</h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Health Platform</p>
                </div>
              </div>

              <div className="md:hidden flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Меню</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide py-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-semibold",
                      isActive 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none translate-x-1" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1"
                    )}
                  >
                    <item.icon size={22} className={cn("shrink-0", location.pathname === item.to ? "animate-pulse" : "")} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={handleLanguageToggle}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                >
                  <Globe size={20} />
                  <span className="flex-1 text-left">{language === Language.RU ? 'Қазақ тілі' : 'Русский язык'}</span>
                </button>

                {user ? (
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-semibold"
                  >
                    <LogOut size={20} />
                    Выйти
                  </button>
                ) : (
                  <button
                    onClick={() => { signIn(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 hover:bg-blue-100 transition-all font-bold"
                  >
                    <LogIn size={20} />
                    {t.auth.login}
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 py-6 md:p-8 lg:p-12 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-20 py-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
              <p className="text-sm text-slate-500 max-w-2xl mx-auto italic leading-relaxed px-4">
                {t.disclaimer}
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold tracking-tighter">
                <ShieldCheck size={18} />
                <span>EMDELAND</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                © 2026 Crafted with care for your health
              </p>
            </footer>
          </div>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-2xl transition-all relative",
                isActive 
                  ? "text-blue-600 dark:text-blue-400 scale-110" 
                  : "text-slate-400"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottomNavTab"
                      className="absolute -bottom-1 w-5 h-1 bg-blue-600 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

