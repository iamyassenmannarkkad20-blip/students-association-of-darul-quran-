import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  User, Sparkles, Layers, Award, FolderGit2, Users, PlusCircle,
  Edit3, Eye, EyeOff, CheckCircle2, TrendingUp, Shield,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const res = await apiRequest('/students/dashboard');
      if (res.success && res.data) setDashboard(res.data);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading your growth dashboard...
      </div>
    );
  }

  const completion = dashboard?.completionPercentage ?? 0;
  const counts = dashboard?.counts ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-navy-900">
            Welcome back, {user?.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Your Student Growth Dashboard — SADQ Platform</p>
        </div>
        <Link
          to="/student/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-sm shadow-md transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-gold-400" />
          <span>Create Content</span>
        </Link>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-600" />
            Profile Completion
          </h2>
          <span className="text-sm font-bold text-navy-900">{completion}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-xs text-slate-500 mt-2">
            <Link to="/student/profile" className="text-navy-900 font-semibold underline">
              Complete your profile
            </Link>{' '}
            — add a bio, interests, and photo.
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Talents', count: counts.talents ?? 0, icon: Sparkles, color: 'text-gold-600', bg: 'bg-gold-50', link: '/student/talents' },
          { label: 'Skills', count: counts.skills ?? 0, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50', link: '/student/skills' },
          { label: 'Achievements', count: counts.achievements ?? 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/student/achievements' },
          { label: 'Projects', count: counts.projects ?? 0, icon: FolderGit2, color: 'text-purple-600', bg: 'bg-purple-50', link: '/student/projects' },
          { label: 'Units', count: counts.activeUnits ?? 0, icon: Shield, color: 'text-navy-700', bg: 'bg-navy-50', link: '/student/organisation' },
        ].map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-gold-400/50 transition-all flex flex-col justify-between"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stat.count}</div>
              <div className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: 'Profile & Privacy', desc: 'Edit bio, photo, interests and privacy toggles', to: '/student/profile', icon: User },
          { title: 'Creative Talents', desc: 'Showcase your natural gifts and creative abilities', to: '/student/talents', icon: Sparkles },
          { title: 'Skills & Proficiency', desc: 'Track skills from Beginner to Expert level', to: '/student/skills', icon: Layers },
          { title: 'Achievements', desc: 'Log verified awards, certifications, and milestones', to: '/student/achievements', icon: Award },
          { title: 'Projects', desc: 'Create and collaborate on initiatives and projects', to: '/student/projects', icon: FolderGit2 },
          { title: 'Organisation Units', desc: 'View your SADQ unit memberships and leadership roles', to: '/student/organisation', icon: Shield },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold-400/40 transition-all flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-xl bg-navy-900/5 border border-navy-900/10 flex items-center justify-center shrink-0 group-hover:bg-navy-900/10 transition-colors">
              <item.icon className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* View Portfolio */}
      {profile?.profile_slug && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 border border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-white text-base">Your Public Portfolio</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {profile.is_public
                ? '✅ Portfolio is public and discoverable'
                : '🔒 Portfolio is private — only you can see it'}
            </p>
          </div>
          <Link
            to={`/portfolio/${profile.profile_slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Portfolio</span>
          </Link>
        </div>
      )}
    </div>
  );
};
