import { Bell, Search, LogOut, X, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { fetchTransactions, type Transaction } from '../api';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchTransactions(10, 0);
        setRecentTxns(result.data || []);
      } catch {}
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-10">
      <div className="flex-1 flex bg-white ring-1 ring-slate-900/5 rounded-full px-3 sm:px-4 py-2 max-w-xs sm:max-w-md items-center shadow-sm ml-10 lg:ml-0">
        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search transactions, customers..."
          className="bg-transparent border-none outline-none w-full pl-2 sm:pl-3 text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-800">Recent Activity</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Close
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {recentTxns.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">No recent activity</div>
                ) : (
                  recentTxns.slice(0, 6).map((tx) => (
                    <div key={tx.transaction_id} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      {tx.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {tx.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ₹{tx.amount.toLocaleString()} via {tx.payment_method}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleString('en-IN', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <button className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">Viewer</p>
            <p className="text-xs text-slate-500">aryanr12b@gmail.com</p>
          </div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-500 text-sm font-medium">A</span>
          </div>
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
