import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Contribution, FarewellStudent, Language } from '../types';
import StudentCard from './StudentCard';

interface CardSearchProps {
  onBack: () => void;
  lang: Language;
}

const CardSearch: React.FC<CardSearchProps> = ({ onBack, lang }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ student: Contribution | FarewellStudent; type: 'general' | 'farewell' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First search in contributions (general students)
      const contributionsRef = collection(db, 'contributions');
      const q1 = query(contributionsRef, where('rollNumber', '==', rollNumber.trim()));
      const snap1 = await getDocs(q1);

      if (!snap1.empty) {
        setResult({ 
          student: snap1.docs[0].data() as Contribution, 
          type: 'general' 
        });
        setLoading(false);
        return;
      }

      // If not found, search in farewell students
      const farewellRef = collection(db, 'farewell');
      const q2 = query(farewellRef, where('rollNumber', '==', rollNumber.trim()));
      const snap2 = await getDocs(q2);

      if (!snap2.empty) {
        setResult({ 
          student: snap2.docs[0].data() as FarewellStudent, 
          type: 'farewell' 
        });
      } else {
        setError(lang === 'bn' 
          ? 'এই রোল নম্বর দিয়ে কোনো রেজিস্ট্রেশন খুঁজে পাওয়া যায়নি। দয়া করে সঠিক রোল নম্বর দিন।' 
          : 'No registration found with this roll number. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'bn' 
        ? 'সার্চ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' 
        : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            {lang === 'bn' ? 'ডিজিটাল কার্ড সংগ্রহ' : 'Collect Digital Card'}
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {lang === 'bn' ? 'আপনার রোল দিয়ে কার্ডটি ডাউনলোড করুন' : 'Download your card using roll number'}
          </p>
        </div>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <GraduationCap className="w-32 h-32 text-white" />
          </div>

          <form onSubmit={handleSearch} className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">
                {lang === 'bn' ? 'রোল নম্বর লিখুন' : 'Enter Roll Number'}
              </label>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                <input 
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ৬০৭১২৪' : 'e.g. 607124'}
                  className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 rounded-2xl py-5 pl-14 pr-6 text-xl text-white font-black placeholder:text-slate-700 outline-none transition-all focus:ring-4 focus:ring-red-500/10"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-red-600/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {lang === 'bn' ? 'সার্চ করা হচ্ছে...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  {lang === 'bn' ? 'কার্ড খুঁজুন' : 'Find Card'}
                </>
              )}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <StudentCard student={result.student} type={result.type} />
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => setResult(null)}
              className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
            >
              {lang === 'bn' ? 'অন্য কোনো রোল দিয়ে সার্চ করুন' : 'Search for another roll'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CardSearch;
