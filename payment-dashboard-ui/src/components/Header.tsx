import { Bell, Search, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-10">
      <div className="flex-1 flex bg-white ring-1 ring-slate-900/5 rounded-full px-4 py-2 max-w-md items-center shadow-sm">
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
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        <button className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">Admin User</p>
            <p className="text-xs text-slate-500">admin@payment.local</p>
          </div>
          <UserCircle className="h-9 w-9 text-slate-300" />
        </button>
      </div>
    </header>
  );
}
