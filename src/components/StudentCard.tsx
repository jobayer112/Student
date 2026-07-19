import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Download, User, Hash, Calendar, Phone, ShieldCheck, 
  Camera, Clock, MapPin, Sparkles, Award, BookOpen, 
  Heart, Mail, CheckCircle, Info, Landmark, HelpCircle,
  Eye, FileSpreadsheet
} from 'lucide-react';
import { Contribution, FarewellStudent } from '../types';

interface StudentCardProps {
  student: Contribution | FarewellStudent;
  type: 'general' | 'farewell';
  viewMode: 'mobile' | 'desktop';
}

const DEFAULT_LOGO = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnwYM9AjexEoF1f1w6hZVGdD3M1KoLWRWFMNqo9SIsu4nyWcR1gJ0LfM&s=10';
const PROXIED_DEFAULT_LOGO = `/api/proxy-image?url=${encodeURIComponent(DEFAULT_LOGO)}`;

const StudentCard: React.FC<StudentCardProps> = React.memo(({ student, type, viewMode }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>(PROXIED_DEFAULT_LOGO);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  // Pre-load logo as base64 to avoid CORS issues in export
  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(PROXIED_DEFAULT_LOGO);
        if (!response.ok) throw new Error('Proxy returned non-ok status');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to convert logo to base64, keeping proxied image URL:', err);
      }
    };
    fetchLogo();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Please upload an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      toast.success('Photo uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to upload photo. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const downloadCard = async (side: 'front' | 'back') => {
    const ref = side === 'front' ? frontCardRef.current : backCardRef.current;
    if (!ref) return;

    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const dataUrl = await toPng(ref, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: '#0c0d12',
        filter: (node) => node.tagName !== 'INPUT'
      });
      const link = document.createElement('a');
      link.download = `SPI-Farewell2026-${side.toUpperCase()}-${student.rollNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Card downloaded successfully!');
    } catch (err) {
      console.error('Failed to download card. Details:', err);
      toast.error('Download failed. Browser security may be blocking it. Please use the "Print / Download Card" button above instead, which saves as a high-quality PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Safe fallback values
  const semesterVal = student.semester || '8th';
  const sessionVal = student.academicSession || '2023–24';
  const shiftVal = student.shift || '1st';
  const regNo = student.registrationNumber || 'N/A';

  return (
    <div className="flex flex-col items-center gap-4 w-full mx-auto py-4 px-3">
      
      {/* Dynamic Selector Tabs */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shadow-lg w-full max-w-[380px]">
        <button
          onClick={() => setActiveSide('front')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
            activeSide === 'front' 
              ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Front
        </button>
        <button
          onClick={() => setActiveSide('back')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
            activeSide === 'back' 
              ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Back
        </button>
      </div>


      
      <button
        onClick={handlePrint}
        className="w-full mt-6 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
      >
        <Download className="w-5 h-5" />
        Print / Download Card
      </button>

      {/* Main Interactive Stage */}
      <div className="w-full flex justify-center items-center overflow-hidden py-2">
        <AnimatePresence mode="wait">
          {activeSide === 'front' ? (
            <motion.div
              key="front-card"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-[98%] sm:w-[95%] max-w-[500px] aspect-[85.6/54] shadow-[0_20px_40px_rgba(0,0,0,0.7)] rounded-[1.5rem] overflow-hidden border border-amber-500/30"
            >
              {/* Card Container For Print (Fixed size in export, responsive scale in UI) */}
              <div 
                id="printable-card"
                ref={frontCardRef}
                className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#12131a] to-[#050508] relative select-none p-5 sm:p-8 flex flex-col justify-between overflow-hidden"
              >
                {/* Red Luxury Corner Highlights */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-red-600/15 to-transparent blur-xl rounded-full" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-amber-500/15 to-transparent blur-xl rounded-full" />

                {/* Subtle Gold / Blueprint Line Art Background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-front" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d97706" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-front)" />
                  <circle cx="85%" cy="30%" r="140" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="4,4" />
                  <circle cx="85%" cy="30%" r="80" fill="none" stroke="#ef4444" strokeWidth="0.6" />
                  <circle cx="85%" cy="30%" r="40" fill="none" stroke="#d97706" strokeWidth="1.2" />
                  <path d="M 10 240 Q 150 140 300 240 Q 450 140 590 240" fill="none" stroke="#d97706" strokeWidth="0.8" />
                  <path d="M 0 180 L 630 180" stroke="#d97706" strokeWidth="0.4" strokeDasharray="2,2" />
                </svg>

                {/* Soft glow borders */}
                <div className="absolute inset-2 border border-white/5 rounded-[1.2rem] pointer-events-none" />
                <div className="absolute inset-[10px] border border-amber-500/10 rounded-[1.1rem] pointer-events-none" />

                {/* TOP HEADER */}
                <div className="flex justify-between items-start z-10 w-full">
                  {/* Logo and Inst Title */}
                  <div className="flex items-center gap-2.5 w-full">
                    <div className="w-9 h-9 sm:w-14 sm:h-14 bg-[#10111a] rounded-xl flex items-center justify-center p-1 border border-amber-500/30 shadow-lg shrink-0">
                      <img 
                        src={logoDataUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnwYM9AjexEoF1f1w6hZVGdD3M1KoLWRWFMNqo9SIsu4nyWcR1gJ0LfM&s=10"} 
                        alt="SPI Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-[10px] sm:text-[15px] font-black text-white tracking-[0.05em] leading-tight uppercase font-sans">
                        Satkhira Government Polytechnic Institute
                      </h2>
                      <p className="text-[7px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em] mt-0.5">
                        OFFICIAL FAREWELL CEREMONY 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* MID SECTION - STUDENT PROFILE & GENERAL INFO */}
                <div className="grid grid-cols-12 gap-2 items-center my-auto z-10 w-full">
                  
                  {/* LEFT: Circular Portrait Frame with upload trigger */}
                  <div className="col-span-4 flex flex-col items-center justify-center relative">
                    <div className="relative group/photo cursor-pointer">
                      {/* Double Gold Ring with Red Glow */}
                      <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full p-0.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all duration-300 group-hover/photo:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-950 bg-slate-950 relative flex items-center justify-center">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={student.fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-1 text-center bg-[#090a0f]">
                              <User className="w-6 h-6 text-slate-400" />
                              <span className="text-[5px] font-bold uppercase tracking-widest text-amber-400/80 mt-0.5">Add</span>
                            </div>
                          )}
                          
                          {/* File input */}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            title="Upload portrait photo"
                          />
                        </div>
                      </div>

                      {/* Floating edit camera icon */}
                      <div className="absolute bottom-0 right-0 bg-gradient-to-r from-red-600 to-amber-500 p-1 rounded-full border border-amber-300/30 shadow-lg pointer-events-none">
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest mt-1 block">PORTRAIT</span>
                  </div>

                  {/* RIGHT: Student details + metadata */}
                  <div className="col-span-8 space-y-1.5 pl-2.5 border-l border-white/5">
                    <div>
                      <h1 className="text-[clamp(14px,5vw,23px)] font-black tracking-tight text-white uppercase leading-tight bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">
                        {student.fullName}
                      </h1>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <p className="text-red-400 text-[clamp(9px,3vw,11.5px)] font-black uppercase tracking-wider">
                          {student.department} Technology
                        </p>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-4 gap-1">
                      <div className="space-y-0">
                        <span className="text-[clamp(6px,2vw,8.5px)] text-amber-400/90 font-bold uppercase tracking-widest block">Roll</span>
                        <p className="text-white font-black text-[clamp(10px,3.5vw,13.5px)] tracking-tight">{student.rollNumber}</p>
                      </div>
                      <div className="space-y-0">
                        <span className="text-[clamp(6px,2vw,8.5px)] text-amber-400/90 font-bold uppercase tracking-widest block">Session</span>
                        <p className="text-white font-black text-[clamp(10px,3.5vw,13.5px)] tracking-tight">{sessionVal}</p>
                      </div>
                      <div className="space-y-0">
                        <span className="text-[clamp(6px,2vw,8.5px)] text-amber-400/90 font-bold uppercase tracking-widest block">Sem</span>
                        <p className="text-white font-black text-[clamp(10px,3.5vw,13.5px)] tracking-tight">{semesterVal}</p>
                      </div>
                      <div className="space-y-0">
                        <span className="text-[clamp(6px,2vw,8.5px)] text-amber-400/90 font-bold uppercase tracking-widest block">Shift</span>
                        <p className="text-white font-black text-[clamp(10px,3.5vw,13.5px)] tracking-tight">{shiftVal}</p>
                      </div>
                    </div>

                    {/* Premium Department & Graduation Badge */}
                    <div className="bg-slate-950/60 rounded-xl p-2 border border-white/5 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="text-[5px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                          <p className="text-[7.5px] text-emerald-400 font-black uppercase tracking-wider">OFFICIAL GRADUAND</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-white/5 pl-2">
                        <div>
                          <p className="text-[5px] text-slate-400 font-bold uppercase tracking-wider">Department</p>
                          <p className="text-[7.5px] text-amber-400 font-black uppercase tracking-wider">Civil Division</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* BOTTOM FOOTER */}
                <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5 w-full">
                  {/* Left: Validation message */}
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-green-500 animate-pulse" />
                    <p className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Valid only during Farewell Ceremony
                    </p>
                  </div>

                  {/* Right: QR Code (Clean & centered in right corner) */}
                  <div className="flex items-center gap-4">
                    {/* QR Code */}
                    <div className="p-1 bg-white rounded-lg flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
                      <QRCode 
                        value={typeof window !== 'undefined' ? `${window.location.origin}/?verify=${student.submissionId}` : `https://civil-portal-satkhira.web.app/?verify=${student.submissionId}`} 
                        size={48}
                        level="M"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back-card"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-[98%] sm:w-[95%] max-w-[500px] aspect-[85.6/54] shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[1.5rem] overflow-hidden border border-amber-500/20"
            >
              {/* Back Side Card Container */}
              <div 
                ref={backCardRef}
                className="w-full h-full bg-gradient-to-br from-[#0a0a0f] via-[#12131a] to-[#050508] relative select-none p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
              >
                {/* Red Corner Highlight */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-600/15 to-transparent blur-xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/15 to-transparent blur-xl rounded-full" />

                {/* Blueprint grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-back" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#d97706" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-back)" />
                  <circle cx="15%" cy="70%" r="140" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="4,4" />
                </svg>

                <div className="absolute inset-2 border border-white/5 rounded-[1.2rem] pointer-events-none" />
                <div className="absolute inset-[10px] border border-amber-500/10 rounded-[1.1rem] pointer-events-none" />

                {/* BACK TOP HEADER */}
                <div className="flex items-center gap-3 z-10">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#10111a] rounded-lg flex items-center justify-center p-1 border border-amber-500/30">
                    <img 
                      src={logoDataUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnwYM9AjexEoF1f1w6hZVGdD3M1KoLWRWFMNqo9SIsu4nyWcR1gJ0LfM&s=10"} 
                      alt="SPI Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-[10px] sm:text-[11px] font-black text-white tracking-[0.05em] leading-tight uppercase">
                      Satkhira Government Polytechnic Institute
                    </h2>
                    <p className="text-[7px] text-amber-400 uppercase tracking-widest mt-0.5">
                      SENIOR FAREWELL CEREMONY 2026 • OFFICIAL SCHEDULE
                    </p>
                  </div>
                </div>

                {/* BACK CONTENT GRID: PROGRAM SCHEDULE & IMPORTANT INSTRUCTIONS */}
                <div className="grid grid-cols-2 gap-4 my-auto z-10">
                  
                  {/* Left Column: Schedule Timeline */}
                  <div className="space-y-1.5 border-r border-white/5 pr-3">
                    <h3 className="text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-red-500" /> Program Schedule
                    </h3>
                    <div className="space-y-1 text-[7px] sm:text-[8px] font-bold">
                      <div className="flex justify-between text-slate-300">
                        <span>Registration</span>
                        <span className="text-amber-300 font-black">02:30 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Opening Ceremony</span>
                        <span className="text-amber-300 font-black">03:00 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Cultural Program</span>
                        <span className="text-amber-300 font-black">04:00 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Award & Crest Giving</span>
                        <span className="text-amber-300 font-black">05:45 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-black text-red-500">
                        <span>Grand Dinner</span>
                        <span>07:00 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Instructions */}
                  <div className="space-y-1.5 pl-1">
                    <h3 className="text-[8px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                      <Info className="w-3 h-3 text-red-500" /> Instructions
                    </h3>
                    <ul className="space-y-1 text-[6.5px] sm:text-[7.5px] text-slate-400 font-medium list-disc pl-3">
                      <li>Carry this event pass at all times.</li>
                      <li>QR code verification is mandatory.</li>
                      <li>This pass is strictly non-transferable.</li>
                      <li>Follow all event committee guidelines.</li>
                    </ul>
                  </div>

                </div>

                {/* BACK BOTTOM FOOTER */}
                <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5 w-full">
                  {/* Emergency and seal info */}
                  <div className="space-y-0.5">
                    <p className="text-[6px] text-slate-500 uppercase font-black">EMERGENCY CONTACT</p>
                    <p className="text-[7.5px] text-white font-black flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-red-500" /> +8801832313998
                    </p>
                  </div>

                  {/* Luxury Quote */}
                  <p className="text-[7px] text-amber-300/80 italic font-medium">
                    "Together We Celebrate, Together We Remember."
                  </p>

                  {/* QR Code details */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-[5px] text-slate-500 font-bold uppercase tracking-widest leading-none">SCAN FOR</p>
                      <p className="text-[6.5px] text-white font-black uppercase tracking-wider">VERIFICATION</p>
                    </div>
                    <div className="p-1 bg-white rounded-lg flex items-center justify-center">
                      <QRCode 
                        value={typeof window !== 'undefined' ? `${window.location.origin}/?verify=${student.submissionId}` : `https://civil-portal-satkhira.web.app/?verify=${student.submissionId}`} 
                        size={48}
                        level="M"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Actions Panel */}
      <div className="flex flex-col gap-3 w-full max-w-[420px] items-center mt-2">
        <button 
          onClick={() => downloadCard(activeSide)}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2.5 w-full h-14 px-8 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-600/20 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {isDownloading ? 'Exporting...' : `Download ${activeSide === 'front' ? 'Front' : 'Back'} Side`}
        </button>
        <button 
          onClick={async () => {
            await downloadCard('front');
            await new Promise(r => setTimeout(r, 600));
            await downloadCard('back');
          }}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2.5 w-full h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          Download Both Sides
        </button>
      </div>

      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 w-full max-w-[420px] text-center mt-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="block font-bold text-white">আপনার রোল নম্বর ব্যবহার করে কার্ডটি ডাউনলোড করুন।</span>
        </p>
      </div>

    </div>
  );
});

export default StudentCard;
