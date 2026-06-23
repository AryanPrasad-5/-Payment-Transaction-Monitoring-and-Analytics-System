import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MainChart from '../components/MainChart';
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
