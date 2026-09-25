import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  GraduationCap,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'SUPER_ADMIN' || res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError(res.error || 'Invalid credentials. Please verify your username/email and password.');
    }
  };

  const handleQuickFill = (fillId: string, fillPass: string) => {
    setIdentifier(fillId);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
        {/* Portal Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
          <button
            type="button"
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-white text-navy-900 shadow-sm flex items-center justify-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-navy-700" />
            <span>Student & Member</span>
          </button>
          <Link
            to="/admin/login"
            className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-navy-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-gold-600" />
            <span>Admin Gateway</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400 shadow">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900">Sign In to SADQ</h1>
          <p className="text-xs text-slate-500">
            Access your student growth dashboard, event results & official records
          </p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-gold-600" />
            Quick Sign In (1-Click Fill):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('yaseen', '12345678')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-navy-900 text-gold-300 hover:bg-navy-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-gold-400" />
              <span>Yaseen (@username)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('foryaseen@gmail.com', '12345678')}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <span>By Email</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@sadq.org', 'SadqAdmin@2026')}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <span>Admin</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username or Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. yaseen or student@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              You can log in with your unique @username or registered email.
            </span>
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
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Enrolled student?{' '}
            <Link to="/register" className="font-bold text-navy-900 hover:text-gold-600 underline">
              Register here
            </Link>
          </div>
          <Link
            to="/admin/login"
            className="font-bold text-gold-700 hover:underline flex items-center gap-1"
          >
            <span>Admin Gateway</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
