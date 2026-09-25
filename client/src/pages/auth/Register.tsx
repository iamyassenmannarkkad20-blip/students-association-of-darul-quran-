import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AtSign,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

const CLASS_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08'];

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classCode, setClassCode] = useState('01');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live username availability check
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  useEffect(() => {
    const sanitized = username.trim().toLowerCase();
    if (!sanitized || sanitized.length < 3) {
      setIsUsernameAvailable(null);
      setUsernameMessage(null);
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(sanitized)) {
      setIsUsernameAvailable(false);
      setUsernameMessage('Username can only contain 3-30 letters, numbers, and underscores.');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await apiRequest(`/auth/check-username/${sanitized}`);
        if (res.success && res.data) {
          setIsUsernameAvailable(res.data.available);
          setUsernameMessage(res.data.available ? '✓ Username is available' : '✗ Username already taken');
        }
      } catch {
        setIsUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric and underscore
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (isUsernameAvailable === false) {
      setError('Please choose an available username.');
      return;
    }

    setLoading(true);
    const res = await register(fullName, email, password, classCode, username.trim() || undefined);
    setLoading(false);

    if (res.success) {
      navigate('/student');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-gold-500/40 flex items-center justify-center mx-auto text-gold-400 shadow">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900">Student Registration</h1>
          <p className="text-xs text-slate-500">
            Create your official SADQ student identity and public portfolio
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Hafiz Muhammad Rashid"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Official Username <span className="text-gold-600 font-bold">*</span>
              </label>
              {checkingUsername && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                </span>
              )}
              {!checkingUsername && usernameMessage && (
                <span
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    isUsernameAvailable ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {isUsernameAvailable ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {usernameMessage}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="rashid_quran"
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Your public address on web: sadq.org/portfolio/{username || 'your_username'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Class Code</label>
            <select
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (min. 8 characters)
            </label>
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
            disabled={loading || isUsernameAvailable === false}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Portfolio...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-navy-900 hover:text-gold-600 underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
