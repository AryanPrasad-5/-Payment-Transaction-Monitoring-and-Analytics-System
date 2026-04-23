import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Refunds() {
  const { token } = useAuth();
  const [failedTx, setFailedTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');

  const fetchFailedTransactions = () => {
    setLoading(true);
    axios.get(`${GO_API_URL}/transactions?status=FAILED&limit=50`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setFailedTx(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFailedTransactions();
  }, [token]);

  const totalRefundAmount = failedTx.reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const methodCount = failedTx.reduce((acc, t) => {
    const method = t.payment_method || 'UNKNOWN';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refunds Processing</h1>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={fetchFailedTransactions}
                className="px-4 py-2 bg-white border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-6 bg-white border-l-4 border-rose-500">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="text-rose-500 w-5 h-5" />
                  <h3 className="text-sm font-semibold text-slate-500 uppercase">Failed Payments</h3>
                </div>
                <p className="text-3xl font-bold text-slate-900">{failedTx.length}</p>
              </div>
              <div className="glass-panel p-6 bg-white border-l-4 border-amber-500">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Total Amount to Refund</h3>
                <p className="text-3xl font-bold text-slate-900">₹{totalRefundAmount.toLocaleString()}</p>
              </div>
              <div className="glass-panel p-6 bg-white border-l-4 border-slate-400 flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Top Failure Method</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(methodCount).map(k => (
                    <span key={k} className="px-2 py-1 bg-slate-100 text-xs font-bold rounded-md text-slate-600">
                      {k}: {methodCount[k]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 bg-white">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Failed Transactions Log</h3>
               <div className="space-y-4">
                  {failedTx.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-400">No failed transactions found.</div>
                  ) : (
                    failedTx.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-50">
                        <div>
                           <p className="text-sm font-medium text-slate-800">{t.transaction_id || t.id}</p>
                           <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(t.created_at || t.date).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                           <span className="text-xs font-bold px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-md">
                              {t.payment_method || 'UNKNOWN'}
                           </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <p className="text-sm font-bold text-rose-600">₹{t.amount}</p>
                           <button className="text-[10px] font-bold mt-1 text-primary-600 hover:text-primary-700 underline">
                              Issue Refund
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
