import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Users, Calendar, 
  CreditCard, Sparkles, TrendingUp, Info, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStart: () => void;
  lang: 'bn' | 'en';
}

export default function LandingPage({ onStart, lang }: LandingPageProps) {
  const content = {
    bn: {
      title: "সিনিয়র বিদায় সংবর্ধনা",
      year: "২০২৬",
      subtitle: "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট",
      desc: "আপনার যাত্রা উদযাপন করতে এবং ভবিষ্যৎ স্মৃতি উজ্জ্বল করতে আজই আপনার অবদান নিশ্চিত করুন।",
      cta: "অবদান শুরু করুন",
      stats: [
        { label: "অবদানের পরিমাণ", value: "১৫০ টাকা", icon: CreditCard, color: "indigo" },
        { label: "মোট অংশগ্রহণকারী", value: "৫০০+", icon: Users, color: "emerald" },
        { label: "শেষ তারিখ", value: "২৫ জুলাই, ২০২৬", icon: Calendar, color: "amber" },
        { label: "পেমেন্ট স্ট্যাটাস", value: "সুরক্ষিত", icon: ShieldCheck, color: "purple" }
      ],
      notice: "সতর্কতা: ভুল তথ্য প্রদান করলে আপনার আবেদন গ্রহণযোগ্য হবে না।"
    },
    en: {
      title: "Senior Farewell Ceremony",
      year: "2026",
      subtitle: "Satkhira Govt. Polytechnic Institute",
      desc: "Secure your contribution today to celebrate your journey and brighten future memories.",
      cta: "Start Contribution",
      stats: [
        { label: "Contribution", value: "150 BDT", icon: CreditCard, color: "indigo" },
        { label: "Participants", value: "500+", icon: Users, color: "emerald" },
        { label: "Deadline", value: "25 July, 2026", icon: Calendar, color: "amber" },
        { label: "Security", value: "Verified", icon: ShieldCheck, color: "purple" }
      ],
      notice: "Warning: Incorrect information will lead to rejection of your submission."
    }
  }[lang];

  return (
    <div className="space-y-20 relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            Official Portal {lang === 'en' ? '2026' : '২০২৬'}
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-display font-extrabold leading-[1.1] bg-gradient-to-br from-white via-white to-slate-400 bg-clip-text text-transparent"
            >
              {content.title} <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">{content.year}</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {content.desc}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
          >
            <button onClick={onStart} className="relative group px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-indigo-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {content.cta}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                +200
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:w-1/2 w-full">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Visual Decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
            
            <div className="relative glass-card rounded-[2.5rem] overflow-hidden p-3 glow-indigo">
              <div className="relative rounded-[2rem] overflow-hidden group">
                <img 
                  src="/college_building.png" 
                  alt="Campus" 
                  className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8 p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-xl">
                      <img src="/spi_logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{content.subtitle}</h4>
                      <p className="text-slate-400 text-xs font-semibold tracking-wider">SATKHIRA, BANGLADESH</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {content.stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="glass-card p-8 rounded-[2rem] group hover:bg-white/[0.08] transition-all relative overflow-hidden"
          >
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br", 
              stat.color === 'indigo' ? "from-indigo-500" : 
              stat.color === 'emerald' ? "from-emerald-500" : 
              stat.color === 'amber' ? "from-amber-500" : "from-purple-500"
            )} />
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-lg",
              stat.color === 'indigo' ? "bg-indigo-500/10" : 
              stat.color === 'emerald' ? "bg-emerald-500/10" : 
              stat.color === 'amber' ? "bg-amber-500/10" : "bg-purple-500/10"
            )}>
              <stat.icon className={cn("w-7 h-7", 
                stat.color === 'indigo' ? "text-indigo-400" : 
                stat.color === 'emerald' ? "text-emerald-400" : 
                stat.color === 'amber' ? "text-amber-400" : "text-purple-400"
              )} />
            </div>
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Notice Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 p-6 glass-card rounded-3xl border-amber-500/20 bg-amber-500/5"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm md:text-base text-amber-200/80 font-medium">
          {content.notice}
        </p>
      </motion.div>
    </div>
  );
}
