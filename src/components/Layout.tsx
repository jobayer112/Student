import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { Globe, ShieldCheck, ChevronRight, Menu, X } from 'lucide-react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onLanguageChange?: (lang: Language) => void;
  onAdminClick?: () => void;
  currentLang?: Language;
}

export default function Layout({ children, onLanguageChange, onAdminClick, currentLang = 'bn' }: LayoutProps) {
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
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-6'
      }`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden p-1 border border-white/20"
            >
              <img src="/spi_logo.png" alt="SPI Logo" className="w-full h-full object-contain" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-display font-bold tracking-tight text-white leading-none">SPI Portal</h1>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-slate-400 mt-1 font-semibold">Farewell 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={onAdminClick}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all group"
              title="Admin Panel"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onLanguageChange?.(currentLang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 glass-card hover:bg-white/10 rounded-2xl transition-all group text-xs md:text-sm font-medium"
            >
              <Globe className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>{currentLang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-300 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Secure Payment
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-xs md:text-sm font-medium">
            <div className="text-center md:text-left">
              <p className="text-slate-400 mb-1">© 2026 Senior Farewell Committee</p>
              <p>Satkhira Government Polytechnic Institute</p>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
