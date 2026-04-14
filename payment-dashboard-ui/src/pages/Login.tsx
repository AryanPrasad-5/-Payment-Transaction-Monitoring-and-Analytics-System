import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to actual backend API later
    if (email && password) {
       navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="glass-panel p-10 w-full max-w-md transform transition-all duration-500 hover:scale-[1.01] shadow-2xl">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary-500 to-brandBlue-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-6 hover:rotate-0 transition-transform">
             <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 text-gradient">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Sign in to Access Analytics</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 outline-none"
                placeholder="admin@payment.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
