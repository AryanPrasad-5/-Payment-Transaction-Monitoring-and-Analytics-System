import { CreditCard as CardIcon, RefreshCw, FileBox, Settings as SettingsIcon, HelpCircle as HelpIcon, Activity as ActivityIcon, Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useState } from 'react';

const navItems = [
  { name: 'Analytics', icon: ActivityIcon, path: '/dashboard' },
  { name: 'Payments', icon: CardIcon, path: '/payments' },
  { name: 'Refunds', icon: RefreshCw, path: '/refunds' },
  { name: 'Reports', icon: FileBox, path: '/reports' },
];

const bottomItems = [
  { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  { name: 'Support', icon: HelpIcon, path: '/support' },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

<<<<<<< HEAD
  const sidebarContent = (
    <>
      <div className="h-16 lg:h-20 flex items-center px-6 lg:px-8 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
=======
  return (
    <div className="w-64 bg-white/40 backdrop-blur-md border-r border-white/50 flex-col hidden lg:flex transition-all duration-300">
      <div className="h-20 flex items-center px-8 border-b border-white/50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-8 w-8 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
>>>>>>> origin/main
            <ActivityIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            PayPulse
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 lg:py-8 flex flex-col gap-6 px-4">
        <div>
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Dashboard</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={clsx(
<<<<<<< HEAD
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary-50 text-primary-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
=======
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  location.pathname === item.path 
                    ? "bg-white/60 text-primary-600 shadow-sm shadow-primary-500/10 border border-white/50"
                    : "text-slate-600 hover:bg-white/40 hover:text-slate-900 border border-transparent"
>>>>>>> origin/main
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </div>
    </>
  );
}
