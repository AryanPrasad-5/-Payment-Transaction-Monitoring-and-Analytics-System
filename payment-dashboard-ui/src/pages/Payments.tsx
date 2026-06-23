import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
<<<<<<< HEAD
import { fetchTransactions, type Transaction } from '../api';
import { RefreshCw, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const METHOD_COLORS: Record<string, string> = {
  CARD: '#1e40af',
  UPI: '#16a34a',
  WALLET: '#d97706',
};

export default function Payments() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  async function load() {
    try {
      const result = await fetchTransactions(500, 0);
      setTransactions(result.data || []);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const methodBreakdown = transactions.reduce((acc, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(methodBreakdown).map(([name, value]) => ({ name, value }));

  const simulateTraffic = async () => {
    setSimulating(true);
    try {
      const methods = ['UPI', 'CARD', 'WALLET'];
      const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED'];
      for (let i = 0; i < 5; i++) {
        const body = {
          transaction_id: `tx-${Date.now()}${i}`,
          merchant_id: 'M-1234',
          amount: Math.round(Math.random() * 5000 * 100) / 100,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          payment_method: methods[Math.floor(Math.random() * methods.length)],
        };
        await fetch('/api/v1/transactions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      await load();
    } catch {} finally {
      setSimulating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Payments Hub</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={load}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={simulateTraffic}
                  disabled={simulating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 rounded-xl text-sm font-medium text-white hover:bg-primary-500 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  {simulating ? 'Simulating...' : 'Simulate Traffic'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 glass-panel p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Methods</h3>
                {pieData.length > 0 ? (
                  <div className="h-72">
=======
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
>>>>>>> origin/main
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
<<<<<<< HEAD
                          cy="45%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={METHOD_COLORS[entry.name] || '#94a3b8'} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          iconSize={10}
                          formatter={(value: string) => (
                            <span className="text-sm font-medium text-slate-600">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-slate-400 text-sm">No data</div>
                )}
              </div>

              <div className="lg:col-span-3 glass-panel p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Live Transaction Feed</h3>
                {loading ? (
                  <div className="py-12 text-center text-slate-400">Loading payments...</div>
                ) : transactions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">No transactions yet</div>
                ) : (
                  <div className="space-y-0 max-h-[480px] overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.transaction_id} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{tx.transaction_id}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(tx.created_at).toLocaleString('en-IN', {
                              month: 'numeric', day: 'numeric', year: 'numeric',
                              hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
                            })}
                          </p>
                        </div>
                        <div className="text-center px-4">
                          <span className="text-xs font-medium text-slate-500 uppercase">{tx.payment_method}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">₹{tx.amount.toLocaleString()}</p>
                          <span className={`text-xs font-bold ${tx.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
=======
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
>>>>>>> origin/main
        </main>
      </div>
    </div>
  );
}
