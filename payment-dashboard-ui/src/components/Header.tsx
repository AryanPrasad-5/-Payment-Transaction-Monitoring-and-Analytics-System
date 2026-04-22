import { Bell, Search, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Capitalize Role or Default to User
  const roleName = user && 'role' in user ? (user as any).role : 'System Admin';

  return (
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
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>
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
      </div>
    </header>
  );
}
