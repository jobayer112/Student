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

import { collection, addDoc, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { Contribution, Language } from './types';
import toast from 'react-hot-toast';

type AppState = 'landing' | 'form' | 'success' | 'admin' | 'farewell-form';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lang, setLang] = useState<Language>('bn');
  const [lastSubmission, setLastSubmission] = useState<Contribution | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'contributions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Contribution[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Contribution);
      });
      setContributions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contributions');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
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
      {initialLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <InitialLoader onComplete={() => setInitialLoading(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full min-h-screen bg-slate-950 text-white"
        >
          <Layout 
            onLanguageChange={setLang} 
            onAdminClick={() => setState('admin')} 
            onLogoClick={() => setState('landing')}
            currentLang={lang}
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
                      onSuccess={() => setState('success')} 
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
              </Suspense>
            </AnimatePresence>
          </Layout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

