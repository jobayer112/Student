import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { Globe, ShieldCheck, ChevronRight, Menu, X, Building2 } from 'lucide-react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onLanguageChange?: (lang: Language) => void;
  onAdminClick?: () => void;
  onLogoClick?: () => void;
  currentLang?: Language;
}

export default function Layout({ children, onLanguageChange, onAdminClick, onLogoClick, currentLang = 'bn' }: LayoutProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-indigo-500/30 font-sans overflow-x-hidden relative">
      <Toaster position="top-right" toastOptions={{
        className: 'glass-card text-white border-white/10 text-sm font-medium rounded-2xl',
        duration: 4000,
      }} />

      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'py-3 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'py-6'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogoClick}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur group-hover:bg-blue-500/40 transition-all" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-slate-900 to-indigo-900">
                <Building2 className="w-6 h-6 md:w-7 md:h-7 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-display font-black tracking-tight text-white leading-none">CIVIL PORTAL</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => onLanguageChange?.(currentLang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-3 px-4 py-2 glass-card hover:bg-white/10 rounded-2xl transition-all group text-xs md:text-sm font-black text-white uppercase tracking-widest"
            >
              <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>{currentLang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/5 rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Access
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-12 px-4 min-h-screen">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-slate-300 text-xs md:text-sm font-semibold">
            <div className="text-center md:text-left">
              <p className="text-slate-200 mb-1">
                <button 
                  onClick={onAdminClick}
                  className="hover:text-white transition-colors cursor-default"
                >
                  ©
                </button> Senior Farewell Committee
              </p>
              <p>Satkhira Government Polytechnic Institute</p>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://wa.me/8801832313998?text=Hello%20SPI%20Portal%20Support!%20I%20need%20assistance%20regarding%20the%20Senior%20Farewell%20contribution." target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
