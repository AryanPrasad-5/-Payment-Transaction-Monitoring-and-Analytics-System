import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import clsx from 'clsx';

const tabs = ['General', 'Notifications', 'Security', 'API'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your dashboard preferences</p>
            </div>

            <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 border border-slate-200 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'General' && (
              <div className="space-y-4">
                <div className="glass-panel p-4 sm:p-6 space-y-5">
                  <h3 className="font-semibold text-slate-800">Profile Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                      <input type="email" defaultValue="admin@payment.local" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Organization</label>
                    <input type="text" defaultValue="PayPulse Inc." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors">
                    Save Changes
                  </button>
                </div>

                <div className="glass-panel p-4 sm:p-6 space-y-4">
                  <h3 className="font-semibold text-slate-800">Dashboard Preferences</h3>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Auto-refresh data</p>
                      <p className="text-xs text-slate-400">Automatically refresh dashboard every 5 seconds</p>
                    </div>
                    <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                      <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Compact view</p>
                      <p className="text-xs text-slate-400">Show more data in less space</p>
                    </div>
                    <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="glass-panel p-4 sm:p-6 space-y-4">
                <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
                {['Failed transactions', 'Daily reports', 'Merchant alerts', 'System updates'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <p className="text-sm text-slate-700">{item}</p>
                    <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                      <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="glass-panel p-4 sm:p-6 space-y-5">
                <h3 className="font-semibold text-slate-800">Security Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Current Password</label>
                  <input type="password" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">New Password</label>
                    <input type="password" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Confirm Password</label>
                    <input type="password" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-slate-50" />
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors">
                  Update Password
                </button>
              </div>
            )}

            {activeTab === 'API' && (
              <div className="glass-panel p-4 sm:p-6 space-y-5">
                <h3 className="font-semibold text-slate-800">API Configuration</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Backend URL</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly defaultValue="http://localhost:8080" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 font-mono" />
                    <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200">
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">gRPC Server</label>
                  <input type="text" readOnly defaultValue="localhost:50051" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Database</label>
                  <input type="text" readOnly defaultValue="postgres://localhost:5432/postgres" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 font-mono" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
