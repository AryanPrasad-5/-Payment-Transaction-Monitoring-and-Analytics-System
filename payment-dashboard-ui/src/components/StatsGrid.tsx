import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, CreditCard, Activity, CheckCircle2 } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import clsx from 'clsx';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function StatsGrid() {
  const { token } = useAuth();
  const [data, setData] = useState({ grossVolume: 0, totalPayments: 0, failedPayments: 0, successRate: 0 });
  
  useEffect(() => {
     const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');
     axios.get(`${GO_API_URL}/merchants/M-1234/stats`, { headers: { Authorization: `Bearer ${token}` }})
       .then(res => {
         const stats = res.data.data;
         setData({
           grossVolume: stats.gross_volume || 0,
           totalPayments: stats.total_transactions || 0,
           failedPayments: stats.failed_transactions || 0,
           successRate: stats.total_transactions > 0 
             ? ((stats.total_transactions - stats.failed_transactions) / stats.total_transactions) * 100 
             : 0
         });
       })
       .catch(err => console.error("Could not load stats", err));
  }, [token]);

  const stats = [
    {
      name: 'Gross Volume',
      value: `₹${data.grossVolume.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Successful Payments',
      value: (data.totalPayments - data.failedPayments).toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      name: 'Success Rate',
      value: `${data.successRate.toFixed(1)}%`,
      change: '-1.1%',
      trend: 'down',
      icon: CreditCard,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <motion.div 
       variants={container}
       initial="hidden"
       animate="show"
       className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {stats.map((stat) => (
        <motion.div variants={item} key={stat.name} className="glass-panel p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</h3>
            <div className={clsx("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-4 mt-2">
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 tracking-tight">{stat.value}</p>
            <span className={clsx(
              "flex items-center text-sm font-bold px-2 py-1 rounded-md",
              stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
              {stat.change}
            </span>
          </div>
          
          <div className={clsx(
            "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-all duration-500",
            stat.color.split(' ')[0]
          )}></div>
        </motion.div>
      ))}
    </motion.div>
  );
}
