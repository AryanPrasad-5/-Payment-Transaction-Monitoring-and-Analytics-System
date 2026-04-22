import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import MainChart from '../components/MainChart';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
     const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
     axios.get(`${API_URL}/api/transactions`, { headers: { Authorization: `Bearer ${token}` }})
       .then(res => setTx(res.data.slice(0, 4)))
       .catch(console.error);
  }, [token]);

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
                               <p className="text-sm font-medium text-slate-800">{t.id}</p>
                               <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(t.date).toLocaleTimeString()}</p>
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
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
