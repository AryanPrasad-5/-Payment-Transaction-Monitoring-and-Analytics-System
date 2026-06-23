<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
>>>>>>> origin/main
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MainChart from '../components/MainChart';
<<<<<<< HEAD
import { fetchTransactions, fetchMetrics, type Transaction, type Metrics } from '../api';
import { TrendingUp, CheckCircle2, ArrowUpRight, Download } from 'lucide-react';

export default function Dashboard() {
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [allTxns, setAllTxns] = useState<Transaction[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [txResult, metricsResult] = await Promise.all([
          fetchTransactions(500, 0),
          fetchMetrics(),
        ]);
        const txns = txResult.data || [];
        setAllTxns(txns);
        setRecentTxns(txns.slice(0, 20));
        setMetrics(metricsResult);
      } catch {}
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalVolume = allTxns.reduce((sum, t) => sum + t.amount, 0);
  const successCount = metrics ? metrics.total_succeeded : allTxns.filter(t => t.status === 'SUCCESS').length;

  const exportData = () => {
    const csvRows = ['Transaction ID,Merchant,Amount,Status,Method,Date'];
    allTxns.forEach(tx => {
      csvRows.push(`${tx.transaction_id},${tx.merchant_id},${tx.amount},${tx.status},${tx.payment_method},${tx.created_at}`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
=======
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
     const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');
     axios.get(`${GO_API_URL}/transactions?limit=4`, { headers: { Authorization: `Bearer ${token}` }})
       .then(res => setTx(res.data.data || []))
       .catch(console.error);
  }, [token]);
>>>>>>> origin/main

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview Analytics</h1>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Volume</p>
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                </div>
                <div className="flex items-baseline gap-4">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <span className="flex items-center text-sm font-medium text-emerald-600">
                    <ArrowUpRight className="h-4 w-4 mr-0.5" />
                    +12.5%
                  </span>
                </div>
              </div>

              <div className="glass-panel p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Successful Payments</p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-4">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">
                    {successCount.toLocaleString()}
                  </p>
                  <span className="flex items-center text-sm font-medium text-emerald-600">
                    <ArrowUpRight className="h-4 w-4 mr-0.5" />
                    +8.2%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 glass-panel p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Dynamic Payment Volume</h3>
                <MainChart />
              </div>

              <div className="lg:col-span-2 glass-panel p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Transactions</h3>
                <div className="space-y-0 max-h-[380px] overflow-y-auto">
                  {recentTxns.length === 0 ? (
                    <p className="text-slate-400 text-sm">No transactions yet</p>
                  ) : (
                    recentTxns.map((tx) => (
                      <div key={tx.transaction_id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{tx.transaction_id}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(tx.created_at).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">₹{tx.amount.toLocaleString()}</p>
                          <span className={`text-xs font-semibold ${tx.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
=======
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Analytics</h1>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-white border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
                Export Data
              </motion.button>
            </div>
            
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 glass-panel p-6 bg-white"
              >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Dynamic Payment Volume</h3>
                    <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none font-medium text-slate-600">
                      <option>Today</option>
                      <option>Last 7 Days</option>
                    </select>
                </div>
                <MainChart />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6 bg-white flex flex-col"
              >
                 <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Transactions</h3>
                 <div className="flex-1 space-y-4">
                    {tx.length === 0 ? (
                       <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Loading live streams...</div>
                    ) : (
                       tx.map((t, idx) => (
                         <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                            <div>
                               <p className="text-sm font-medium text-slate-800">{t.transaction_id || t.id}</p>
                               <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(t.created_at || t.date).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-bold">₹{t.amount}</p>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {t.status}
                               </span>
                            </div>
                         </div>
                       ))
                    )}
                 </div>
                 <button className="mt-6 w-full py-2.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
                    View All Activity
                 </button>
              </motion.div>
>>>>>>> origin/main
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
