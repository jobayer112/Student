import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Sparkles } from 'lucide-react';

interface InitialLoaderProps {
  onComplete?: () => void;
}

export default function InitialLoader({ onComplete }: InitialLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 10); // Instant transition
          }
          return 100;
        }
        return prev + Math.floor(Math.random() * 60) + 40; // 40% - 100% per tick
      });
    }, 10); // 10ms interval

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {/* Ambient Radial Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-md px-6 text-center z-10 space-y-6 sm:space-y-8">
        {/* Animated Brand Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-indigo-500/30 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl p-2 sm:p-3">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgG-gXAObx1TDc6U64SMLNk5Pgk5tw_j1uAnD3XTLmDirXuHxvNXOjxe1NgHBVIR2YOi1vb37KrUcZPs9Oc_otqY8T3F_exoUj0BWlIr-sx7EtnoIKemxHinnDYR77HIqerMdnGqEfrV6o0Vn2BSIJ6TzyNdw8z2ryV-B-YUu7rFVcxyKdcaOQnUQEDn_4/s320-rw/images__1_-removebg-preview.png" 
              alt="Satkhira Government Polytechnic Institute Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500/20 border border-purple-500/40 rounded-lg flex items-center justify-center"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
          </motion.div>
        </motion.div>

        {/* Brand Text */}
        <div className="space-y-2 sm:space-y-3">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-display font-black tracking-wider sm:tracking-widest bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent uppercase"
          >
            CIVIL PORTAL
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-indigo-400 uppercase font-black"
          >
            Satkhira Government Polytechnic Institute
          </motion.p>
        </div>

        {/* Beautiful Dynamic Progress Bar */}
        <div className="w-52 sm:w-64 space-y-2 pt-2 sm:pt-4">
          <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            <span>Loading Core Assets</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
