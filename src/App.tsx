/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import InitialLoader from './components/InitialLoader';

// Lazy load heavy components
const ContributionForm = lazy(() => import('./components/ContributionForm'));
const SuccessScreen = lazy(() => import('./components/SuccessScreen'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const FarewellRegistration = lazy(() => import('./components/FarewellRegistration'));
const CardSearch = lazy(() => import('./components/CardSearch'));

import { Contribution, FarewellStudent, Language } from './types';
import { Toaster, toast } from 'react-hot-toast';
import { ShieldCheck, X, Award, Loader2 } from 'lucide-react';

type AppState = 'landing' | 'form' | 'success' | 'admin' | 'farewell-form' | 'search-card';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lang, setLang] = useState<Language>('bn');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [lastSubmission, setLastSubmission] = useState<Contribution | FarewellStudent | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  // Verification state for scanned QR Codes
  const [verifiedStudent, setVerifiedStudent] = useState<Contribution | FarewellStudent | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);

  // Expose search function to window for LandingPage button
  React.useEffect(() => {
    (window as any).onSearchCard = () => setState('search-card');
    return () => { delete (window as any).onSearchCard; };
  }, []);

  // Handle QR Code verification
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyId = params.get('verify');
    if (verifyId) {
      setVerificationLoading(true);
      setShowVerifiedModal(true);
      
      // Clean up URL parameter quietly so refreshing doesn't keep popping it
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      Promise.all([
        import('firebase/firestore'),
        import('./lib/firebase')
      ]).then(async ([firestore, firebaseLib]) => {
        const { collection, query, where, getDocs } = firestore;
        const { db } = firebaseLib;

        const q1 = query(collection(db, 'contributions'), where('submissionId', '==', verifyId));
        const q2 = query(collection(db, 'farewell_students'), where('submissionId', '==', verifyId));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

        if (!snap2.empty) {
          setVerifiedStudent(snap2.docs[0].data() as FarewellStudent);
        } else if (!snap1.empty) {
          setVerifiedStudent(snap1.docs[0].data() as Contribution);
        } else {
          toast.error(lang === 'bn' ? 'যাচাইকরণ ব্যর্থ হয়েছে। এই আইডি পাওয়া যায়নি।' : 'Verification failed. ID not found.');
          setShowVerifiedModal(false);
        }
        setVerificationLoading(false);
      }).catch(err => {
        console.error(err);
        setVerificationLoading(false);
        setShowVerifiedModal(false);
      });
    }
  }, [lang]);

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;
    
    Promise.all([
      import('firebase/firestore'),
      import('./lib/firebase')
    ]).then(([firestore, firebaseLib]) => {
      if (!isMounted) return;
      const { collection, query, onSnapshot, orderBy } = firestore;
      const { db, handleFirestoreError, OperationType } = firebaseLib;
      
      const q = query(collection(db, 'contributions'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const list: Contribution[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Contribution);
        });
        setContributions(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contributions');
      });
    }).catch(console.error);

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const [{ collection, addDoc, query, where, getDocs }, { db, handleFirestoreError, OperationType }] = await Promise.all([
        import('firebase/firestore'),
        import('./lib/firebase')
      ]);

      // Check for duplicate roll or registration
      const qRoll = query(collection(db, 'contributions'), where('rollNumber', '==', formData.rollNumber));
      try {
        const snapRoll = await getDocs(qRoll);
        if (!snapRoll.empty) {
          toast.error(lang === 'bn' ? 'এই রোল নম্বরটি ইতিমধ্যে ব্যবহার করা হয়েছে।' : 'This roll number is already registered.');
          return;
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'contributions (roll check)');
      }

      if (formData.registrationNumber) {
        const qReg = query(collection(db, 'contributions'), where('registrationNumber', '==', formData.registrationNumber));
        try {
          const snapReg = await getDocs(qReg);
          if (!snapReg.empty) {
            toast.error(lang === 'bn' ? 'এই রেজিস্ট্রেশন নম্বরটি ইতিমধ্যে ব্যবহার করা হয়েছে।' : 'This registration number is already registered.');
            return;
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'contributions (reg check)');
        }
      }

      const submission: Contribution = {
        ...formData,
        paymentStatus: 'Pending',
        submissionId: 'SPI-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date().toISOString(),
        metadata: {
          device: navigator.userAgent,
          browser: navigator.appName,
        }
      };

      try {
        await addDoc(collection(db, 'contributions'), submission);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'contributions');
      }
      setLastSubmission(submission);
      toast.success(lang === 'bn' ? 'সফলভাবে জমা দেওয়া হয়েছে!' : 'Submitted successfully!');
      setState('success');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error(lang === 'bn' ? 'তথ্য জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Toaster position="top-right" />
      {initialLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <InitialLoader onComplete={() => setInitialLoading(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full min-h-screen bg-slate-950 text-white"
        >
          <Layout 
            onLanguageChange={setLang} 
            onAdminClick={() => setState('admin')} 
            onLogoClick={() => setState('landing')}
            onSearchCard={() => setState('search-card')}
            currentLang={lang}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          >
            <AnimatePresence mode="wait">
              {state === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <LandingPage 
                    onStart={() => setState('form')} 
                    onFarewell={() => setState('farewell-form')}
                    lang={lang} 
                    contributions={contributions} 
                  />
                </motion.div>
              )}

              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              }>
                {state === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ContributionForm 
                      onBack={() => setState('landing')} 
                      onSubmit={handleSubmit} 
                      lang={lang} 
                    />
                  </motion.div>
                )}

                {state === 'farewell-form' && (
                  <motion.div
                    key="farewell-form"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FarewellRegistration 
                      onBack={() => setState('landing')} 
                      onSuccess={(data) => {
                        setLastSubmission(data);
                        setState('success');
                      }} 
                      lang={lang} 
                    />
                  </motion.div>
                )}

                {state === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SuccessScreen 
                      onReset={() => setState('landing')} 
                      lang={lang} 
                      submission={lastSubmission || undefined}
                    />
                  </motion.div>
                )}

                {state === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    <AdminPanel onClose={() => setState('landing')} />
                  </motion.div>
                )}

                {state === 'search-card' && (
                  <motion.div
                    key="search-card"
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CardSearch 
                      onBack={() => setState('landing')} 
                      lang={lang} 
                      viewMode={viewMode}
                    />
                  </motion.div>
                )}
              </Suspense>
            </AnimatePresence>
          </Layout>

          {/* QR Code Verification Modal */}
          <AnimatePresence>
            {showVerifiedModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-gradient-to-b from-[#12131e] to-[#0a0b10] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
                >
                  {/* Luxury Background elements */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                  
                  {/* Close button */}
                  <button 
                    onClick={() => {
                      setShowVerifiedModal(false);
                      setVerifiedStudent(null);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {verificationLoading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                      <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                        {lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying Ticket...'}
                      </p>
                    </div>
                  ) : verifiedStudent ? (
                    <div className="space-y-6 pt-4">
                      {/* Success Badge */}
                      <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-75" />
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-emerald-400 text-xs font-black uppercase tracking-widest">
                          {lang === 'bn' ? 'অফিসিয়াল এন্ট্রি পাস ভেরিফাইড' : 'Official Entry Pass Verified'}
                        </h2>
                        <h3 className="text-2xl font-black text-white tracking-tight">
                          {verifiedStudent.fullName}
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                          {verifiedStudent.department} Technology
                        </p>
                      </div>

                      {/* Details Box */}
                      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-left space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Roll Number</span>
                          <span className="text-white font-black">{verifiedStudent.rollNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Registration</span>
                          <span className="text-slate-300 font-black">{verifiedStudent.registrationNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Shift & Session</span>
                          <span className="text-white font-black">{verifiedStudent.shift} Shift ({verifiedStudent.academicSession})</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Ticket Status</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/20">
                            Active Pass
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-4">
                        <button 
                          onClick={() => {
                            setShowVerifiedModal(false);
                            setVerifiedStudent(null);
                          }}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          {lang === 'bn' ? 'ঠিক আছে' : 'Done / Continue'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                        <X className="w-8 h-8" />
                      </div>
                      <p className="text-red-400 font-bold uppercase tracking-widest text-xs">
                        {lang === 'bn' ? 'যাচাইকরণ ব্যর্থ হয়েছে' : 'Verification Failed'}
                      </p>
                    </div>
                  )}

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

