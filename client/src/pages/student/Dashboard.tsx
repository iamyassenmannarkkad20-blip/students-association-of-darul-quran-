import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  User, Sparkles, Layers, Award, FolderGit2, Users, PlusCircle,
  Edit3, Eye, EyeOff, CheckCircle2, TrendingUp, Shield, Compass, MessageSquare,
  Trophy, FileCheck, ExternalLink, QrCode
} from 'lucide-react';
import { DefendingChampionBanner } from '../../components/DefendingChampionBanner';
import { ClassUnionReleasesFeed } from '../../components/ClassUnionReleasesFeed';
import { DigitalIdCard } from '../../components/DigitalIdCard';

export const StudentDashboard: React.FC = () => {
  const { user, profile, assignedSubWings, assignedClassUnion, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);

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
  const score = dashboard?.score;
  const certificates = dashboard?.certificates || [];
  const hasSubWingRole = assignedSubWings && assignedSubWings.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dual Profile Mode Switcher Pill */}
      {(hasSubWingRole || assignedClassUnion) && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-sm flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl flex-wrap">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-navy-900 text-gold-300 font-bold text-xs flex items-center gap-2 shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-gold-400" />
              <span>Student Profile (Active)</span>
            </button>
            {hasSubWingRole && (
              <Link
                to="/subwing"
                className="px-4 py-2 rounded-lg text-slate-600 hover:text-navy-900 font-bold text-xs flex items-center gap-2 transition-colors hover:bg-white"
              >
                <Award className="w-3.5 h-3.5 text-navy-700" />
                <span>Wing Portal ({assignedSubWings[0].code})</span>
              </Link>
            )}
            {assignedClassUnion && (
              <Link
                to="/student/class-union"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>Class {assignedClassUnion.class_code} Union ({assignedClassUnion.leadership_role})</span>
              </Link>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline px-3">
            Leadership privileges active
          </span>
        </div>
      )}

      {/* Defending Best Class Champion & Active Cycle Banner */}
      <DefendingChampionBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-navy-900">
            Welcome back, {user?.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">Your Student Growth Dashboard — SADQ Platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {hasSubWingRole && (
            <Link
              to="/subwing"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold text-xs shadow-md transition-colors"
            >
              <Award className="w-4 h-4 text-navy-900 shrink-0" />
              <span>Wing Portal ({assignedSubWings[0].code})</span>
            </Link>
          )}
          {assignedClassUnion && (
            <Link
              to="/student/class-union"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Users className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Class {assignedClassUnion.class_code} Union</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setShowIdCard(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 text-navy-950 shrink-0" />
            <span>Digital ID & QR</span>
          </button>

          {user?.username && (
            <Link
              to={`/portfolio/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ffd014] to-amber-300 text-[#02167f] font-black text-xs shadow-md hover:from-amber-200 hover:to-[#ffd014] transition-all hover:scale-105"
              title="Open your public 360° portfolio"
            >
              <ExternalLink className="w-4 h-4 text-[#02167f] shrink-0" />
              <span>My 360° Dashboard</span>
            </Link>
          )}

          <Link
            to="/student/create"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-xs shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Create Content</span>
          </Link>
        </div>
      </div>

      {/* Profile Builder & Completion Prompt Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-[#02167f]/15 border-2 border-gold-400/50 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffd014] to-amber-400 text-[#02167f] flex items-center justify-center font-black shadow shrink-0">
            <Sparkles className="w-6 h-6 text-[#02167f]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 font-bold text-sm">
                Student Profile Builder — Complete Your Digital Identity
              </strong>
              <span className="text-[10px] font-black uppercase tracking-wider bg-gold-100 text-gold-900 px-2 py-0.5 rounded-full border border-gold-300">
                {completion}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Add your WhatsApp number, Instagram handle, bio, and creative talents to build a verified 360° portfolio that peers and faculty can explore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/student/profile"
            className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-gold-400" />
            <span>Complete Profile</span>
          </Link>
          {user?.username && (
            <Link
              to={`/portfolio/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Preview My 360° Dashboard"
            >
              <Eye className="w-4 h-4 text-gold-600" />
            </Link>
          )}
        </div>
      </div>

      {/* DUAL PROFILE: SUB-WING LEADERSHIP CARD (If Assigned as Chairman / Convener) */}
      {hasSubWingRole && (
        <div className="rounded-3xl bg-gradient-to-r from-[#01092e] via-[#02167f] to-[#010e52] text-white p-6 sm:p-8 border-2 border-[#ffd014]/60 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-[#ffd014] text-[#02167f] text-[11px] font-black uppercase tracking-wider shadow">
                  ⭐ Official {assignedSubWings[0].leadership_role}
                </span>
                <span className="text-xs text-amber-200 font-bold">
                  {assignedSubWings[0].code} — {assignedSubWings[0].name}
                </span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
                Sub-Wing Operations & Results Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                As the designated {assignedSubWings[0].leadership_role} of {assignedSubWings[0].name}, you can conduct offline campus competitions, enter student marks, auto-compute honors, and update class championship scores on the live leaderboard.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:items-end gap-2">
              <Link
                to="/subwing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ffd014] via-amber-300 to-[#ffd014] text-[#02167f] font-black text-xs sm:text-sm hover:from-amber-200 hover:to-[#ffd014] shadow-lg shadow-[#ffd014]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Enter Wing Portal ({assignedSubWings[0].code})</span>
                <Award className="w-4 h-4 text-[#02167f]" />
              </Link>
              <span className="text-[10px] text-amber-200/80">
                Switch from Student Mode to Wing Management Mode
              </span>
            </div>
          </div>

          {/* Quick Sub-Wing Switcher if assigned to multiple wings */}
          {assignedSubWings.length > 1 && (
            <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400">All your wings:</span>
              {assignedSubWings.map((w) => (
                <Link
                  key={w.id}
                  to="/subwing"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
                >
                  {w.code} ({w.leadership_role})
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DUAL PROFILE: CLASS UNION LEADERSHIP CARD */}
      {assignedClassUnion && (
        <div className="rounded-3xl bg-gradient-to-r from-[#010e52] via-[#02167f] to-[#0a2399] text-white p-6 sm:p-8 border-2 border-amber-400/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow">
                  ⭐ Designated {assignedClassUnion.leadership_role}
                </span>
                <span className="text-xs text-blue-200 font-bold">
                  Class {assignedClassUnion.class_code} Union
                </span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
                {assignedClassUnion.name || `Class ${assignedClassUnion.class_code} Union`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                As the Class Chairman/Leader, you can name your batch union, set your motto, and publish projects, magazines, posters, and YouTube/Drive links to the campus.
              </p>
            </div>
            <Link
              to="/student/class-union"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>Open Class Union Portal</span>
            </Link>
          </div>
        </div>
      )}

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

      {/* Academy Performance Scorecard & Honours */}
      <div className="rounded-3xl bg-gradient-to-r from-[#02167f] via-[#031d96] to-[#010e52] text-white p-6 sm:p-8 shadow-xl border border-[#ffd014]/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd014] text-[#02167f] text-[10px] font-black uppercase tracking-wider shadow">
              <Trophy className="w-3.5 h-3.5 text-[#02167f]" />
              <span>SADQ Academy Performance Record</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
              Your Competition Score & Trophies
            </h2>
            <p className="text-xs text-blue-100/70">
              Points earned from Sub-Wing offline competitions and Main Committee tasks. Each result directly increases your personal score and your batch score!
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex-1 sm:flex-initial px-4 py-2 rounded-2xl bg-white/10 border border-white/15 text-center">
              <span className="text-[10px] text-amber-200 uppercase font-bold block">Standing</span>
              <span className="text-xl font-black text-[#ffd014]">
                {score?.rank ? `Rank #${score.rank}` : 'Unranked'}
              </span>
            </div>

            <div className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-[#ffd014] text-[#02167f] text-center shadow-lg">
              <span className="text-[10px] uppercase font-black block tracking-wider">Total Score</span>
              <span className="text-2xl font-black leading-none">{score?.total_points || 0} PTS</span>
            </div>
          </div>
        </div>

        {/* Medals & Class Championship Contribution */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥇</span>
            <div className="font-black text-lg text-white">{score?.first_places || 0}</div>
            <span className="text-[10px] font-bold text-amber-300 uppercase">First Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥈</span>
            <div className="font-black text-lg text-white">{score?.second_places || 0}</div>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Second Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥉</span>
            <div className="font-black text-lg text-white">{score?.third_places || 0}</div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">Third Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">📜</span>
            <div className="font-black text-lg text-white">{certificates.length}</div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase">Official Certs</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-blue-100/70 border-t border-white/10">
          <span>Points contribute directly to Class {profile?.class_code} Championship</span>
          <Link to="/class-leaderboard" className="text-[#ffd014] font-bold hover:underline">
            View Live Leaderboard →
          </Link>
        </div>
      </div>

      {/* Official Verified Certificates Locker */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Award Credentials</span>
              </div>
              <h3 className="font-cinzel text-lg font-bold text-slate-900 mt-0.5">
                My Verified Award Certificates ({certificates.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Issued by Central Committee & Wings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert: any) => (
              <div
                key={cert.certificate_id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-[#02167f] transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[9px] font-bold text-[#02167f] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                      {cert.certificate_id}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                    {cert.title}
                  </h4>

                  <div className="text-[10px] text-slate-500">
                    <div>Issuer: <strong>{cert.issuer}</strong></div>
                    <div>Issued: {new Date(cert.issue_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  {cert.external_reference_url ? (
                    <a
                      href={cert.external_reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#02167f] text-[#ffd014] text-xs font-bold hover:bg-[#0320a6] shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Download / View</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">Digital Archive</span>
                  )}
                  <Link to="/certificates" className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                    Verify ID →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
          { title: 'Peer Talents & Connect', desc: 'Explore all students, graded skills & WhatsApp connect', to: '/explore', icon: Compass },
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

      {/* Class Union Publications, Projects & Videos Feed */}
      <ClassUnionReleasesFeed limit={6} />

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

      {/* Digital Student ID Card Modal */}
      {showIdCard && (
        <DigitalIdCard
          student={{
            fullName: user?.fullName || 'Student',
            username: user?.username || profile?.profile_slug,
            classCode: profile?.class_code,
            graduationYear: profile?.graduation_year,
            profileSlug: profile?.profile_slug,
            profilePhotoUrl: profile?.profile_photo_url,
            userId: user?.id,
          }}
          onClose={() => setShowIdCard(false)}
        />
      )}
    </div>
  );
};
