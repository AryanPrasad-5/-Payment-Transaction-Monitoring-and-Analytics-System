import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Download, FileBox, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function Reports() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const GO_API_URL = import.meta.env.VITE_GO_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1');

  const fetchReportData = () => {
    setLoading(true);
    axios.get(`${GO_API_URL}/merchants/M-1234/stats`, { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setMetrics(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReportData();
  }, [token]);

  const exportPDF = () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: 'Payment_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt as any).from(element).save();
  };

  const total = metrics?.total_transactions || 0;
  const failed = metrics?.failed_transactions || 0;
  const success = total - failed;
  const successRate = total > 0 ? (success / total) * 100 : 0;
  const gross = metrics?.gross_volume || 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Reports</h1>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={exportPDF}
                className="px-4 py-2 bg-primary-600 shadow-md text-sm font-medium rounded-lg text-white hover:bg-primary-500 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export PDF Report
              </motion.button>
            </div>

            {loading ? (
              <div className="flex justify-center p-10 animate-pulse text-slate-400">Loading metrics...</div>
            ) : (
              <div ref={reportRef} className="glass-panel p-8 bg-white border border-slate-200 shadow-lg">
                <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <FileBox className="w-6 h-6 text-primary-600" /> Executive Summary
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Generated dynamically from live Go & Rust pipelines</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm font-semibold text-slate-700">Merchant: M-1234</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-slate-500 font-semibold uppercase text-sm">Total Volume</h4>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-4xl font-black text-slate-900">₹{gross.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-slate-500 font-semibold uppercase text-sm">Success Rate</h4>
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-4xl font-black text-slate-900">{successRate.toFixed(2)}%</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Transaction Breakdown</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm">
                      <th className="p-3 border-b border-slate-200 rounded-tl-lg">Metric</th>
                      <th className="p-3 border-b border-slate-200 rounded-tr-lg">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border-b border-slate-100 font-medium text-slate-700 flex items-center gap-2">
                        Total Processed
                      </td>
                      <td className="p-3 border-b border-slate-100 font-bold text-slate-900">{total}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-slate-100 font-medium text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Successful Payments
                      </td>
                      <td className="p-3 border-b border-slate-100 font-bold text-emerald-600">{success}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-slate-100 font-medium text-slate-700 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500" /> Failed Payments
                      </td>
                      <td className="p-3 border-b border-slate-100 font-bold text-rose-600">{failed}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">Report generated by PayPulse Engine (Powered by Go & Rust)</p>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
