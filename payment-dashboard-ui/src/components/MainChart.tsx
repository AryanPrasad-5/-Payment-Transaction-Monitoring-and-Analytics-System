import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '10:00 AM', volume: 18500 },
  { time: '10:30 AM', volume: 13000 },
  { time: '11:00 AM', volume: 8000 },
  { time: '11:30 AM', volume: 7500 },
  { time: '12:00 PM', volume: 15000 },
  { time: '12:30 PM', volume: 12500 },
  { time: '01:00 PM', volume: 15500 },
  { time: '01:30 PM', volume: 18000 },
];

export default function MainChart() {
  return (
    <div className="h-80 w-full" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Volume']}
            labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
          />
          <Area 
            type="monotone" 
            dataKey="volume" 
            stroke="#0ea5e9" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorVolume)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
