import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Trophy,
  ArrowLeft,
  Award,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Sparkles,
  Users,
  Medal,
  TrendingUp,
  FileText,
  User,
  Star,
  CheckCircle,
} from 'lucide-react';
import { ClassUnionReleasesFeed } from '../../components/ClassUnionReleasesFeed';

interface ClassUnion {
  class_code: string;
  name: string;
  motto: string;
  description: string;
  logo_url: string;
  banner_url: string;
  chairman_id: string | null;
  chairman_username: string | null;
  chairman_name: string | null;
  chairman_photo_url: string | null;
  chairman_slug: string | null;
  convener_id: string | null;
  convener_username: string | null;
  convener_name: string | null;
  convener_photo_url: string | null;
  convener_slug: string | null;
}

interface Member {
  user_id: string;
  username: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  student_points: number;
  certificates_count: number;
  skills: any[];
}

interface TopContributor {
  user_id: string;
  username: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  contributed_points: number;
  gold_medals: number;
  events_count: number;
}

interface CycleProgression {
  cycle_id: string;
  cycle_name: string;
  academic_year: string;
  start_date: string;
  closed_at: string | null;
  status: 'ACTIVE' | 'CLOSED';
  points_earned: number;
  task_count: number;
}

interface LedgerEntry {
  id: string;
  class_code: string;
  source_type: 'SUB_WING_RESULT' | 'MAIN_COMMITTEE_TASK' | 'MAIN_COMMITTEE_PROGRAM';
  source_id: string;
  points: number;
  description: string;
  created_at: string;
}

