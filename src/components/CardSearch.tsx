import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, AlertCircle, ArrowLeft, GraduationCap, ShieldCheck, User, Sparkles } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Contribution, FarewellStudent, Language } from '../types';
import StudentCard from './StudentCard';

interface CardSearchProps {
  onBack: () => void;
  lang: Language;
  viewMode: 'mobile' | 'desktop';
}

interface StudentSearchResult {
  student: Contribution | FarewellStudent;
  type: 'general' | 'farewell';
}

const CardSearch: React.FC<CardSearchProps> = React.memo(({ onBack, lang, viewMode }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [allStudents, setAllStudents] = useState<StudentSearchResult[]>([]);
  const [preloadLoading, setPreloadLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState<StudentSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Preload all registered students on mount for instant searching and live-highlighting
  useEffect(() => {
    const preloadAllStudents = async () => {
      try {
        const contributionsRef = collection(db, 'contributions');
        const farewellRef = collection(db, 'farewell_students');

        const [snap1, snap2] = await Promise.all([
          getDocs(contributionsRef),
          getDocs(farewellRef)
        ]);

        const generalList: StudentSearchResult[] = snap1.docs.map(doc => ({
          student: { id: doc.id, ...doc.data() } as Contribution,
          type: 'general'
        }));

        const farewellList: StudentSearchResult[] = snap2.docs.map(doc => ({
          student: { id: doc.id, ...doc.data() } as FarewellStudent,
          type: 'farewell'
        }));

        setAllStudents([...generalList, ...farewellList]);
      } catch (err) {
        console.error('Error preloading search index:', err);
      } finally {
        setPreloadLoading(false);
      }
    };

    preloadAllStudents();
  }, []);

  // Filter and compute suggestions dynamically as the user types
  const suggestions = useMemo(() => {
    const queryTerm = rollNumber.trim().toLowerCase();
    if (!queryTerm) return [];

    return allStudents.filter(item => {
      const nameMatch = item.student.fullName?.toLowerCase().includes(queryTerm);
      const rollMatch = item.student.rollNumber?.toLowerCase().includes(queryTerm);
      return nameMatch || rollMatch;
    }).slice(0, 6); // Limit to top 6 closest matches for visual neatness
  }, [rollNumber, allStudents]);

  // Helper to highlight matching query terms dynamically within results
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    
    // Escape special regex characters in the query
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark 
              key={i} 
              className="bg-red-500/25 text-red-400 font-extrabold px-1 py-0.5 rounded border border-red-500/20 shadow-sm"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Perform exact search upon submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = rollNumber.trim();
    if (!cleanRoll) return;

    setSearchLoading(true);
    setError(null);
    setResult(null);

    // Look up in our local high-speed cache first
    const exactMatch = allStudents.find(
      item => item.student.rollNumber.trim() === cleanRoll
    );

    if (exactMatch) {
      setResult(exactMatch);
      setSearchLoading(false);
    } else {
      // If not found in cache (or cache loading failed), fall back to exact match error
      setError(lang === 'bn' 
        ? 'এই রোল নম্বর দিয়ে কোনো রেজিস্ট্রেশন খুঁজে পাওয়া যায়নি। দয়া করে সঠিক রোল নম্বর দিন।' 
        : 'No registration found with this roll number. Please check and try again.');
      setSearchLoading(false);
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
          <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            {lang === 'bn' ? 'ডিজিটাল কার্ড সংগ্রহ' : 'Collect Digital Card'}
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            {lang === 'bn' ? 'রোল বা নাম দিয়ে সার্চ করে কার্ডটি সংগ্রহ করুন' : 'Search by name or roll to download card'}
          </p>
        </div>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 relative overflow-visible"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <GraduationCap className="w-32 h-32 text-white" />
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-6 max-w-lg mx-auto relative">
            <div className="space-y-2 relative">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                <span>{lang === 'bn' ? 'রোল নম্বর অথবা নাম লিখুন' : 'Enter Roll Number or Name'}</span>
                {preloadLoading && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 tracking-normal lowercase">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    indexing...
                  </span>
                )}
              </label>
              
              <div className="relative group">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${isFocused ? 'text-red-500' : 'text-slate-500'}`} />
                <input 
                  type="text"
                  value={rollNumber}
                  onChange={(e) => {
                    setRollNumber(e.target.value);
                    setError(null);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)} // delay blur to handle suggestions clicking
                  placeholder={lang === 'bn' ? 'যেমন: ৬০৭১২৪ অথবা নাম' : 'e.g. 607124 or Rahim'}
                  className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 rounded-2xl py-5 pl-14 pr-6 text-xl text-white font-black placeholder:text-slate-700 outline-none transition-all focus:ring-4 focus:ring-red-500/10"
                  required
                />
              </div>

              {/* Real-time Search Suggestions Dropdown with Highlighting */}
              <AnimatePresence>
                {isFocused && rollNumber.trim() !== '' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl divide-y divide-white/5"
                  >
                    {suggestions.length > 0 ? (
                      suggestions.map((item, idx) => {
                        const isPaid = item.type === 'general' && (item.student as Contribution).paymentStatus === 'Verified';
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setResult(item);
                              setRollNumber(item.student.rollNumber);
                            }}
                            className="w-full text-left p-4 hover:bg-white/5 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                                item.type === 'farewell' 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {item.type === 'farewell' ? (
                                  <GraduationCap className="w-5 h-5" />
                                ) : (
                                  <User className="w-5 h-5" />
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-white font-bold text-sm group-hover:text-red-400 transition-colors">
                                  {highlightText(item.student.fullName, rollNumber)}
                                </h4>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                  Roll: {highlightText(item.student.rollNumber, rollNumber)} • {item.student.department}
                                </p>
                              </div>
                            </div>

                            {/* Badge Indicators */}
                            <div className="shrink-0 flex items-center gap-2">
                              {item.type === 'farewell' ? (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  {lang === 'bn' ? 'বিদায়ী' : 'Farewell'}
                                </span>
                              ) : isPaid ? (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  {lang === 'bn' ? 'অনুমোদিত' : 'Paid'}
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                                  {lang === 'bn' ? 'সাধারণ' : 'General'}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-5 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {lang === 'bn' ? 'কোনো মিল পাওয়া যায়নি' : 'No matching students found'}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={searchLoading}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl shadow-red-600/20 flex items-center justify-center gap-3 cursor-pointer border-t border-white/15"
            >
              {searchLoading ? (
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
          <StudentCard student={result.student} type={result.type} viewMode={viewMode} />
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => {
                setResult(null);
                setRollNumber('');
              }}
              className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'অন্য কোনো রোল দিয়ে সার্চ করুন' : 'Search for another roll'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
});

export default CardSearch;
