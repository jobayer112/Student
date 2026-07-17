import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Users, Calendar, 
  CreditCard, Sparkles, TrendingUp, Info, ChevronRight, Share2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Vortex } from './ui/vortex';
import { toast } from 'react-hot-toast';

interface LandingPageProps {
  onStart: () => void;
  lang: 'bn' | 'en';
}

export default function LandingPage({ onStart, lang }: LandingPageProps) {
  const content = {
    bn: {
      title: "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট",
      year: "২০২৬",
      subtitle: "সিভিল টেকনোলজি ডিজিটাল প্ল্যাটফর্ম",
      tagline: "শিখুন • অনুশীলন করুন • আপনার ক্যারিয়ার গড়ুন",
      desc: "আপনার যাত্রা উদযাপন করতে এবং ভবিষ্যৎ স্মৃতি উজ্জ্বল করতে আজই আপনার অবদান নিশ্চিত করুন।",
      cta: "অবদান শুরু করুন",
      shareBtn: "সহপাঠীদের সাথে শেয়ার করুন",
      stats: [
        { label: "অবদানের পরিমাণ", value: "১৫০ টাকা", icon: CreditCard, color: "indigo" },
        { label: "মোট অংশগ্রহণকারী", value: "৫০০+", icon: Users, color: "emerald" },
        { label: "শেষ তারিখ", value: "২৫ জুলাই, ২০২৬", icon: Calendar, color: "amber" },
        { label: "পেমেন্ট স্ট্যাটাস", value: "সুরক্ষিত", icon: ShieldCheck, color: "purple" }
      ],
      notice: "সতর্কতা: ভুল তথ্য প্রদান করলে আপনার আবেদন গ্রহণযোগ্য হবে না।"
    },
    en: {
      title: "Satkhira Government Polytechnic Institute",
      year: "2026",
      subtitle: "Civil Technology Digital Platform",
      tagline: "Learn • Practice • Build Your Career",
      desc: "Secure your contribution today to celebrate your journey and brighten future memories.",
      cta: "Start Contribution",
      shareBtn: "Share with Classmates",
      stats: [
        { label: "Contribution", value: "150 BDT", icon: CreditCard, color: "indigo" },
        { label: "Participants", value: "500+", icon: Users, color: "emerald" },
        { label: "Deadline", value: "25 July, 2026", icon: Calendar, color: "amber" },
        { label: "Security", value: "Verified", icon: ShieldCheck, color: "purple" }
      ],
      notice: "Warning: Incorrect information will lead to rejection of your submission."
    }
  }[lang];

  const handleShare = async () => {
    const shareUrl = "https://student-regstretion.vercel.app/";
    const title = lang === 'bn' 
      ? "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট - বিদায় সংবর্ধনা ২০২৬"
      : "Satkhira Government Polytechnic Institute - Senior Farewell 2026";
    const text = lang === 'bn' 
      ? "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট-এর সিভিল টেকনোলজি বিদায় সংবর্ধনা ২০২৬ এর রেজিস্ট্রেশন ও কন্ট্রিবিউশন ফর্ম। আপনার তথ্য সাবমিট করতে নিচের লিংকে ভিজিট করুন।" 
      : "Registration and contribution portal for Senior Farewell 2026 of Civil Technology at Satkhira Government Polytechnic Institute. Please register using this link.";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        toast.success(lang === 'bn' ? 'শেয়ার করা সফল হয়েছে!' : 'Shared successfully!');
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(lang === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!');
    }).catch(() => {
      toast.error(lang === 'bn' ? 'লিংক কপি করতে ব্যর্থ হয়েছে।' : 'Failed to copy link.');
    });
  };

  const AI_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnwYM9AjexEoF1f1w6hZVGdD3M1KoLWRWFMNqo9SIsu4nyWcR1gJ0LfM&s=10";
  const SPI_IMAGE = "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-polytechnic-satkhira/2024/12/5f51302a85fd44809961b01184e02303.jpg";

  return (
    <div className="space-y-16 relative">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Floating AI Assistant Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 left-8 z-50 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-xl group-hover:bg-blue-500/60 transition-all" />
          <div className="relative w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-0.5">
            <img 
              src={AI_LOGO} 
              alt="AI Assistant" 
              className="w-full h-full object-cover rounded-full bg-slate-900" 
              loading="lazy"
            />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
        </div>
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest shadow-xl">
          AI Assistant Online
        </div>
      </motion.button>

      {/* Premium Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-[2.5rem] overflow-hidden group shadow-2xl"
      >
        <div className="absolute inset-0 bg-slate-950/50 z-10" />
        <img 
          src={SPI_IMAGE} 
          alt="Satkhira Polytechnic Institute" 
          className="w-full h-[500px] md:h-[650px] object-cover transition-transform duration-10000 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Official Portal {lang === 'en' ? '2026' : '২০২৬'}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-7xl lg:text-8xl font-display font-black text-white leading-none tracking-tight mb-4 drop-shadow-2xl"
          >
            {content.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
              {content.subtitle}
            </p>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto" />
            <p className="text-base md:text-xl font-medium text-slate-300 uppercase tracking-[0.2em]">
              {content.tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center relative z-30"
          >
            <button 
              onClick={onStart}
              className="relative group px-10 py-4.5 bg-white text-slate-950 rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
              {content.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleShare}
              className="relative group px-10 py-4.5 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-white/25 text-white rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 hover:bg-slate-900/60 flex items-center gap-2.5 cursor-pointer"
            >
              <Share2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              {content.shareBtn}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-16 items-start px-2">
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-extrabold leading-tight text-white"
            >
              Farewell Celebration <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Class of 2026</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg leading-relaxed max-w-xl"
            >
              {content.desc}
            </motion.p>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 glass-card rounded-2xl border-white/5 bg-white/5">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn(
                  "w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-lg",
                  i === 1 ? "bg-indigo-500" : i === 2 ? "bg-purple-500" : "bg-emerald-500"
                )}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="text-white">+200</span> Participants Joined
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-5 md:p-8 glass-card rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-white/5 group hover:bg-white/10 transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 md:mb-6">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 md:mb-2">Batch</p>
              <p className="text-xl md:text-2xl font-bold text-white tracking-tight">2026</p>
            </div>
            <div className="p-5 md:p-8 glass-card rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-white/5 group hover:bg-white/10 transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 md:mb-6">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 md:mb-2">Event</p>
              <p className="text-xl md:text-2xl font-bold text-white tracking-tight">Farewell</p>
            </div>
          </div>
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

      {/* Interactive Digital Space Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full rounded-[2.5rem] overflow-hidden h-[400px] md:h-[500px] relative border border-white/5 shadow-2xl bg-black"
      >
        <Vortex
          backgroundColor="#020617"
          rangeY={150}
          particleCount={250}
          className="flex items-center flex-col justify-center px-4 md:px-10 py-12 w-full h-full"
        >
          <Sparkles className="w-8 h-8 text-indigo-400 mb-4 animate-pulse" />
          <h2 className="text-white text-2xl md:text-5xl font-display font-black text-center tracking-tight">
            {lang === 'en' ? 'Interactive Digital Space' : 'ইন্টারেক্টিভ ডিজিটাল স্পেস'}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-lg mt-4 text-center leading-relaxed">
            {lang === 'en' 
              ? 'Experience the flow of modern tech. Drag, hover, and explore our high-speed particle system designed for digital innovation at Satkhira Government Polytechnic Institute.'
              : 'আধুনিক প্রযুক্তির প্রবাহ অনুভব করুন। সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউটের ডিজিটাল উদ্ভাবনের জন্য ডিজাইন করা আমাদের হাই-স্পিড পার্টিকেল সিস্টেমটি অন্বেষণ করুন।'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <button 
              onClick={onStart}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition duration-200 active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {lang === 'en' ? 'Start Contribution' : 'অবদান শুরু করুন'}
            </button>
            <a 
              href="https://wa.me/8801832313998?text=Hello%20SPI%20Portal%20Support!%20I%20need%20assistance%20regarding%20the%20Senior%20Farewell%20contribution." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 text-white border border-white/10 hover:bg-white/5 transition duration-200 rounded-xl font-bold text-xs uppercase tracking-widest"
            >
              {lang === 'en' ? 'Get Support' : 'সাপোর্ট নিন'}
            </a>
          </div>
        </Vortex>
      </motion.div>

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
