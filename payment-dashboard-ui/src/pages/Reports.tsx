<<<<<<< HEAD
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchTransactions, fetchMetrics, type Transaction, type Metrics } from '../api';
import { FileDown, TrendingUp, CheckCircle2, Settings2 } from 'lucide-react';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txResult, metricsResult] = await Promise.all([
          fetchTransactions(1000, 0),
          fetchMetrics(),
        ]);
        setTransactions(txResult.data || []);
        setMetrics(metricsResult);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalVolume = transactions.reduce((s, t) => s + t.amount, 0);
  const totalProcessed = metrics ? metrics.total_succeeded + metrics.total_failed : transactions.length;
  const successCount = metrics ? metrics.total_succeeded : transactions.filter(t => t.status === 'SUCCESS').length;
  const failCount = metrics ? metrics.total_failed : transactions.filter(t => t.status === 'FAILED').length;
  const successRate = totalProcessed > 0 ? ((successCount / totalProcessed) * 100).toFixed(2) : '0.00';
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  const exportPDF = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
          .header h1 { font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
          .header .icon { width: 28px; height: 28px; background: #16a34a; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; }
          .header .sub { font-size: 13px; color: #16a34a; margin-top: 4px; }
          .header .meta { text-align: right; font-size: 13px; color: #64748b; }
          .stats { display: flex; gap: 16px; margin-bottom: 32px; }
          .stat-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .stat-card .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
          .stat-card .value { font-size: 28px; font-weight: 700; color: #0f172a; }
          .stat-card .icon-sm { color: #16a34a; }
          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; font-size: 12px; font-weight: 600; color: #64748b; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
          th:last-child { text-align: right; }
          td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
          td:last-child { text-align: right; }
          .success { color: #16a34a; font-weight: 600; }
          .failed { color: #ef4444; font-weight: 600; }
          .icon-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
          .icon-dot.green { background: #16a34a; }
          .icon-dot.red { background: #ef4444; }
          .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>
              <span class="icon">⚡</span>
              Executive Summary
            </h1>
            <p class="sub">Generated dynamically from live Go & Rust pipelines</p>
          </div>
          <div class="meta">
            <p>Date: ${todayDate}</p>
            <p>Merchant: M-1234</p>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <div class="label">TOTAL VOLUME <span class="icon-sm">📈</span></div>
            <div class="value">₹${totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </div>
          <div class="stat-card">
            <div class="label">SUCCESS RATE <span class="icon-sm">✅</span></div>
            <div class="value">${successRate}%</div>
          </div>
        </div>

        <div class="section-title">Transaction Breakdown</div>
        <table>
          <thead>
            <tr><th>Metric</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>Total Processed</td><td>${totalProcessed.toLocaleString()}</td></tr>
            <tr><td><span class="icon-dot green"></span>Successful Payments</td><td class="success">${successCount.toLocaleString()}</td></tr>
            <tr><td><span class="icon-dot red"></span>Failed Payments</td><td class="failed">${failCount.toLocaleString()}</td></tr>
          </tbody>
        </table>

        <p class="footer">Report generated by PayPulse Engine (Powered by Go & Rust)</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Loading reports...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">System Reports</h1>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 rounded-xl text-sm font-medium text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                <FileDown className="h-4 w-4" />
                Export PDF Report
              </button>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                      <Settings2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
                      <p className="text-sm text-primary-600 mt-1">Generated dynamically from live Go & Rust pipelines</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>Date: {todayDate}</p>
                    <p>Merchant: M-1234</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Volume</p>
                      <TrendingUp className="h-5 w-5 text-primary-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      ₹{totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{successRate}%</p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-4">Transaction Breakdown</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3.5 px-4 font-medium text-slate-700">Total Processed</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">{totalProcessed.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Successful Payments
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{successCount.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold">✕</span>
                          Failed Payments
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-600">{failCount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-center text-xs text-slate-400 mt-8 italic">
                  Report generated by PayPulse Engine (Powered by Go & Rust)
                </p>
              </div>
            </div>
          </div>
=======
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
>>>>>>> origin/main
        </main>
      </div>
    </div>
  );
}
