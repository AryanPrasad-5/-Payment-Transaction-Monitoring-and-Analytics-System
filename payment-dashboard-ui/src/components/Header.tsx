<<<<<<< HEAD
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
=======
import { useState, useEffect, useRef } from 'react';
import { Bell, Search, UserCircle, LogOut, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Header() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showNotifs && token) {
      const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');
      axios.get(`${GO_API_URL}/transactions?limit=5`, { headers: { Authorization: `Bearer ${token}` }})
        .then(res => setNotifs(res.data.data || []))
        .catch(console.error);
    }
  }, [showNotifs, token]);

  useEffect(() => {
    const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');
    axios.get(`${GO_API_URL}/health`)
      .then(() => setIsOffline(false))
      .catch(() => setIsOffline(true));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Capitalize Role or Default to User
  const roleName = user && 'role' in user ? (user as any).role : 'System Admin';

  return (
    <>
    {isOffline && (
      <div className="bg-rose-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50">
        <AlertTriangle className="h-4 w-4" />
        Backend API is unreachable! Please ensure your Go and Rust microservices are running locally.
      </div>
    )}
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10 transition-all duration-300">
      <div className="flex-1 flex bg-slate-50 ring-1 ring-slate-900/5 rounded-full px-4 py-2.5 max-w-md items-center shadow-inner hover:ring-primary-500/50 transition-all">
        <Search className="h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, customers..." 
          className="bg-transparent border-none outline-none w-full pl-3 text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative p-2 transition-colors rounded-full ${showNotifs ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-sm">Recent Activity</h3>
                <span className="text-xs text-primary-600 cursor-pointer hover:underline" onClick={() => setShowNotifs(false)}>Close</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifs.length === 0 ? (
                   <div className="p-6 text-center text-slate-500 text-sm">No recent activity</div>
                ) : (
                   notifs.map((tx, idx) => (
                     <div key={idx} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3">
                       {tx.status === 'SUCCESS' ? (
                          <div className="p-1.5 bg-green-100 rounded-full text-green-600 mt-0.5"><CheckCircle className="h-4 w-4" /></div>
                       ) : (
                          <div className="p-1.5 bg-rose-100 rounded-full text-rose-600 mt-0.5"><XCircle className="h-4 w-4" /></div>
                       )}
                       <div>
                         <p className="text-sm text-slate-800 font-medium">
                           {tx.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed'}
                         </p>
                         <p className="text-xs text-slate-500 mt-0.5">₹{tx.amount?.toFixed(2)} via {tx.payment_method}</p>
                         <p className="text-[10px] text-slate-400 mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                       </div>
                     </div>
                   ))
>>>>>>> origin/main
                )}
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD

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
=======
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="flex items-center gap-4 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{roleName}</p>
            <p className="text-xs text-slate-500">{user?.email || 'admin@payment.local'}</p>
          </div>
          <div className="relative">
             <UserCircle className="h-10 w-10 text-slate-300 transition-colors group-hover:text-primary-500 cursor-pointer" />
          </div>
          <button 
             onClick={handleLogout}
             title="Log Out"
             className="p-2 ml-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          >
             <LogOut className="h-5 w-5" />
          </button>
        </div>
>>>>>>> origin/main
      </div>
    </header>
    </>
  );
}
