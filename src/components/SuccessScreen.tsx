import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, Download, Share2, Heart, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Contribution } from '../types';
import { format } from 'date-fns';

interface SuccessScreenProps {
  onReset: () => void;
  lang: 'bn' | 'en';
  submission?: Contribution;
}

export default function SuccessScreen({ onReset, lang, submission }: SuccessScreenProps) {
  const content = {
    bn: {
      title: "ধন্যবাদ!",
      subtitle: "আপনার তথ্য সফলভাবে জমা দেওয়া হয়েছে।",
      cardText: "আপনার অংশগ্রহণ আমাদের বিদায় সংবর্ধনা প্রোগ্রামটিকে আরও সফল করে তুলবে। পরবর্তী আপডেটের জন্য আমাদের সাথে থাকুন।",
      receipt: "রশিদ ডাউনলোড করুন",
      home: "হোম পেজ",
      wish: "আপনার সুন্দর ভবিষ্যতের মঙ্গল কামনা করি!"
    },
    en: {
      title: "Thank You!",
      subtitle: "Your information has been successfully submitted.",
      cardText: "Your participation will make our farewell ceremony more memorable. Stay tuned for future updates.",
      receipt: "Download Receipt",
      home: "Go to Home",
      wish: "Wishing you a bright and successful future!"
    }
  }[lang];

  const downloadReceipt = () => {
    if (!submission) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Senior Farewell 2026', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Satkhira Government Polytechnic Institute', 105, 28, { align: 'center' });
    
    // Receipt Info
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(16);
    doc.text('OFFICIAL CONTRIBUTION RECEIPT', 105, 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${submission.submissionId}`, 20, 70);
    doc.text(`Date: ${format(new Date(submission.createdAt), 'PPpp')}`, 20, 76);
    
    // Table Data
    const tableData = [
      ['Student Name', submission.fullName],
      ['Roll Number', submission.rollNumber],
      ['Registration No', submission.registrationNumber || 'N/A'],
      ['Department', submission.department],
      ['Semester & Shift', `${submission.semester} - ${submission.shift} Shift`],
      ['Academic Session', submission.academicSession],
      ['Mobile Number', submission.mobileNumber],
      ['Payment Method', submission.paymentMethod],
      ['Transaction ID', submission.transactionId || 'N/A'],
      ['Amount Paid', '150 BDT'],
      ['Status', 'Verified (Pending Committee Review)']
    ];

    autoTable(doc, {
      startY: 85,
      head: [['Field', 'Description']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a digitally generated receipt and does not require a physical signature.', 105, finalY, { align: 'center' });
    doc.text('Please keep this for your records until the event.', 105, finalY + 6, { align: 'center' });
    
    // Footer
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 287, 210, 10, 'F');
    
    doc.save(`SPI_Farewell_Receipt_${submission.rollNumber}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-12 py-8">
      <div className="relative inline-block">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-4 -right-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl z-20"
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-36 h-36 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[2.5rem] flex items-center justify-center mx-auto border-4 border-white/20 shadow-2xl relative z-10"
        >
          <CheckCircle2 className="w-20 h-20 text-white" />
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-display font-extrabold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent tracking-tight"
        >
          {content.title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-400 max-w-lg mx-auto"
        >
          {content.subtitle}
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-[2.5rem] p-10 border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-6">
          <p className="text-slate-300 text-lg leading-relaxed">
            {content.cardText}
          </p>
          
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={downloadReceipt}
              className="relative group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Download className="w-4 h-4" />
                {content.receipt}
              </div>
            </button>
            <button 
              className="flex items-center justify-center gap-2 px-8 py-4 glass-card rounded-2xl hover:bg-white/10 transition-all text-sm font-bold"
            >
              <Share2 className="w-4 h-4" />
              Share with Classmates
            </button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        <div className="flex items-center justify-center gap-3 text-pink-500/80 font-display font-bold italic">
          <Heart className="w-5 h-5 fill-current" />
          {content.wish}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="relative group px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-white/10 mx-auto"
        >
          <Home className="w-6 h-6" /> {content.home}
        </motion.button>
      </div>
    </div>
  );
}
