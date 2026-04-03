import { ArrowUpRight, ArrowDownRight, CreditCard, Activity, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const stats = [
  {
    name: 'Gross Volume',
    value: '₹5,00,000',
    change: '+12.5%',
    trend: 'up',
    icon: Activity,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Successful Payments',
    value: '19,678',
    change: '+8.2%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    name: 'Success Rate',
    value: '89.4%',
    change: '-1.1%',
    trend: 'down',
    icon: CreditCard,
    color: 'bg-orange-50 text-orange-600',
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="glass-panel p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">{stat.name}</h3>
            <div className={clsx("p-2 rounded-lg", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-4">
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            <span className={clsx(
              "flex items-center text-sm font-medium",
              stat.trend === 'up' ? "text-emerald-600" : "text-rose-600"
            )}>
              {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stat.change}
            </span>
          </div>
          
          {/* Decorative background gradient element */}
          <div className={clsx(
            "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity",
            stat.color.split(' ')[0]
          )}></div>
        </div>
      ))}
    </div>
  );
}
