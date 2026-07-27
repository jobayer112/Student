import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, CreditCard, PieChart, 
  Search, Filter, Edit, Trash2, Download, Printer, 
  LogOut, Lock, Loader2, ChevronDown, Check, X,
  FileSpreadsheet, Clock, TrendingUp, DollarSign,
  AlertCircle, FileText, Building, Smartphone,
  Shield, ArrowRight, Settings, Plus
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { Contribution, AdminStats, Language, FarewellStudent } from '../types';
import { cn } from '../lib/utils';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { QrCode, Copy } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<Contribution[]>([]);
  const [farewellData, setFarewellData] = useState<FarewellStudent[]>([]);
  const [activeTab, setActiveTab] = useState<'contributions' | 'farewell' | 'settings'>('contributions');
  const [bkashNumber, setBkashNumber] = useState<string>('01894-548232');
  const [savingBkash, setSavingBkash] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contribution | null>(null);
  const [editingFarewell, setEditingFarewell] = useState<FarewellStudent | null>(null);
  const [modalData, setModalData] = useState<Partial<Contribution>>({});
  const [farewellModalData, setFarewellModalData] = useState<Partial<FarewellStudent>>({});
  const [chartView, setChartView] = useState<'velocity' | 'departments'>('velocity');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        result = await res.json();
      } catch (fetchErr) {
        console.warn('API login failed, falling back to client-side validation:', fetchErr);
        // Fallback validation for client-only/Vercel serverless offline situations
        if (password === '1@2#3$4_5&') {
          result = { success: true, token: 'fake-admin-token-' + Date.now() };
        } else {
          result = { success: false };
        }
      }

      if (result && result.success) {
        setToken(result.token);
        setIsAuthenticated(true);
        fetchData(result.token);
      } else {
        setError('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
        toast.error('ভুল পাসওয়ার্ড');
      }
    } catch (err) {
      setError('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (authToken?: string) => {
    setLoading(true);
    try {
      // Fetch Contributions
      const qContrib = query(collection(db, 'contributions'), orderBy('createdAt', 'desc'));
      const snapshotContrib = await getDocs(qContrib);
      const contribList: Contribution[] = [];
      snapshotContrib.forEach((doc) => {
        contribList.push({ id: doc.id, ...doc.data() } as Contribution);
      });
      setData(contribList);

      // Fetch Farewell Students
      const qFarewell = query(collection(db, 'farewell_students'), orderBy('createdAt', 'desc'));
      const snapshotFarewell = await getDocs(qFarewell);
      const farewellList: FarewellStudent[] = [];
      snapshotFarewell.forEach((doc) => {
        farewellList.push({ id: doc.id, ...doc.data() } as FarewellStudent);
      });
      setFarewellData(farewellList);

      // Fetch Payment Settings
      try {
        const docRef = doc(db, 'settings', 'payment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data()?.bkashNumber) {
          setBkashNumber(docSnap.data().bkashNumber);
        }
      } catch (settingErr) {
        console.warn('Could not load payment settings:', settingErr);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error('ডাটা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBkash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkashNumber.trim()) {
      toast.error('বিকাশ নম্বরটি ফাঁকা রাখা যাবে না!');
      return;
    }
    setSavingBkash(true);
    try {
      const docRef = doc(db, 'settings', 'payment');
      await setDoc(docRef, {
        bkashNumber: bkashNumber.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('বিকাশ নম্বর সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      console.error('Error saving bKash number:', err);
      toast.error('বিকাশ নম্বর সেভ করা সম্ভব হয়নি।');
    } finally {
      setSavingBkash(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      const collectionName = activeTab === 'contributions' ? 'contributions' : 'farewell_students';
      await deleteDoc(doc(db, collectionName, id));
      if (activeTab === 'contributions') {
        setData(prev => prev.filter(item => item.id !== id));
      } else {
        setFarewellData(prev => prev.filter(item => item.id !== id));
      }
      toast.success('তথ্যটি মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Verified' ? 'Pending' : 'Verified';
    try {
      await updateDoc(doc(db, 'contributions', id), {
        paymentStatus: newStatus,
        updatedAt: new Date().toISOString()
      });
      setData(prev => prev.map(item => item.id === id ? { ...item, paymentStatus: newStatus as any } : item));
      toast.success(`স্ট্যাটাস ${newStatus === 'Verified' ? 'Verified' : 'Pending'} করা হয়েছে`);
    } catch (err) {
      toast.error('আপডেট করা সম্ভব হয়নি।');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'contributions') {
        if (editingItem) {
          await updateDoc(doc(db, 'contributions', editingItem.id!), {
            ...modalData,
            updatedAt: new Date().toISOString()
          });
          toast.success('তথ্য আপডেট করা হয়েছে');
        } else {
          await addDoc(collection(db, 'contributions'), {
            ...modalData,
            createdAt: new Date().toISOString()
          });
          toast.success('নতুন তথ্য যুক্ত করা হয়েছে');
        }
      } else {
        if (editingFarewell) {
          await updateDoc(doc(db, 'farewell_students', editingFarewell.id!), {
            ...farewellModalData,
            updatedAt: new Date().toISOString()
          });
          toast.success('বিদায়ী শিক্ষার্থীর তথ্য আপডেট করা হয়েছে');
        } else {
          await addDoc(collection(db, 'farewell_students'), {
            ...farewellModalData,
            createdAt: new Date().toISOString()
          });
          toast.success('নতুন বিদায়ী শিক্ষার্থীর তথ্য যুক্ত করা হয়েছে');
        }
      }
      fetchData(token!);
      setIsModalOpen(false);
      setEditingItem(null);
      setEditingFarewell(null);
      setModalData({});
      setFarewellModalData({});
    } catch (err) {
      toast.error('সেভ করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: Contribution | FarewellStudent) => {
    if (activeTab === 'contributions') {
      setEditingItem(item as Contribution);
      setModalData(item as Contribution);
    } else {
      setEditingFarewell(item as FarewellStudent);
      setFarewellModalData(item as FarewellStudent);
    }
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setEditingFarewell(null);
    if (activeTab === 'contributions') {
      setModalData({
        fullName: '',
        rollNumber: '',
        department: 'Civil',
        semester: '8th',
        shift: '1st',
        mobileNumber: '',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        academicSession: '2022-23'
      });
    } else {
      setFarewellModalData({
        fullName: '',
        rollNumber: '',
        department: 'Civil',
        semester: '8th',
        shift: '1st',
        academicSession: '2022-23',
        mobileNumber: '',
        willAttend: 'Yes'
      });
    }
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    let exportData;
    let fileName;
    
    if (activeTab === 'contributions') {
      exportData = data.map(item => ({
        'Student Name': item.fullName,
        'Roll Number': item.rollNumber,
        'Department': item.department,
        'Semester': item.semester,
        'Shift': item.shift,
        'Mobile': item.mobileNumber,
        'Payment Method': item.paymentMethod,
        'Status': item.paymentStatus,
        'Transaction ID': item.transactionId || 'N/A',
        'Date': format(new Date(item.createdAt), 'PPpp')
      }));
      fileName = `SPI_Contributions_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    } else {
      exportData = farewellData.map(item => ({
        'Student Name': item.fullName,
        'Roll Number': item.rollNumber,
        'Reg Number': item.registrationNumber || 'N/A',
        'Department': item.department,
        'Semester': item.semester,
        'Shift': item.shift,
        'Mobile': item.mobileNumber,
        'Will Attend': item.willAttend,
        'Remarks': item.remarks || 'N/A',
        'Date': format(new Date(item.createdAt), 'PPpp')
      }));
      fileName = `SPI_Farewell_Students_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'contributions' ? "Contributions" : "Farewell Students");
    XLSX.writeFile(wb, fileName);
    toast.success('Excel ফাইল তৈরি হয়েছে');
  };

  const generateReport = () => {
    const doc = new jsPDF();
    if (activeTab === 'contributions') {
      doc.text('Contribution Report - Senior Farewell 2026', 14, 15);
      const tableData = data.map(item => [
        item.fullName,
        item.rollNumber,
        item.department,
        item.paymentStatus,
        item.paymentMethod
      ]);
      autoTable(doc, {
        head: [['Name', 'Roll', 'Dept', 'Status', 'Method']],
        body: tableData,
        startY: 20,
      });
      doc.save('Contribution_Report.pdf');
    } else {
      doc.text('Farewell Students List - Senior Farewell 2026', 14, 15);
      const tableData = farewellData.map(item => [
        item.fullName,
        item.rollNumber,
        item.department,
        item.willAttend,
        item.mobileNumber
      ]);
      autoTable(doc, {
        head: [['Name', 'Roll', 'Dept', 'Attending', 'Mobile']],
        body: tableData,
        startY: 20,
      });
      doc.save('Farewell_Students_List.pdf');
    }
    toast.success('PDF রিপোর্ট তৈরি হয়েছে');
  };

  const trendData = React.useMemo(() => {
    const dailyMap: Record<string, { contributions: number; amount: number }> = {};
    
    // Sort contributions chronologically
    const sorted = [...data]
      .filter(item => item.createdAt)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    let cumContributions = 0;
    let cumAmount = 0;
    
    sorted.forEach(item => {
      let dateKey;
      try {
        dateKey = format(new Date(item.createdAt), 'dd MMM');
      } catch (e) {
        dateKey = 'Unknown';
      }
      
      const isPaid = item.paymentStatus === 'Verified';
      
      cumContributions += 1;
      if (isPaid) {
        cumAmount += 150;
      }
      
      dailyMap[dateKey] = {
        contributions: cumContributions,
        amount: cumAmount
      };
    });
    
    return Object.entries(dailyMap).map(([date, val]) => ({
      date,
      contributions: val.contributions,
      amount: val.amount
    })).slice(-12);
  }, [data]);

  const stats = {
    total: data.length,
    paid: data.filter(d => d.paymentStatus === 'Verified').length,
    pending: data.filter(d => d.paymentStatus === 'Pending').length,
    amount: data.filter(d => d.paymentStatus === 'Verified').length * 150,
    deptStats: Object.entries(data.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
    farewell: {
      total: farewellData.length,
      attending: farewellData.filter(d => d.willAttend === 'Yes').length,
      notAttending: farewellData.filter(d => d.willAttend === 'No').length,
      deptStats: Object.entries(farewellData.reduce((acc, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.rollNumber.includes(searchTerm) ||
                          (item.registrationNumber && item.registrationNumber.includes(searchTerm));
    const matchesDept = filterDept ? item.department === filterDept : true;
    const matchesStatus = filterStatus ? item.paymentStatus === filterStatus : true;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredFarewellData = farewellData.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.rollNumber.includes(searchTerm) ||
                          (item.registrationNumber && item.registrationNumber.includes(searchTerm));
    const matchesDept = filterDept ? item.department === filterDept : true;
    const matchesAttend = filterStatus ? item.willAttend === filterStatus : true;
    return matchesSearch && matchesDept && matchesAttend;
  });

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308'];

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 rounded-[3rem] w-full max-w-md border-white/10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-display font-black text-center text-white mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-slate-400 text-center text-sm font-medium mb-10 tracking-wide">Enter your security credentials</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">Access Key</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  className="glass-input w-full pl-12 py-4"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  Authenticate
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 md:py-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-900/40 p-8 md:p-10 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live • Managing {data.length + farewellData.length} total records
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('contributions')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'contributions' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
              )}
            >
              Contributions
            </button>
            <button 
              onClick={() => setActiveTab('farewell')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'farewell' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30" : "text-slate-500 hover:text-white"
              )}
            >
              Graduates
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                activeTab === 'settings' ? "bg-pink-600 text-white shadow-xl shadow-pink-600/30" : "text-slate-500 hover:text-white"
              )}
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-300" />
              <span>bKash Settings</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={openAddModal} 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 active:scale-95 shadow-xl"
            >
              <Plus className="w-4 h-4" /> Add Record
            </button>
            <button 
              onClick={() => { setIsAuthenticated(false); setToken(null); }}
              className="p-3 glass-card rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all border border-white/5"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="max-w-4xl mx-auto space-y-8 py-4">
          {/* bKash Configuration Card */}
          <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/10 blur-[120px] -mr-40 -mt-40 rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 shadow-lg">
                <Smartphone className="w-7 h-7 text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-white">বিকাশ নম্বর ব্যবস্থাপনা (bKash Settings)</h2>
                <p className="text-slate-400 text-sm">কন্ট্রিবিউশন ফর্মের পেমেন্ট পেজে প্রদর্শিত বিকাশ পার্সোনাল নম্বর পরিবর্তন বা আপডেট করুন</p>
              </div>
            </div>

            <form onSubmit={handleSaveBkash} className="space-y-6 relative">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>বিকাশ পার্সোনাল নম্বর (bKash Personal Number)</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
                  <input 
                    type="text" 
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01894-548232"
                    className="glass-input w-full pl-12 pr-4 py-4 text-lg md:text-xl font-bold text-white tracking-widest font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  💡 <strong>টিপস:</strong> শিক্ষার্থীরা যখন কন্ট্রিবিউশন ফর্ম পূরণ করার সময় 'bKash' নির্বাচন করবে, তখন আপনার দেওয়া এই নম্বরটি পেমেন্ট কার্ডে দেখতে পাবে এবং এক ক্লিকেই কপি করতে পারবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={savingBkash}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-pink-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingBkash ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  <span>{savingBkash ? 'সংরক্ষণ করা হচ্ছে...' : 'বিকাশ নম্বর পরিবর্তন করুন'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <span>কন্ট্রিবিউশন ফর্মে যেমন দেখাবে (Live Preview)</span>
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">Live Preview</span>
            </div>
            
            <div className="max-w-md mx-auto glass-card rounded-3xl p-6 border-indigo-500/20 bg-indigo-500/5 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400 mb-2">
                <QrCode className="w-6 h-6" />
                <span className="font-bold text-sm tracking-widest uppercase">Scan to Pay</span>
              </div>
              <div className="flex justify-center relative">
                <div className="w-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-xl">
                  <Smartphone className="w-10 h-10 text-white mb-3" />
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-black text-xl leading-tight">{bkashNumber || '01894-548232'}</p>
                    <span className="p-1.5 rounded-lg bg-white/20 text-white text-xs">
                      <Copy className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Personal Account</p>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-500 font-bold">{bkashNumber || '01894-548232'} (Personal)</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'contributions' ? (
          <>
            <StatCard icon={Users} label="Total Entries" value={stats.total} trend="+12% this week" color="indigo" />
            <StatCard icon={DollarSign} label="Total Collection" value={`${stats.amount} BDT`} trend="Verified" color="emerald" />
            <StatCard icon={Clock} label="Pending Reviews" value={stats.pending} trend="Action Required" color="amber" />
            <StatCard icon={TrendingUp} label="Completion" value={`${Math.round((stats.paid/stats.total || 0) * 100)}%`} trend="Target 100%" color="purple" />
          </>
        ) : (
          <>
            <StatCard icon={Users} label="Total Graduates" value={stats.farewell.total} trend="Registered" color="indigo" />
            <StatCard icon={Check} label="Attending" value={stats.farewell.attending} trend="Confirmed" color="emerald" />
            <StatCard icon={X} label="Not Attending" value={stats.farewell.notAttending} trend="Declined" color="rose" />
            <StatCard icon={TrendingUp} label="Response Rate" value={`${Math.round((stats.farewell.total/data.length || 0) * 100)}%`} trend="Batch Target" color="purple" />
          </>
        )}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                {chartView === 'velocity' ? 'Collection & Registration Velocity' : 'Department Distribution'}
              </h3>
              <p className="text-slate-500 text-xs font-medium">
                {chartView === 'velocity' ? 'Cumulative registration growth and collection values' : 'Student representation across different departments'}
              </p>
            </div>
            
            <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5 self-start sm:self-auto shrink-0">
              <button 
                onClick={() => setChartView('velocity')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  chartView === 'velocity' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                )}
              >
                Velocity
              </button>
              <button 
                onClick={() => setChartView('departments')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  chartView === 'departments' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-slate-500 hover:text-white"
                )}
              >
                Departments
              </button>
            </div>
          </div>

          <div className="h-[260px] w-full relative">
            {chartView === 'velocity' ? (
              trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGrads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} tick={{dy: 10}} />
                    
                    {activeTab === 'contributions' ? (
                      <>
                        <YAxis yAxisId="left" stroke="#6366f1" fontSize={9} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="contributions" name="Contributions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorContrib)" />
                        <Area yAxisId="right" type="monotone" dataKey="amount" name="Collection (BDT)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                      </>
                    ) : (
                      <>
                        <YAxis stroke="#f59e0b" fontSize={9} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="graduates" name="Graduates Registered" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGrads)" />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  No active registration trend data
                </div>
              )
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeTab === 'contributions' ? stats.deptStats : stats.farewell.deptStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={9} axisLine={false} tickLine={false} tick={{dy: 10}} />
                  <YAxis stroke="#475569" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}
                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {(activeTab === 'contributions' ? stats.deptStats : stats.farewell.deptStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border border-white/5 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/5 blur-[80px] -ml-24 -mb-24 rounded-full" />
          <div className="text-center w-full">
            <h3 className="text-lg font-bold text-white mb-1 relative">Status Mix</h3>
            <p className="text-slate-500 text-xs font-medium mb-6 text-center relative">Percentage breakdown of {activeTab === 'contributions' ? 'payments' : 'attendance'}</p>
          </div>
          
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={activeTab === 'contributions' ? [
                    { name: 'Verified', value: stats.paid },
                    { name: 'Pending', value: stats.pending }
                  ] : [
                    { name: 'Attending', value: stats.farewell.attending },
                    { name: 'Not Attending', value: stats.farewell.notAttending }
                  ]}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill={activeTab === 'contributions' ? "#f59e0b" : "#f43f5e"} />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 w-full mt-6 relative">
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{activeTab === 'contributions' ? 'Paid' : 'Yes'}</div>
              <div className="text-xl font-bold text-white">{activeTab === 'contributions' ? stats.paid : stats.farewell.attending}</div>
            </div>
            <div className={cn("p-3 border rounded-xl text-center", activeTab === 'contributions' ? "bg-amber-500/5 border-amber-500/10" : "bg-rose-500/5 border-rose-500/10")}>
              <div className={cn("text-[10px] font-black uppercase tracking-widest mb-1", activeTab === 'contributions' ? "text-amber-400" : "text-rose-400")}>{activeTab === 'contributions' ? 'Pending' : 'No'}</div>
              <div className="text-xl font-bold text-white">{activeTab === 'contributions' ? stats.pending : stats.farewell.notAttending}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, roll or ID..."
              className="glass-input w-full pl-12 py-3 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              className="glass-input py-3 px-4 text-xs font-bold uppercase tracking-widest flex-1 md:flex-none"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Civil">Civil</option>
              <option value="Computer">Computer</option>
              <option value="Electronics">Electronics</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Environmental">Environmental</option>
            </select>

            <select 
              className="glass-input py-3 px-4 text-xs font-bold uppercase tracking-widest flex-1 md:flex-none"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              {activeTab === 'contributions' ? (
                <>
                  <option value="">All Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                </>
              ) : (
                <>
                  <option value="">All Attendance</option>
                  <option value="Yes">Attending</option>
                  <option value="No">Not Attending</option>
                </>
              )}
            </select>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={exportToExcel}
                className="flex-1 sm:flex-none p-3 glass-card rounded-xl hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-slate-500 border border-white/5"
                title="Export Excel"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={generateReport}
                className="flex-1 sm:flex-none p-3 glass-card rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-slate-500 border border-white/5"
                title="Print PDF"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table / Cards */}
        <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-[0.25em] font-black">
                  <th className="px-8 py-6">Basic Info</th>
                  <th className="px-8 py-6">Academic Path</th>
                  <th className="px-8 py-6">{activeTab === 'contributions' ? 'Transaction Details' : 'Attendance/Remarks'}</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeTab === 'contributions' ? filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="text-white font-bold text-base mb-1 group-hover:text-indigo-400 transition-colors">{item.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <Smartphone className="w-3 h-3" /> {item.mobileNumber}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-300 text-sm font-semibold mb-1">Roll: {item.rollNumber}</div>
                      <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{item.department} • {item.shift}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-white text-sm font-mono font-bold mb-1">{item.transactionId || '---'}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.paymentMethod}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        item.paymentStatus === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-3 bg-white/5 rounded-xl hover:bg-indigo-500 text-slate-400 hover:text-white transition-all shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id!)}
                          className="p-3 bg-white/5 rounded-xl hover:bg-rose-500 text-slate-400 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : filteredFarewellData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="text-white font-bold text-base mb-1 group-hover:text-indigo-400 transition-colors">{item.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <Smartphone className="w-3 h-3" /> {item.mobileNumber}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-300 text-sm font-semibold mb-1">Roll: {item.rollNumber}</div>
                      <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{item.department} • {item.shift}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-white text-sm font-medium line-clamp-1 max-w-xs">{item.remarks || 'No message'}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {item.submissionId}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        item.willAttend === 'Yes' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      )}>
                        {item.willAttend === 'Yes' ? 'Attending' : 'Not Attending'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-3 bg-white/5 rounded-xl hover:bg-indigo-500 text-slate-400 hover:text-white transition-all shadow-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id!)}
                          className="p-3 bg-white/5 rounded-xl hover:bg-rose-500 text-slate-400 hover:text-white transition-all shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="xl:hidden p-4 space-y-4">
            {(activeTab === 'contributions' ? filteredData : filteredFarewellData).map((item: any) => (
              <div key={item.id} className="glass-card p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">{item.fullName}</h4>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{item.department} • {item.rollNumber}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0",
                    activeTab === 'contributions' 
                      ? (item.paymentStatus === 'Verified' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")
                      : (item.willAttend === 'Yes' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")
                  )}>
                    {activeTab === 'contributions' ? item.paymentStatus : (item.willAttend === 'Yes' ? 'Attending' : 'No')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Shift</p>
                    <p className="text-slate-300 text-xs">{item.shift}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile</p>
                    <p className="text-slate-300 text-xs">{item.mobileNumber}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => openEditModal(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id!)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {(activeTab === 'contributions' ? filteredData.length : filteredFarewellData.length) === 0 && (
            <div className="py-24 text-center px-6">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                We couldn't find any matching records. Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
      </>
      )}
      
      <div className="text-center pt-10">
         <button onClick={onClose} className="text-slate-600 hover:text-indigo-400 transition-colors text-[10px] uppercase tracking-[0.3em] font-black">
           End Management Session
         </button>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-display font-bold text-white">
                  {editingItem ? 'Edit Entry' : 'Add New Entry'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'contributions' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="glass-input w-full"
                          value={modalData.fullName || ''}
                          onChange={e => setModalData({...modalData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Roll Number</label>
                        <input 
                          type="text" 
                          required
                          className="glass-input w-full"
                          value={modalData.rollNumber || ''}
                          onChange={e => setModalData({...modalData, rollNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registration Number</label>
                        <input 
                          type="text" 
                          className="glass-input w-full"
                          value={modalData.registrationNumber || ''}
                          onChange={e => setModalData({...modalData, registrationNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
                        <input 
                          type="email" 
                          className="glass-input w-full"
                          value={modalData.email || ''}
                          onChange={e => setModalData({...modalData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Department</label>
                        <select 
                          className="glass-input w-full"
                          value={modalData.department || 'Civil'}
                          onChange={e => setModalData({...modalData, department: e.target.value as any})}
                        >
                          <option value="Civil">Civil</option>
                          <option value="Computer">Computer</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Refrigeration & Air Conditioning">RAC</option>
                          <option value="Environmental">Environmental</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Semester</label>
                        <select 
                          className="glass-input w-full"
                          value={modalData.semester || '8th'}
                          onChange={e => setModalData({...modalData, semester: e.target.value as any})}
                        >
                          {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Shift</label>
                        <select 
                          className="glass-input w-full"
                          value={modalData.shift || '1st'}
                          onChange={e => setModalData({...modalData, shift: e.target.value as any})}
                        >
                          <option value="1st">1st Shift</option>
                          <option value="2nd">2nd Shift</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Mobile Number</label>
                        <input 
                          type="text" 
                          required
                          className="glass-input w-full"
                          value={modalData.mobileNumber || ''}
                          onChange={e => setModalData({...modalData, mobileNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Payment Method</label>
                        <select 
                          className="glass-input w-full"
                          value={modalData.paymentMethod || 'Cash'}
                          onChange={e => setModalData({...modalData, paymentMethod: e.target.value as any})}
                        >
                          <option value="Cash">Cash</option>
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Rocket">Rocket</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Status</label>
                        <select 
                          className="glass-input w-full"
                          value={modalData.paymentStatus || 'Pending'}
                          onChange={e => setModalData({...modalData, paymentStatus: e.target.value as any})}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Transaction ID / Reference</label>
                        <input 
                          type="text" 
                          className="glass-input w-full font-mono uppercase"
                          value={modalData.transactionId || ''}
                          onChange={e => setModalData({...modalData, transactionId: e.target.value})}
                          placeholder="e.g. AXB123CD45"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="glass-input w-full"
                          value={farewellModalData.fullName || ''}
                          onChange={e => setFarewellModalData({...farewellModalData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Roll Number</label>
                        <input 
                          type="text" 
                          required
                          className="glass-input w-full"
                          value={farewellModalData.rollNumber || ''}
                          onChange={e => setFarewellModalData({...farewellModalData, rollNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Registration Number</label>
                        <input 
                          type="text" 
                          className="glass-input w-full"
                          value={farewellModalData.registrationNumber || ''}
                          onChange={e => setFarewellModalData({...farewellModalData, registrationNumber: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Department</label>
                        <select 
                          className="glass-input w-full"
                          value={farewellModalData.department || 'Civil'}
                          onChange={e => setFarewellModalData({...farewellModalData, department: e.target.value as any})}
                        >
                          <option value="Civil">Civil</option>
                          <option value="Computer">Computer</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Mechanical">Mechanical</option>
                          <option value="Refrigeration & Air Conditioning">RAC</option>
                          <option value="Environmental">Environmental</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Semester</label>
                        <select 
                          className="glass-input w-full"
                          value={farewellModalData.semester || '8th'}
                          onChange={e => setFarewellModalData({...farewellModalData, semester: e.target.value as any})}
                        >
                          <option value="8th">8th</option>
                          <option value="7th">7th</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Will Attend?</label>
                        <select 
                          className="glass-input w-full"
                          value={farewellModalData.willAttend || 'Yes'}
                          onChange={e => setFarewellModalData({...farewellModalData, willAttend: e.target.value as any})}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Remarks</label>
                        <textarea 
                          className="glass-input w-full h-24 resize-none"
                          value={farewellModalData.remarks || ''}
                          onChange={e => setFarewellModalData({...farewellModalData, remarks: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 glass-card rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (activeTab === 'contributions' ? (editingItem ? 'Update Record' : 'Create Record') : (editingFarewell ? 'Update Record' : 'Create Record'))}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  const colors: any = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-600/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-600/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    rose: 'from-rose-600/20 to-rose-600/5 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={cn(
      "p-5 rounded-2xl md:rounded-[1.75rem] border bg-gradient-to-br backdrop-blur-xl group hover:scale-[1.02] transition-all",
      colors[color]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 pt-1">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] mb-0.5 font-black opacity-60">{label}</p>
        <p className="text-2xl md:text-3xl font-display font-black tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}
