import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsGrid from '../components/StatsGrid';
import MainChart from '../components/MainChart';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
            </div>
            
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-panel p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Payment Volume</h3>
                <MainChart />
              </div>
              <div className="glass-panel p-6">
                 <h3 className="text-lg font-semibold text-slate-800 mb-6">Success Rate</h3>
                 {/* Secondary chart would go here */}
                 <div className="flex items-center justify-center h-64 text-slate-400">
                    Detailed Metrics Area
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
