import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Sparkles, ArrowRight, Shield, User, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'SUPER_ADMIN' || res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError(res.error || 'Invalid credentials. Please verify email and password.');
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900">Sign In to SADQ</h1>
          <p className="text-xs text-slate-500">
            Access your student growth dashboard & institutional administration
          </p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-gold-600" />
            Quick Sign In (1-Click Fill):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('foryaseen@gmail.com', '12345678')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-navy-900 text-gold-300 hover:bg-navy-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-gold-400" />
              <span>Yaseen (Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@sadq.org', 'SadqAdmin@2026')}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-slate-500" />
              <span>Official Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foryaseen@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Enrolled student without an account?{' '}
          <Link to="/register" className="font-bold text-navy-900 hover:text-gold-600 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