export const ClassDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<{
    summary: any;
    active_cycle_standing: any;
    union: ClassUnion | null;
    members: Member[];
    top_contributors: TopContributor[];
    publications: any[];
    cycle_progression: CycleProgression[];
    history: LedgerEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROGRESSION' | 'CONTRIBUTORS' | 'MEMBERS' | 'PUBLICATIONS' | 'LEDGER'>('OVERVIEW');

  useEffect(() => {
    const fetchClass360 = async () => {
      if (!code) return;
      setLoading(true);
      try {
        const res = await apiRequest<any>(`/leaderboard/class-360/${code}`);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load Class 360 data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClass360();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f] mx-auto"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading Class 360° Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Class Batch Not Found</h1>
        <Link
          to="/class-leaderboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leaderboard</span>
        </Link>
      </div>
    );
  }

  const { summary, active_cycle_standing, union, members, top_contributors, cycle_progression, history } = data;
  const maxProgressionPoints = Math.max(...(cycle_progression.map((cp) => cp.points_earned) || [1]), 20);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/class-leaderboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#02167f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Championship Leaderboard</span>
          </Link>

          <Link
            to="/class-unions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs hover:border-[#02167f] transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
            <span>Class Sangadhanakal Directory</span>
          </Link>
        </div>

        {/* Hero Banner: Class 360 & Union Identity */}
        <div className="rounded-3xl bg-gradient-to-r from-[#02167f] via-[#0320a6] to-[#010e52] text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd014] text-[#02167f] text-xs font-black tracking-wider uppercase shadow-sm">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Class {summary.class_code} 360° Hub</span>
                </span>
                <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  {union?.name || `Class ${summary.class_code} Union`}
                </span>
              </div>

              <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white tracking-tight">
                {union?.name || `Class ${summary.class_code}`}
              </h1>

              {union?.motto && (
                <p className="text-amber-200 text-sm font-semibold italic max-w-xl">
                  "{union.motto}"
                </p>
              )}

              <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
                {union?.description ||
                  `Official batch operations, dynamic performance metrics, score trajectory, and active members of Class ${summary.class_code}.`}
              </p>
            </div>

            {/* Score & Standing Pill */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 self-start md:self-auto shadow-lg">
              <div className="text-center">
                <span className="block text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  Overall Rank
                </span>
                <span className="text-3xl font-black text-[#ffd014]">
                  #{summary.rank}
                </span>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <span className="block text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  Total Points
                </span>
                <span className="text-3xl font-black text-white">
                  {summary.total_points}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Active Cycle Standings</span>
              <p className="text-2xl font-black text-[#ffd014] mt-1">{active_cycle_standing?.cycle_points || 0} PTS</p>
              <span className="text-[10px] text-amber-200 font-semibold">Rank #{active_cycle_standing?.cycle_rank || summary.rank}</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Sub-Wing Points</span>
              <p className="text-2xl font-black text-white mt-1">{summary.sub_wing_points} PTS</p>
              <span className="text-[10px] text-blue-200">Offline Competitions</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Main Committee</span>
              <p className="text-2xl font-black text-white mt-1">{summary.main_committee_points} PTS</p>
              <span className="text-[10px] text-blue-200">Central Direct Tasks</span>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Batch Strength</span>
              <p className="text-2xl font-black text-white mt-1">{members.length}</p>
              <span className="text-[10px] text-blue-200">Enrolled Students</span>
            </div>
          </div>
        </div>

        {/* Appointed Batch Leadership (Chairman & Convener) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Chairman */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-gold-400 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {union?.chairman_photo_url ? (
                <img src={union.chairman_photo_url} alt="Chairman" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-gold-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Official Class Chairman
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                {union?.chairman_name || 'Designated Student Leader'}
              </h3>
              <p className="text-xs text-slate-500">
                {union?.chairman_username ? `@${union.chairman_username}` : `Class ${summary.class_code} Student Head`}
              </p>
            </div>
            {union?.chairman_slug && (
              <Link
                to={`/portfolio/${union.chairman_slug}`}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-navy-50 text-[#02167f] text-xs font-bold hover:bg-navy-100 transition-colors"
              >
                Profile →
              </Link>
            )}
          </div>

          {/* Convener */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-400 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {union?.convener_photo_url ? (
                <img src={union.convener_photo_url} alt="Convener" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                Official Class Convener
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
                {union?.convener_name || 'Designated Student Secretary'}
              </h3>
              <p className="text-xs text-slate-500">
                {union?.convener_username ? `@${union.convener_username}` : `Class ${summary.class_code} Batch Operations`}
              </p>
            </div>
            {union?.convener_slug && (
              <Link
                to={`/portfolio/${union.convener_slug}`}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-navy-50 text-[#02167f] text-xs font-bold hover:bg-navy-100 transition-colors"
              >
                Profile →
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar scroll-touch">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Class Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PROGRESSION')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'PROGRESSION'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Score Trajectory ({cycle_progression.length} Cycles)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONTRIBUTORS')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'CONTRIBUTORS'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Hall of Contributors ({top_contributors.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MEMBERS')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'MEMBERS'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Batch Roster ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PUBLICATIONS')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'PUBLICATIONS'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Union Publications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Score Ledger ({history.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & PROGRESSION GRAPH */}
        {(activeTab === 'OVERVIEW' || activeTab === 'PROGRESSION') && (
          <div className="space-y-6">
            {/* Visual Cycle-by-Cycle Progression Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Seasonal Trajectory Chart</span>
                  </div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    Cycle-by-Cycle Score Progression
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real points accumulated across academic leave cycles for Class {summary.class_code}.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-[#02167f] inline-block" />
                  <span>Points Won</span>
                  <span className="w-3 h-3 rounded-full bg-[#ffd014] inline-block ml-2" />
                  <span>Active Cycle</span>
                </div>
              </div>

              {cycle_progression.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No academic cycles recorded yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visual Bar Graph */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cycle_progression.map((cp) => {
                      const pct = Math.max(Math.round((cp.points_earned / maxProgressionPoints) * 100), 10);
                      const isActive = cp.status === 'ACTIVE';

                      return (
                        <div
                          key={cp.cycle_id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                            isActive
                              ? 'bg-gradient-to-b from-blue-50/50 to-white border-blue-400/80 shadow-md ring-2 ring-blue-500/20'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isActive
                                    ? 'bg-[#ffd014] text-[#02167f]'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isActive ? '⚡ Active Cycle' : 'Concluded'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {new Date(cp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                              {cp.cycle_name}
                            </h4>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-2">
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-black text-[#02167f]">
                                {cp.points_earned} <span className="text-xs font-semibold text-slate-500">PTS</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {cp.task_count} events
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isActive ? 'bg-[#02167f]' : 'bg-slate-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TOP CONTRIBUTORS (HALL OF FAME) */}
        {(activeTab === 'OVERVIEW' || activeTab === 'CONTRIBUTORS') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Class Champions</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Hall of Batch Contributors
                </h2>
                <p className="text-xs text-slate-500">
                  Students who won the most points for Class {summary.class_code} in official competitions.
                </p>
              </div>
            </div>

            {top_contributors.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No individual student points logged yet for this class batch.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {top_contributors.map((c, idx) => (
                  <div
                    key={c.user_id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-[#02167f] transition-all shadow-xs hover:shadow flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-navy-900 text-gold-300 flex items-center justify-center overflow-hidden border border-gold-400/40">
                          {c.profile_photo_url ? (
                            <img src={c.profile_photo_url} alt={c.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ffd014] text-[#02167f] font-black text-[10px] flex items-center justify-center shadow">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{c.full_name}</h4>
                        <p className="text-[11px] text-slate-500 truncate">@{c.username}</p>
                        {c.gold_medals > 0 && (
                          <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                            🥇 {c.gold_medals} Gold
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-[#02167f]">+{c.contributed_points}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">PTS</span>
                      <Link
                        to={`/portfolio/${c.profile_slug}`}
                        className="inline-block text-[10px] font-bold text-blue-600 hover:underline mt-1"
                      >
                        360 View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BATCH ROSTER */}
        {(activeTab === 'OVERVIEW' || activeTab === 'MEMBERS') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-[#02167f]" />
                  <span>Enrolled Scholars</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Class {summary.class_code} Student Directory ({members.length})
                </h2>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No students enrolled in Class {summary.class_code} yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((m) => (
                  <Link
                    key={m.user_id}
                    to={`/portfolio/${m.profile_slug}`}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/90 hover:border-[#02167f] transition-all shadow-xs hover:shadow flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-navy-900 text-gold-300 flex items-center justify-center overflow-hidden border border-gold-400/30 shrink-0">
                        {m.profile_photo_url ? (
                          <img src={m.profile_photo_url} alt={m.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#02167f] transition-colors">
                          {m.full_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">@{m.username}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        +{m.student_points} PTS
                      </span>
                      <span className="text-slate-500 font-semibold group-hover:text-[#02167f]">
                        View 360° →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFICIAL CLASS UNION PUBLICATIONS */}
        {(activeTab === 'OVERVIEW' || activeTab === 'PUBLICATIONS') && (
          <div className="pt-2">
            <ClassUnionReleasesFeed limit={12} classCode={code} />
          </div>
        )}

        {/* TAB 5: SCORE LEDGER & TRANSACTIONS */}
        {(activeTab === 'OVERVIEW' || activeTab === 'LEDGER') && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd014]" />
                  <span>Audit Trail</span>
                </div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  Verified Score Ledger ({history.length})
                </h2>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No score events logged in the ledger yet.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#02167f]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            entry.source_type === 'SUB_WING_RESULT'
                              ? 'bg-blue-100 text-[#02167f]'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {entry.source_type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{entry.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-emerald-600">+{entry.points}</span>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Class Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
