import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
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
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
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
        </main>
      </div>
    </div>
  );
}
