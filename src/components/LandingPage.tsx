import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Users, Calendar, 
  CreditCard, Sparkles, TrendingUp, Info, ChevronRight, Share2,
  AlertTriangle, IdCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Vortex } from './ui/vortex';
import { toast } from 'react-hot-toast';
import { Contribution } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onFarewell: () => void;
  lang: 'bn' | 'en';
  contributions: Contribution[];
}

export default function LandingPage({ onStart, onFarewell, lang, contributions }: LandingPageProps) {
  const content = {
    bn: {
      title: "বিদায় সংবর্ধনা ২০২৬",
      year: "২০২৬",
      subtitle: "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট",
      tagline: "সিভিল টেকনোলজি • ব্যাচ ২২-২৩",
      desc: "আপনার যাত্রা উদযাপন করতে এবং ভবিষ্যৎ স্মৃতি উজ্জ্বল করতে আজই আপনার অবদান নিশ্চিত করুন।",
      cta: "সাধারণ শিক্ষার্থীদের জন্য",
      shareBtn: "সহপাঠীদের সাথে শেয়ার করুন",
      stats: [
        { label: "অবদানের পরিমাণ", value: "১৫০ টাকা", icon: CreditCard, color: "indigo" },
        { label: "মোট অংশগ্রহণকারী", value: "৫০০+", icon: Users, color: "emerald" },
        { label: "শেষ তারিখ", value: "২৫ জুলাই, ২০২৬", icon: Calendar, color: "amber" },
        { label: "পেমেন্ট স্ট্যাটাস", value: "সুরক্ষিত", icon: ShieldCheck, color: "purple" }
      ],
      notice: "ডাউনলোড সংক্রান্ত সতর্কতা: কার্ডটি ডাউনলোড করতে হলে অবশ্যই ডেক্সটপ মুডে থাকতে হবে। অন্যথায় ডাউনলোড হবে না। লিংকটি কপি করুন, এরপর যেকোনো ব্রাউজারে ওপেন করে ডেক্সটপ মুডে নিয়ে আসুন।",
      farewellTitle: "🎓 বিদায়ী শিক্ষার্থীদের তথ্য",
      farewellSubtitle: "Outgoing Students Registration",
      farewellInfo: "শুধুমাত্র বিদায়ী শিক্ষার্থীদের জন্য। আপনাদের প্রত্যেকের জন্য ক্রেস্টের ব্যবস্থা হয়েছে তাই সঠিক তথ্য প্রদান করুন।",
      farewellCta: "বিদায়ী শিক্ষার্থীদের জন্য",
      searchCardBtn: "আপনার ডিজিটাল কার্ড সংগ্রহ করুন",
      searchCardTag: "নতুন"
    },
    en: {
      title: "Farewell Celebration 2026",
      year: "2026",
      subtitle: "Satkhira Government Polytechnic Institute",
      tagline: "Civil Technology • Batch 22-23",
      desc: "Secure your contribution today to celebrate your journey and brighten future memories.",
      cta: "For General Students",
      shareBtn: "Share with Classmates",
      stats: [
        { label: "Contribution", value: "150 BDT", icon: CreditCard, color: "indigo" },
        { label: "Participants", value: "500+", icon: Users, color: "emerald" },
        { label: "Deadline", value: "25 July, 2026", icon: Calendar, color: "amber" },
        { label: "Security", value: "Verified", icon: ShieldCheck, color: "purple" }
      ],
      notice: "Download Notice: To download the card, you must be in Desktop mode. Otherwise, it will not download. Copy the link, then open it in any browser and switch to Desktop mode.",
      farewellTitle: "🎓 Farewell Registration",
      farewellSubtitle: "Outgoing Students Registration",
      farewellInfo: "Only for Graduating students. A special Crest will be provided to each student, so please provide accurate information.",
      farewellCta: "For Outgoing Students",
      searchCardBtn: "Download Digital Card",
      searchCardTag: "New"
    }
  }[lang];

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const title = lang === 'bn' 
      ? "বিদায় সংবর্ধনা ২০২৬ - সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট"
      : "Farewell Celebration 2026 - Satkhira Government Polytechnic Institute";
    const text = lang === 'bn' 
      ? "সাতক্ষীরা সরকারি পলিটেকনিক ইনস্টিটিউট-এর সিভিল টেকনোলজি বিদায় সংবর্ধনা ২০২৬ এর রেজিস্ট্রেশন ও কন্ট্রিবিউশন ফর্ম।" 
      : "Registration and contribution portal for Farewell Celebration 2026 of Civil Technology at Satkhira Government Polytechnic Institute.";

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

  const SPI_IMAGE = "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-polytechnic-satkhira/2024/12/5f51302a85fd44809961b01184e02303.jpg";

  const totalCount = contributions.length;
  const verifiedCount = contributions.filter(c => c.paymentStatus === 'Verified').length;
  const pendingCount = contributions.filter(c => c.paymentStatus === 'Pending').length;
  const totalAmount = verifiedCount * 150;

  const dynamicStats = [
    { 
      label: lang === 'bn' ? "মোট নিবন্ধিত ছাত্র-ছাত্রী" : "Total Registered", 
      value: lang === 'bn' ? `${totalCount} জন` : `${totalCount} Students`, 
      icon: Users, 
      color: "indigo" 
    },
    { 
      label: lang === 'bn' ? "পেমেন্ট সম্পন্ন" : "Verified Payments", 
      value: lang === 'bn' ? `${verifiedCount} জন` : `${verifiedCount} Paid`, 
      icon: ShieldCheck, 
      color: "emerald" 
    },
    { 
      label: lang === 'bn' ? "অপেক্ষমাণ ভেরিফিকেশন" : "Pending Verification", 
      value: lang === 'bn' ? `${pendingCount} জন` : `${pendingCount} Pending`, 
      icon: Calendar, 
      color: "amber" 
    },
    { 
      label: lang === 'bn' ? "সংগৃহীত মোট ফান্ড" : "Total Funds Collected", 
      value: lang === 'bn' ? `${totalAmount} টাকা` : `${totalAmount} BDT`, 
      icon: CreditCard, 
      color: "purple" 
    }
  ];

  const lastThreeNames = contributions.slice(0, 3).map(c => c.fullName);

  return (
    <div className="space-y-16 relative">
      {/* Search Card Floating Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-[280px] sm:max-w-sm z-50 px-4"
      >
        <button 
          onClick={() => (window as any).onSearchCard?.()}
          className="w-full flex items-center justify-between p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/20 transition-all group cursor-pointer shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
              <IdCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest">{content.searchCardBtn}</span>
          </div>
          <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-colors mr-1">
            <span className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-tighter">{content.searchCardTag}</span>
          </div>
        </button>
      </motion.div>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Premium Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-[2.5rem] overflow-hidden group shadow-2xl"
      >
        <div className="absolute inset-0 bg-slate-950/50 z-10" />
        <img 
          src={SPI_IMAGE} 
          alt="Satkhira Government Polytechnic Institute" 
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
            <p className="text-base md:text-xl font-bold text-slate-200 uppercase tracking-[0.2em]">
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
              className="w-full sm:w-auto relative group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/20 flex flex-col items-center justify-center gap-1 cursor-pointer border-t border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-indigo-200" />
                <span className="text-base uppercase tracking-tight">{content.cta}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest group-hover:text-indigo-100 transition-colors">
                {lang === 'bn' ? 'পেমেন্ট ও কন্ট্রিবিউশন' : 'Payment & Contribution'}
              </span>
            </button>

            <button 
              onClick={onFarewell}
              className="w-full sm:w-auto relative group px-8 py-4 bg-amber-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-600/20 flex flex-col items-center justify-center gap-1 cursor-pointer border-t border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span className="text-base uppercase tracking-tight">{content.farewellCta}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] font-bold text-amber-200/70 uppercase tracking-widest group-hover:text-amber-100 transition-colors">
                {lang === 'bn' ? 'ক্রেস্ট ও তথ্য প্রদান' : 'Crest & Info Submission'}
              </span>
            </button>

            <button 
              onClick={handleShare}
              className="hidden sm:flex p-5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/25 text-white rounded-2xl transition-all hover:scale-110 active:scale-90 items-center justify-center group"
              title={content.shareBtn}
            >
              <Share2 className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
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
              {lang === 'bn' ? "বিদায় সংবর্ধনা" : "Farewell Celebration"} <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{lang === 'bn' ? "২০২৬" : "2026"}</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-lg leading-relaxed max-w-xl"
            >
              {content.desc}
            </motion.p>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 glass-card rounded-2xl border-white/5 bg-white/5">
            <div className="flex -space-x-2">
              {lastThreeNames.length > 0 ? (
                lastThreeNames.map((name, i) => (
                  <div key={i} className={cn(
                    "w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-extrabold text-white shadow-lg uppercase",
                    i === 0 ? "bg-indigo-500" : i === 1 ? "bg-purple-500" : "bg-emerald-500"
                  )}>
                    {name.charAt(0)}
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className={cn(
                    "w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-lg",
                    i === 1 ? "bg-indigo-500" : i === 2 ? "bg-purple-500" : "bg-emerald-500"
                  )}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))
              )}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="text-white">+{totalCount}</span> {lang === 'bn' ? 'জন সহপাঠী যুক্ত হয়েছে' : 'Classmates Joined'}
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
              <p className="text-xl md:text-2xl font-bold text-white tracking-tight">22-23</p>
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

      {/* Main Stats and Farewell Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        {/* Left: Stats Grid (Lg: 8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {dynamicStats.map((stat, idx) => (
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
              <p className="text-slate-300 text-sm font-semibold uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Right: Farewell Registration (Lg: 4 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4 p-8 md:p-10 glass-card rounded-[2rem] md:rounded-[2.5rem] border-amber-500/50 bg-amber-500/5 glow-amber border-2 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-500/30 animate-pulse">
              {lang === 'bn' ? 'শুধুমাত্র বিদায়ী শিক্ষার্থীদের জন্য' : 'For Outgoing Students Only'}
            </div>
          </div>

          <div>
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 flex items-center justify-center text-amber-500 mb-8 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{(content as any).farewellTitle}</h3>
            <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-4">{(content as any).farewellSubtitle}</p>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-8">
              <p className="text-amber-200 text-sm leading-relaxed font-bold">
                {(content as any).farewellInfo}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onFarewell}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl group flex items-center justify-center gap-3 text-lg font-bold shadow-xl shadow-amber-600/20 active:scale-95 transition-all"
          >
            {(content as any).farewellCta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-white">
              {lang === 'bn' ? 'লাইভ রেজিস্ট্রেশন ফিড' : 'Live Registration Feed'}
            </h2>
          </div>
          <p className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
            {lang === 'bn' ? 'রিয়েল-টাইম আপডেট' : 'Real-time updates'}
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] border-white/5 bg-white/5 overflow-hidden p-6 md:p-8">
          {contributions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {lang === 'bn' ? 'এখনো কোনো রেজিস্ট্রেশন হয়নি। প্রথম রেজিস্ট্রেশন করতে "অবদান শুরু করুন" বাটনে ক্লিক করুন!' : 'No registrations yet. Click "Start Contribution" to be the first!'}
            </div>
          ) : (
            <div className="divide-y divide-white/5 space-y-4">
              {contributions.slice(0, 5).map((item, idx) => {
                const maskRoll = (roll: string) => {
                  if (!roll) return '';
                  if (roll.length <= 3) return roll;
                  return roll.substring(0, 2) + '***' + roll.substring(roll.length - 1);
                };
                
                const getInitials = (fullName: string) => {
                  const parts = fullName.trim().split(' ');
                  if (parts.length === 0) return 'ST';
                  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                };

                const initials = getInitials(item.fullName);
                
                const formattedDate = () => {
                  try {
                    const date = new Date(item.createdAt);
                    return date.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  } catch (e) {
                    return '';
                  }
                };

                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 first:pt-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-extrabold text-sm tracking-wider shadow-lg shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-white font-bold text-base">{item.fullName}</h4>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-white/5">
                            Roll: {maskRoll(item.rollNumber)}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs mt-1">
                          {item.department} ({item.shift === '1st' ? (lang === 'bn' ? '১ম শিফট' : '1st Shift') : (lang === 'bn' ? '২য় শিফট' : '2nd Shift')}) • {lang === 'bn' ? `${item.semester} পর্ব` : `${item.semester} Semester`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {lang === 'bn' ? 'দাখিলকৃত সময়' : 'Submitted at'}
                        </p>
                        <p className="text-slate-300 text-xs font-medium font-mono mt-0.5">{formattedDate()}</p>
                      </div>

                      <div className={cn(
                        "px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg",
                        item.paymentStatus === 'Verified' 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-emerald-500/5"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-amber-500/5 animate-pulse"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.paymentStatus === 'Verified' ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
                        )} />
                        {item.paymentStatus === 'Verified' 
                          ? (lang === 'bn' ? 'অনুমোদিত' : 'Verified') 
                          : (lang === 'bn' ? 'যাচাইাধীন' : 'Pending')}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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
          <p className="text-slate-300 text-xs md:text-sm max-w-lg mt-4 text-center leading-relaxed">
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
        <p className="text-sm md:text-base text-amber-200 font-bold">
          {content.notice}
        </p>
      </motion.div>
    </div>
  );
}
