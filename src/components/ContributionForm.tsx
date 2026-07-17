import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, CreditCard, User, Hash, Phone, Mail, 
  Building, Clock, ArrowLeft, ArrowRight, Loader2, 
  ShieldCheck, Smartphone, QrCode, AlertCircle, Sparkles, Calendar, Copy
} from 'lucide-react';
import { Department, Semester, Shift, PaymentMethod, PaymentStatus } from '../types';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const DEPARTMENTS: Department[] = ["Computer", "Electronics", "Electrical", "Civil", "Mechanical", "Refrigeration & Air Conditioning", "Environmental"];
const SEMESTERS: Semester[] = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SHIFTS: Shift[] = ["1st", "2nd"];
const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "bKash", "Nagad", "Rocket"];

const formSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  rollNumber: z.string().min(5, 'Invalid roll number').regex(/^[0-9]+$/, 'Must be digits'),
  registrationNumber: z.string().optional().or(z.literal('')),
  department: z.string().min(1, 'Required'),
  semester: z.string().min(1, 'Required'),
  shift: z.string().min(1, 'Required'),
  academicSession: z.string().min(1, 'Required'),
  mobileNumber: z.string().regex(/^01[3-9][0-9]{8}$/, 'Invalid mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  paymentMethod: z.string().min(1, 'Required'),
  transactionId: z.string().optional(),
  confirmed: z.literal(true, { message: 'Required' }),
});

type FormValues = z.infer<typeof formSchema>;

interface ContributionFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  onBack: () => void;
  lang: 'bn' | 'en';
}

