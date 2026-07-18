import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { Download, User, Hash, GraduationCap, Calendar, Phone, ShieldCheck, Share2 } from 'lucide-react';
import { Contribution, FarewellStudent } from '../types';

interface StudentCardProps {
  student: Contribution | FarewellStudent;
  type: 'general' | 'farewell';
}

const StudentCard: React.FC<StudentCardProps> = ({ student, type }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Civil-Portal-Card-${student.rollNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download card:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto py-10">
      <div 
        ref={cardRef}
        className="relative w-full max-w-[600px] h-auto aspect-[5/3] bg-[#0c0c0c] rounded-3xl overflow-hidden shadow-2xl border border-white/5 font-sans p-6 sm:p-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-600 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-600 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-600 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-600 rounded-br-lg" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight uppercase tracking-tight">
              Civil <span className="text-red-600">Portal</span>
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
              Satkhira Govt. Polytechnic
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Main Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 uppercase tracking-tight truncate">
                  {student.fullName}
                </h2>
                <p className="text-red-600 text-sm font-bold tracking-widest uppercase">
                  {student.department} Technology
                </p>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-red-600" /> Roll
                  </span>
                  <p className="text-white font-black text-lg tracking-tight">
                    {student.rollNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-red-600" /> Session
                  </span>
                  <p className="text-white font-black text-lg tracking-tight">
                    {student.academicSession}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex items-center justify-end gap-3">
              <div className="p-2 bg-white rounded-xl shadow-2xl">
                <QRCode 
                  value={`https://civil-portal.edu/verify/${student.submissionId}`} 
                  size={80}
                  level="H"
                />
              </div>
            </div>
        </div>
        
        {/* Verification Badge */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
            {type === 'farewell' ? 'Verified Farewell' : 'Verified Student'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full">
        <button 
          onClick={downloadCard}
          className="flex items-center gap-2.5 px-8 py-4 bg-red-600 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-600/20 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          Download Digital Card
        </button>
        <button 
          className="flex items-center gap-2.5 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          Share ID
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
