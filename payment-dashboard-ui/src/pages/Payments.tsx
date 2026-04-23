import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, Play } from 'lucide-react';

export default function Payments() {
  const { token } = useAuth();
  const [tx, setTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');

  const fetchTransactions = () => {
    setLoading(true);
    axios.get(`${GO_API_URL}/transactions?limit=20`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setTx(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const generateMockTraffic = async () => {
    setGenerating(true);
    const methods = ["UPI", "CARD", "WALLET"];
    const statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "FAILED"]; // 75% success rate
    
    try {
      for(let i = 0; i < 5; i++) {
        const method = methods[Math.floor(Math.random() * methods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(Math.random() * 5000) + 100;
        
        await axios.post(`${GO_API_URL}/transactions`, {
          merchant_id: "M-1234",
          amount: amount,
          status: status,
          payment_method: method
        }, { headers: { Authorization: `Bearer ${token}` }});
      }
      fetchTransactions();
    } catch(e) {
      console.error("Traffic generation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  // Prepare Pie Chart Data
  const methodCount = tx.reduce((acc, t) => {
    const method = t.payment_method || 'UNKNOWN';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(methodCount).map(key => ({
    name: key,
    value: methodCount[key]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

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
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments Hub</h1>
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={fetchTransactions}
                  className="px-4 py-2 bg-white border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={generateMockTraffic}
                  disabled={generating}
                  className="px-4 py-2 bg-primary-600 shadow-md text-sm font-medium rounded-lg text-white hover:bg-primary-500 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Simulate Traffic
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 glass-panel p-6 bg-white flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left">Payment Methods</h3>
                {pieData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>
                ) : (
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 glass-panel p-6 bg-white">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Live Transaction Feed</h3>
                <div className="space-y-4">
                  {tx.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-slate-400 animate-pulse">Awaiting incoming payments...</div>
                  ) : (
                    tx.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                        <div>
                           <p className="text-sm font-medium text-slate-800">{t.transaction_id || t.id}</p>
                           <p className="text-xs text-slate-400 font-mono mt-0.5">{new Date(t.created_at || t.date).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                           <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                              {t.payment_method || 'UNKNOWN'}
                           </span>
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
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