export default function ContributionForm({ onSubmit, onBack, lang }: ContributionFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: 'Cash',
      academicSession: '2021-22',
    }
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'mobileNumber', 'email'];
    if (step === 2) fieldsToValidate = ['rollNumber', 'registrationNumber', 'department', 'semester', 'shift', 'academicSession'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(s => s + 1);
    else toast.error(lang === 'bn' ? 'অনুগ্রহ করে সঠিক তথ্য দিন' : 'Please fix the errors before proceeding');
  };

  const prevStep = () => setStep(s => s - 1);

  const onFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      toast.error(lang === 'bn' ? 'জমা দেওয়া সম্ভব হয়নি' : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = {
    bn: {
      step1: "ব্যক্তিগত তথ্য",
      step2: "একাডেমিক তথ্য",
      step3: "পেমেন্ট ও ভেরিফিকেশন",
      fullName: "পূর্ণ নাম",
      mobile: "মোবাইল নম্বর",
      email: "ইমেইল (ঐচ্ছিক)",
      roll: "রোল নম্বর",
      reg: "রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)",
      dept: "বিভাগ",
      sem: "সেমিস্টার",
      shift: "শিফট",
      session: "শিক্ষাবর্ষ",
      payment: "পেমেন্ট মেথড",
      trx: "ট্রানজেকশন আইডি (TrxID)",
      confirm: "আমি নিশ্চিত করছি যে উপরের সকল তথ্য সঠিক।",
      submit: "তথ্য জমা দিন",
      submitting: "জমা দেওয়া হচ্ছে...",
      next: "পরবর্তী",
      prev: "পূর্ববর্তী",
      back: "ফিরে যান"
    },
    en: {
      step1: "Personal Info",
      step2: "Academic Details",
      step3: "Payment & Verification",
      fullName: "Full Name",
      mobile: "Mobile Number",
      email: "Email (Optional)",
      roll: "Roll Number",
      reg: "Registration No (Optional)",
      dept: "Department",
      sem: "Semester",
      shift: "Shift",
      session: "Academic Session",
      payment: "Payment Method",
      trx: "Transaction ID (TrxID)",
      confirm: "I confirm that all provided information is accurate.",
      submit: "Submit Information",
      submitting: "Submitting...",
      next: "Next Step",
      prev: "Go Back",
      back: "Cancel"
    }
  }[lang];

  const InputWrapper = ({ label, error, children, icon: Icon }: any) => (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400" />}
        {label}
      </label>
      {children}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-400 font-bold uppercase tracking-wider"
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <ShieldCheck className="w-5 h-5 text-indigo-400 animate-pulse" />
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">SECURE REGISTRATION SYSTEM</span>
      </div>

      {/* Progress Indicator */}
      <div className="relative flex justify-between items-center px-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
        <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />
        {[1, 2, 3].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
              step === s ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-transparent shadow-lg shadow-indigo-500/30 scale-110" : 
              step > s ? "bg-emerald-500 border-emerald-400" : "bg-slate-900 border-white/10 text-slate-500"
            )}>
              {step > s ? <Check className="w-6 h-6 text-white" /> : <span className="font-bold text-lg text-white">{s}</span>}
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors",
              step === s ? "text-indigo-400" : "text-slate-500"
            )}>
              {s === 1 ? labels.step1 : s === 2 ? labels.step2 : labels.step3}
            </span>
          </div>
        ))}
      </div>

      {/* Warning Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl border border-amber-500/20 bg-amber-500/10 text-amber-200 flex items-start gap-4 shadow-lg shadow-amber-500/5 relative z-10"
      >
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="text-xs md:text-sm font-semibold leading-relaxed">
            {lang === 'bn' ? (
              <>
                <strong>সতর্কতা:</strong> ভুল তথ্য প্রদান করলে আপনার আবেদন গ্রহণযোগ্য হবে না। কোনো সমস্যা হলে অনুগ্রহ করে{' '}
                <a 
                  href="https://wa.me/8801832313998?text=Hello%20SPI%20Portal%20Support!%20I%20need%20assistance%20regarding%20the%20Senior%20Farewell%20contribution."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-amber-400 hover:text-amber-300 transition-colors font-bold inline-flex items-center gap-1"
                >
                  Contact Support
                </a>
                -এ যোগাযোগ করুন।
              </>
            ) : (
              <>
                <strong>Warning:</strong> Providing incorrect information will make your application invalid. If you face any issues, please contact{' '}
                <a 
                  href="https://wa.me/8801832313998?text=Hello%20SPI%20Portal%20Support!%20I%20need%20assistance%20regarding%20the%20Senior%20Farewell%20contribution."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-amber-400 hover:text-amber-300 transition-colors font-bold inline-flex items-center gap-1"
                >
                  Contact Support
                </a>
                .
              </>
            )}
          </p>
        </div>
      </motion.div>

      <div className="glass-card rounded-[2.5rem] p-8 md:p-12 glow-indigo relative overflow-hidden bg-gradient-to-tr from-indigo-600/5 to-purple-600/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10 relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{labels.step1}</h3>
                  <p className="text-slate-400 text-sm">Please provide your valid contact details.</p>
                </div>
                
                <InputWrapper label={labels.fullName} error={errors.fullName} icon={User}>
                  <input {...register('fullName')} className="glass-input w-full focus:ring-purple-500/20" placeholder={lang === 'bn' ? "আব্দুল্লাহ আল মামুন" : "John Doe"} />
                </InputWrapper>

                <InputWrapper label={labels.mobile} error={errors.mobileNumber} icon={Phone}>
                  <input {...register('mobileNumber')} className="glass-input w-full" placeholder="017xxxxxxxx" />
                </InputWrapper>

                <div className="md:col-span-2">
                  <InputWrapper label={labels.email} error={errors.email} icon={Mail}>
                    <input {...register('email')} className="glass-input w-full" placeholder="example@email.com" />
                  </InputWrapper>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{labels.step2}</h3>
                  <p className="text-slate-400 text-sm">Fill in your college academic records.</p>
                </div>

                <InputWrapper label={labels.roll} error={errors.rollNumber} icon={Hash}>
                  <input {...register('rollNumber')} className="glass-input w-full" placeholder="854932" />
                </InputWrapper>

                <InputWrapper label={labels.reg} error={errors.registrationNumber} icon={Hash}>
                  <input {...register('registrationNumber')} className="glass-input w-full" placeholder="15024958" />
                </InputWrapper>

                <InputWrapper label={labels.dept} error={errors.department} icon={Building}>
                  <select {...register('department')} className="glass-input w-full">
                    <option value="" className="bg-slate-950">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-950">{d}</option>)}
                  </select>
                </InputWrapper>

                <InputWrapper label={labels.sem} error={errors.semester} icon={Clock}>
                  <select {...register('semester')} className="glass-input w-full">
                    <option value="" className="bg-slate-950">Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                  </select>
                </InputWrapper>

                <InputWrapper label={labels.shift} error={errors.shift} icon={Clock}>
                  <select {...register('shift')} className="glass-input w-full">
                    <option value="" className="bg-slate-950">Select Shift</option>
                    {SHIFTS.map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
                  </select>
                </InputWrapper>

                <InputWrapper label={labels.session} error={errors.academicSession} icon={Calendar}>
                  <input {...register('academicSession')} className="glass-input w-full" placeholder="2021-22" />
                </InputWrapper>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{labels.step3}</h3>
                  <p className="text-slate-400 text-sm">Choose payment method and verify transaction.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputWrapper label={labels.payment} error={errors.paymentMethod} icon={CreditCard}>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(m => (
                        <label key={m} className={cn(
                          "flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2",
                          selectedPaymentMethod === m ? "bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        )}>
                          <input {...register('paymentMethod')} type="radio" value={m} className="hidden" />
                          <Smartphone className="w-4 h-4" />
                          <span className="font-bold text-xs">{m}</span>
                        </label>
                      ))}
                    </div>
                  </InputWrapper>

                  <div className="glass-card rounded-3xl p-6 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                      <QrCode className="w-6 h-6" />
                      <span className="font-bold text-sm tracking-widest uppercase">Scan to Pay</span>
                    </div>
                    <div className="flex justify-center group/qr relative">
                      <div className="w-full aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-xl">
                        <Smartphone className="w-10 h-10 text-white mb-3" />
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-black text-lg leading-tight">01894-548232</p>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('01894548232');
                              toast.success('নম্বরটি কপি করা হয়েছে!');
                            }}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all active:scale-90"
                            title="Copy Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Personal Account</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-center text-slate-500 font-bold">01894-548232 (Personal)</p>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedPaymentMethod !== 'Cash' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <InputWrapper label={labels.trx} error={errors.transactionId} icon={Hash}>
                        <input {...register('transactionId')} className="glass-input w-full" placeholder="e.g. AX98210KL" />
                      </InputWrapper>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6 border-t border-white/5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input {...register('confirmed')} type="checkbox" className="peer hidden" />
                      <div className="w-6 h-6 border-2 border-white/20 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-500 transition-all flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" />
                      </div>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors leading-relaxed">
                      {labels.confirm}
                    </span>
                  </label>
                  {errors.confirmed && <p className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">{errors.confirmed.message}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <button 
              type="button" 
              onClick={step === 1 ? onBack : prevStep} 
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? labels.back : labels.prev}
            </button>

            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn-primary px-8 py-4"
              >
                {labels.next}
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="relative group px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-indigo-500/30 min-w-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {labels.submitting}
                </>
              ) : (
                <>
                  {labels.submit}
                  <ShieldCheck className="w-6 h-6" />
                </>
              )}
            </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center justify-center gap-6 text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Portal</span>
        </div>
      </div>
    </div>
  );
}
