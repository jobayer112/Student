import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, CreditCard, PieChart, 
  Search, Filter, Edit, Trash2, Download, Printer, 
  LogOut, Lock, Loader2, ChevronDown, Check, X,
  FileSpreadsheet, Clock, TrendingUp, DollarSign,
  AlertCircle, FileText, Building, Smartphone
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { Contribution, AdminStats, Language } from '../types';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Contribution | null>(null);
  const [modalData, setModalData] = useState<Partial<Contribution>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (result.success) {
        setToken(result.token);
        setIsAuthenticated(true);
        fetchData(result.token);
        toast.success('অ্যাডমিন প্যানেলে স্বাগতম');
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

  const fetchData = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/contributions', {
        headers: { 'Authorization': authToken },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        toast.error(`সার্ভার ত্রুটি: ${res.status}`);
        return;
      }

      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        console.error('Error fetching data:', result);
        setData([]);
        toast.error(`ডাটা লোড করতে ব্যর্থ হয়েছে: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast.error('সার্ভার সংযোগে সমস্যা হয়েছে।');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await fetch(`/api/admin/contributions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token! },
      });
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('তথ্যটি মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Verified' ? 'Pending' : 'Verified';
    try {
      await fetch(`/api/admin/contributions/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': token!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
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
      const url = editingItem 
        ? `/api/admin/contributions/${editingItem.id}` 
        : '/api/admin/contributions';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': token!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modalData),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(editingItem ? 'তথ্য আপডেট করা হয়েছে' : 'নতুন তথ্য যুক্ত করা হয়েছে');
        fetchData(token!);
        setIsModalOpen(false);
        setEditingItem(null);
        setModalData({});
      } else {
        toast.error(result.message || 'সেভ করা সম্ভব হয়নি।');
      }
    } catch (err) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: Contribution) => {
    setEditingItem(item);
    setModalData(item);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setModalData({
      fullName: '',
      rollNumber: '',
      department: 'Computer',
      semester: '8th',
      shift: '1st',
      mobileNumber: '',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      academicSession: '2022-23'
    });
    setIsModalOpen(true);
  };

  const exportToExcel = () => {
    const exportData = data.map(item => ({
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
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contributions");
    XLSX.writeFile(wb, `SPI_Contributions_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    toast.success('Excel ফাইল তৈরি হয়েছে');
  };

  const generateReport = () => {
    const doc = new jsPDF();
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
    toast.success('PDF রিপোর্ট তৈরি হয়েছে');
  };

  const stats = {
    total: data.length,
    paid: data.filter(d => d.paymentStatus === 'Verified').length,
    pending: data.filter(d => d.paymentStatus === 'Pending').length,
    amount: data.filter(d => d.paymentStatus === 'Verified').length * 150,
    deptStats: Object.entries(data.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.rollNumber.includes(searchTerm) ||
                          (item.registrationNumber && item.registrationNumber.includes(searchTerm));
    const matchesDept = filterDept ? item.department === filterDept : true;
    const matchesStatus = filterStatus ? item.paymentStatus === filterStatus : true;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308'];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 rounded-[2.5rem] w-full max-w-md glow-indigo text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
              <div className="w-20 h-20 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl flex items-center justify-center mx-auto border border-white/20 p-0.5 relative z-10">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtnwYM9AjexEoF1f1w6hZVGdD3M1KoLWRWFMNqo9SIsu4nyWcR1gJ0LfM&s=10" alt="AI" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Admin Access</h2>
              <p className="text-slate-400 mt-2 text-sm">Secure Portal Managed by AI Assistant</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input w-full text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
            {error && <p className="text-sm text-red-400 font-bold uppercase tracking-wider">{error}</p>}

            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 glass-card rounded-2xl font-bold text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] btn-primary py-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authorize Access'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-indigo-400 mb-2 font-bold uppercase tracking-[0.2em] text-xs">
            <TrendingUp className="w-4 h-4" />
            Real-time Analytics
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white tracking-tight">Admin Dashboard</h1>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20">
            <Users className="w-4 h-4" /> Add Entry
          </button>
          <button onClick={generateReport} className="flex items-center gap-2 px-6 py-3 glass-card rounded-2xl hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest text-slate-300">
            <FileText className="w-4 h-4" /> PDF Report
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => { setIsAuthenticated(false); setToken(null); }} className="p-3 glass-card rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all border-white/5 text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Entries" value={stats.total} trend="+12% this week" color="indigo" />
        <StatCard icon={DollarSign} label="Total Collection" value={`${stats.amount} BDT`} trend="Verified" color="emerald" />
        <StatCard icon={Clock} label="Pending Reviews" value={stats.pending} trend="Action Required" color="amber" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${Math.round((stats.paid/stats.total || 0) * 100)}%`} trend="Target 100%" color="purple" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Building className="w-5 h-5 text-indigo-400" />
              Participation by Department
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.deptStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-white mb-8">Payment Mix</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={[
                    { name: 'Verified', value: stats.paid },
                    { name: 'Pending', value: stats.pending }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs text-slate-400 font-bold">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-xs text-slate-400 font-bold">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name, roll, or mobile..." 
                className="glass-input w-full pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select 
                  className="glass-input pl-10 pr-8 py-3 text-xs font-bold uppercase tracking-wider"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {stats.deptStats.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <select 
                className="glass-input px-6 py-3 text-xs font-bold uppercase tracking-wider"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-8 py-5">Contributor Info</th>
                <th className="px-8 py-5">Academic Records</th>
                <th className="px-8 py-5">Payment Tracking</th>
                <th className="px-8 py-5 text-center">Verification</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-white font-bold text-base mb-1">{item.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <Smartphone className="w-3 h-3" /> {item.mobileNumber}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-slate-300 text-sm font-semibold mb-1">Roll: {item.rollNumber}</div>
                    <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.1em]">{item.department} • {item.shift} Shift</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 text-sm font-bold">{item.paymentMethod}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{item.transactionId || 'NO TXID FOUND'}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => handleUpdateStatus(item.id!, item.paymentStatus)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                        item.paymentStatus === 'Verified' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}
                    >
                      {item.paymentStatus === 'Verified' ? 'Verified' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(item)}
                        className="p-3 glass-card rounded-xl hover:bg-indigo-500/20 hover:text-indigo-400 transition-all text-slate-600"
                        title="Edit Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id!)}
                        className="p-3 glass-card rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all text-slate-600"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-600 italic font-medium">
                    No matching records found in the current selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
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
                      value={modalData.department || 'Computer'}
                      onChange={e => setModalData({...modalData, department: e.target.value as any})}
                    >
                      <option value="Computer">Computer</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Civil">Civil</option>
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
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : editingItem ? 'Update Record' : 'Create Record'}
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
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border bg-gradient-to-br backdrop-blur-xl group hover:scale-[1.02] transition-all",
      colors[color]
    )}>
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] mb-1 font-black opacity-60">{label}</p>
        <p className="text-4xl font-display font-extrabold tracking-tight text-white">{value}</p>
      </div>
    </div>
  );
}
