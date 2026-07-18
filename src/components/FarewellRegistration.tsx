import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Hash, Building, BookOpen, Clock, 
  Smartphone, Mail, CheckCircle2, AlertCircle, 
  ArrowLeft, Send, Loader2, Info, CheckSquare
} from 'lucide-react';
import { Department, Semester, Shift, FarewellStudent, Language } from '../types';
import { cn } from '../lib/utils';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface FarewellRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
  lang: Language;
}

export default function FarewellRegistration({ onBack, onSuccess, lang }: FarewellRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FarewellStudent>>({
    fullName: '',
    rollNumber: '',
    registrationNumber: '',
    department: 'Civil',
    semester: '8th',
    shift: '1st',
    academicSession: '2022-23',
    mobileNumber: '',
    email: '',
    willAttend: 'Yes',
    remarks: ''
  });

  const content = {
    bn: {
      title: "বিদায়ী শিক্ষার্থীদের তথ্য",
      subtitle: "Outgoing Students Registration",
      infoTitle: "শুধুমাত্র বিদায়ী শিক্ষার্থীদের জন্য",
      infoLine1: "আপনারা কোনো চাঁদা প্রদান করবেন না।",
      infoLine2: "অনুগ্রহ করে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন, যাতে আয়োজক কমিটি মোট বিদায়ী শিক্ষার্থীর সংখ্যা নির্ধারণ করতে পারে।",
      btnSubmit: "তথ্য জমা দিন",
      btnBack: "ফিরে যান",
      agreed: "আমি নিশ্চিত করছি যে উপরের তথ্যগুলো সঠিক।",
      fields: {
        name: "সম্পূর্ণ নাম",
        roll: "রোল নম্বর",
        reg: "রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)",
        dept: "ডিপার্টমেন্ট",
        semester: "পর্ব",
        shift: "শিফট",
        session: "সেশন",
        mobile: "মোবাইল নম্বর",
        email: "ইমেইল (ঐচ্ছিক)",
        attend: "বিদায় অনুষ্ঠানে কি উপস্থিত থাকবেন?",
        remarks: "মন্তব্য (ঐচ্ছিক)"
      },
      validations: {
        duplicate: "এই রোল বা রেজিস্ট্রেশন নম্বর দিয়ে আগে তথ্য জমা দেওয়া হয়েছে।",
        required: "সবগুলো বাধ্যতামূলক ক্ষেত্র পূরণ করুন।"
      },
      welcome: {
        title: "নির্দেশনা",
        message: "অনুগ্রহ করে সব তথ্য সঠিকভাবে প্রদান করুন। বিদায়ী শিক্ষার্থীদের প্রত্যেকের জন্য 'ক্রেস্ট' এর ব্যবস্থা করা হয়েছে, তাই আপনার নাম এবং অন্যান্য তথ্য সঠিক হওয়া বাধ্যতামূলক। ভুল তথ্য প্রদান করলে রেজিস্ট্রেশন বাতিল হতে পারে।",
        btn: "আমি বুঝতে পেরেছি"
      }
    },
    en: {
      title: "Farewell Registration",
      subtitle: "Outgoing Students Registration",
      infoTitle: "Only for Graduating Students",
      infoLine1: "You do not need to pay any contribution.",
      infoLine2: "Please provide accurate information so the committee can prepare according to the number of attendees.",
      btnSubmit: "Submit Information",
      btnBack: "Back to Home",
      agreed: "I confirm that the information provided is correct.",
      fields: {
        name: "Full Name",
        roll: "Roll Number",
        reg: "Registration Number (Optional)",
        dept: "Department",
        semester: "Semester",
        shift: "Shift",
        session: "Session",
        mobile: "Mobile Number",
        email: "Email (Optional)",
        attend: "Will Attend Farewell?",
        remarks: "Remarks (Optional)"
      },
      validations: {
        duplicate: "Roll or Registration number already exists.",
        required: "Please fill all required fields."
      },
      welcome: {
        title: "Important Notice",
        message: "Please ensure all information provided is accurate. A 'Crest' is being prepared for every outgoing student, so your name and details must be correct. Incorrect data may result in registration failure.",
        btn: "I Understand"
      }
    }
  }[lang];

  const checkDuplicates = async () => {
    const coll = collection(db, 'farewell_students');
    
    // Check Roll
    const qRoll = query(coll, where('rollNumber', '==', formData.rollNumber));
    const snapRoll = await getDocs(qRoll);
    if (!snapRoll.empty) return true;

    // Check Reg (if provided)
    if (formData.registrationNumber) {
      const qReg = query(coll, where('registrationNumber', '==', formData.registrationNumber));
      const snapReg = await getDocs(qReg);
      if (!snapReg.empty) return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    
    setLoading(true);
    try {
      const isDuplicate = await checkDuplicates();
      if (isDuplicate) {
        toast.error(content.validations.duplicate);
        setLoading(false);
        return;
      }

      const submissionId = `FW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const metadata = {
        device: navigator.userAgent,
        browser: navigator.appName,
        ip: 'Pending' // Would normally come from server
      };

      await addDoc(collection(db, 'farewell_students'), {
        ...formData,
        submissionId,
        createdAt: new Date().toISOString(),
        metadata
      });

      toast.success(lang === 'bn' ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে' : 'Information saved successfully');
      onSuccess();
    } catch (err) {
      console.error(err);
      setErrorModal(lang === 'bn' 
        ? 'রেজিস্ট্রেশন করতে সমস্যা হচ্ছে। দয়া করে টেকনিক্যাল সাপোর্ট এর সাথে যোগাযোগ করুন।' 
        : 'Registration failed. Please contact technical support for assistance.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "glass-input w-full pl-12 py-4";
  const labelClasses = "text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4 mb-2 block";

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      {/* Error Modal */}
      <AnimatePresence>
        {errorModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 md:p-10 rounded-[2.5rem] max-w-md w-full text-center border-red-500/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
                <AlertCircle className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-black text-white mb-4 tracking-tight">
                {lang === 'bn' ? 'সতর্কতা' : 'Notice'}
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-10 font-medium">
                {errorModal}
              </p>
              <button 
                onClick={() => setErrorModal(null)}
                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-red-600/20"
              >
                {lang === 'bn' ? 'ঠিক আছে' : 'Dismiss'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-10 rounded-[3rem] max-w-lg w-full text-center border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />
            
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-3xl font-display font-black text-white mb-4 tracking-tight">
              {content.welcome.title}
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10 font-medium">
              {content.welcome.message}
            </p>

            <button 
              onClick={() => setShowWelcomeModal(false)}
              className="w-full btn-primary py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-6 h-6" />
              {content.welcome.btn}
            </button>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">{content.btnBack}</span>
          </button>
          <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">{content.title}</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">{content.subtitle}</p>
        </div>
      </div>

      {/* Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5 glow-amber"
      >
        <div className="flex gap-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shrink-0">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-amber-400">{content.infoTitle}</h3>
            <p className="text-amber-100 font-bold text-lg">{content.infoLine1}</p>
            <p className="text-amber-200/60 text-sm leading-relaxed">{content.infoLine2}</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-indigo-400" /> Personal Identity
            </h3>
            
            <div className="relative group">
              <label className={labelClasses}>{content.fields.name}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  required
                  className={inputClasses}
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="relative group">
              <label className={labelClasses}>{content.fields.roll}</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  required
                  className={inputClasses}
                  placeholder="6 Digit Roll"
                  value={formData.rollNumber}
                  onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="relative group">
              <label className={labelClasses}>{content.fields.reg}</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  className={inputClasses}
                  placeholder="Optional"
                  value={formData.registrationNumber}
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-purple-400" /> Academic Records
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClasses}>{content.fields.dept}</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select 
                    className={cn(inputClasses, "pl-11 pr-4")}
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value as Department})}
                  >
                    <option value="Civil">Civil</option>
                    <option value="Computer">Computer</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Environmental">Environmental</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelClasses}>{content.fields.semester}</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select 
                    className={cn(inputClasses, "pl-11 pr-4")}
                    value={formData.semester}
                    onChange={e => setFormData({...formData, semester: e.target.value as Semester})}
                  >
                    <option value="8th">8th</option>
                    <option value="7th">7th</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className={labelClasses}>{content.fields.shift}</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select 
                    className={cn(inputClasses, "pl-11 pr-4")}
                    value={formData.shift}
                    onChange={e => setFormData({...formData, shift: e.target.value as Shift})}
                  >
                    <option value="1st">1st Shift</option>
                    <option value="2nd">2nd Shift</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className={labelClasses}>{content.fields.session}</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select 
                    className={cn(inputClasses, "pl-11 pr-4")}
                    value={formData.academicSession}
                    onChange={e => setFormData({...formData, academicSession: e.target.value})}
                  >
                    <option value="2022-23">2022-23</option>
                    <option value="2021-22">2021-22</option>
                    <option value="2020-21">2020-21</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="relative group">
              <label className={labelClasses}>{content.fields.mobile}</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="tel" 
                  required
                  className={inputClasses}
                  placeholder="01XXXXXXXXX"
                  value={formData.mobileNumber}
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Selection */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <label className={labelClasses}>{content.fields.attend}</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, willAttend: 'Yes'})}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all border",
                    formData.willAttend === 'Yes' 
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                      : "glass-card border-white/5 text-slate-500"
                  )}
                >
                  Yes, I'll attend
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, willAttend: 'No'})}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all border",
                    formData.willAttend === 'No' 
                      ? "bg-rose-500/10 border-rose-500/50 text-rose-400" 
                      : "glass-card border-white/5 text-slate-500"
                  )}
                >
                  No, I can't
                </button>
              </div>
            </div>

            <div className="relative group">
              <label className={labelClasses}>{content.fields.remarks}</label>
              <textarea 
                className={cn(inputClasses, "pl-4 h-[58px] resize-none")}
                placeholder="Optional message..."
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>
          </div>

          <div 
            onClick={() => setIsAgreed(!isAgreed)}
            className="flex items-center gap-4 p-6 glass-card rounded-2xl border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className={cn(
              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
              isAgreed ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-700 text-transparent"
            )}>
              <CheckSquare className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              {content.agreed}
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isAgreed}
            className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                {content.btnSubmit}
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
