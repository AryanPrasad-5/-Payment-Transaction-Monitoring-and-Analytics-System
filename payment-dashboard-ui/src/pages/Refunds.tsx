import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchTransactions, type Transaction } from '../api';
import { RefreshCw, XCircle } from 'lucide-react';

export default function Refunds() {
  const [failedTxns, setFailedTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const result = await fetchTransactions(500, 0);
      setFailedTxns((result.data || []).filter((t) => t.status === 'FAILED'));
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalRefundable = failedTxns.reduce((s, t) => s + t.amount, 0);

  const methodBreakdown = failedTxns.reduce((acc, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMethodStr = Object.entries(methodBreakdown)
    .map(([method, count]) => `${method}: ${count}`)
    .join('   ');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Refunds Processing</h1>
              <button
                onClick={load}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-rose-500" />
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Failed Payments</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{failedTxns.length}</p>
              </div>
              <div className="glass-panel p-5 sm:p-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Total Amount to Refund</p>
                <p className="text-3xl font-bold text-slate-900">₹{totalRefundable.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</p>
              </div>
              <div className="glass-panel p-5 sm:p-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Failure Method</p>
                <p className="text-sm font-semibold text-slate-700 mt-2">{topMethodStr || 'None'}</p>
              </div>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Failed Transactions Log</h3>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">Loading refund data...</div>
              ) : failedTxns.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-emerald-500">&#10003;</span>
                  </div>
                  <p className="text-slate-600 font-medium">No failed transactions</p>
                  <p className="text-sm text-slate-400 mt-1">All transactions are processing successfully</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {failedTxns.map((tx) => (
                    <div key={tx.transaction_id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <div>
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
                        <p className="text-sm font-bold text-rose-600">₹{tx.amount.toLocaleString()}</p>
                        <button className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2 mt-0.5">
                          Issue Refund
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
