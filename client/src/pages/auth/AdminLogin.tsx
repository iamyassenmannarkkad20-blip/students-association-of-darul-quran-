import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
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
        // Even if student logs in here, welcome them and route to student dashboard
        navigate('/student');
      }
    } else {
      setError(res.error || 'Invalid administrator credentials. Access restricted.');
    }
  };

  const handleQuickFill = (fillId: string, fillPass: string) => {
    setIdentifier(fillId);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-gold-500/40 shadow-2xl space-y-6 relative z-10">
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-navy-950 to-navy-800 border-2 border-gold-400 flex items-center justify-center mx-auto text-gold-400 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-gold-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900 text-gold-300 text-[10px] font-black uppercase tracking-widest border border-gold-400/30">
              <Sparkles className="w-3 h-3 text-gold-400" />
              SADQ Administrative Gateway
            </div>
            <h1 className="font-cinzel text-2xl font-black text-navy-950 mt-2">
              ഉദ്യോഗസ്ഥ ലോഗിൻ
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Authorized access for Central Committee, Web Administrators & Sub-Wing Leaders
            </p>
          </div>
        </div>

        {/* 1-Click Quick Fill */}
        <div className="bg-navy-50/80 p-3.5 rounded-2xl border border-gold-400/30 space-y-2">
          <span className="text-[11px] font-bold text-navy-900 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-gold-600" />
            Quick Admin Sign In (1-Click Fill):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('yaseen', '12345678')}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-navy-900 text-gold-300 hover:bg-navy-800 transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
            >
              <ShieldCheck className="w-3 h-3 text-gold-400" />
              <span>Yaseen (by @username)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('foryaseen@gmail.com', '12345678')}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 hover:scale-105"
            >
              <span>By Gmail</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@sadq.org', 'SadqAdmin@2026')}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1"
            >
              <span>Official Admin</span>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="yaseen or foryaseen@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-navy-950 to-navy-900 text-gold-300 text-xs font-black uppercase tracking-wider hover:opacity-95 transition-all shadow-md disabled:opacity-50 hover:shadow-gold-500/20"
          >
            <span>{loading ? 'Authenticating Gateway...' : 'Enter Admin Control Center'}</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </button>
        </form>

        {/* Switch to Student Portal */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-gold-700 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Student / Member Login</span>
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center gap-1 font-semibold text-gold-700 hover:underline"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Register as Student</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
