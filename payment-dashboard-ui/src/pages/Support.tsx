import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HelpCircle, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

const resources = [
  {
    title: 'Documentation',
    description: 'Full API reference and integration guides',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600',
    link: '#',
  },
  {
    title: 'FAQs',
    description: 'Common questions about transaction processing',
    icon: HelpCircle,
    color: 'bg-emerald-50 text-emerald-600',
    link: '#',
  },
  {
    title: 'Contact Support',
    description: 'Reach our team for technical assistance',
    icon: MessageSquare,
    color: 'bg-violet-50 text-violet-600',
    link: '#',
  },
];

export default function Support() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Support</h1>
              <p className="text-sm text-slate-500 mt-1">Get help with your payment dashboard</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {resources.map((r) => (
                <a
                  key={r.title}
                  href={r.link}
                  className="glass-panel p-5 sm:p-6 group hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center mb-4`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    {r.title}
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{r.description}</p>
                </a>
              ))}
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <h3 className="font-semibold text-slate-800 mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'Go API Server', status: 'Operational', port: ':8080' },
                  { name: 'Rust gRPC Processor', status: 'Operational', port: ':50051' },
                  { name: 'PostgreSQL Database', status: 'Operational', port: ':5432' },
                  { name: 'Frontend Dashboard', status: 'Operational', port: ':5173' },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">{svc.port}</span>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{svc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 sm:p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Architecture</h3>
              <div className="text-sm text-slate-600 space-y-2">
                <div className="flex items-center gap-2 py-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">Browser</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">Vite :5173</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">Go API :8080</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 ml-4">
                  <span className="text-slate-300">&rarr;</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">gRPC :50051</span>
                  <span className="text-slate-300">&rarr;</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">Rust Processor</span>
                </div>
                <div className="flex items-center gap-2 py-1.5 ml-4">
                  <span className="text-slate-300">&rarr;</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">PostgreSQL :5432</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
