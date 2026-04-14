import { CreditCard as CardIcon, RefreshCw, FileBox, Settings as SettingsIcon, HelpCircle as HelpIcon, Activity as ActivityIcon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';

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

  return (
    <div className="w-64 bg-white/40 backdrop-blur-md border-r border-white/50 flex-col hidden lg:flex transition-all duration-300">
      <div className="h-20 flex items-center px-8 border-b border-white/50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-8 w-8 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ActivityIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            PayPulse
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-6 px-4">
        <div>
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Dashboard</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  location.pathname === item.path 
                    ? "bg-white/60 text-primary-600 shadow-sm shadow-primary-500/10 border border-white/50"
                    : "text-slate-600 hover:bg-white/40 hover:text-slate-900 border border-transparent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
