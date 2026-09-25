import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Trophy, Award, Medal, ArrowRight, ShieldCheck, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';

interface ClassScore {
  class_code: string;
  total_points: number;
  sub_wing_points: number;
  main_committee_points: number;
  entries_count: number;
  rank: number;
}

export const ClassLeaderboard: React.FC = () => {
  const [classes, setClasses] = useState<ClassScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<ClassScore[]>('/leaderboard/leaderboard');
      if (res.success && res.data) {
        setClasses(res.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const top3 = classes.slice(0, 3);
  const remaining = classes.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-widest shadow-md">
          <Trophy className="w-4 h-4 text-[#ffd014]" />
          <span>SADQ Official Performance System</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#02167f] tracking-tight">
          Class Championship Leaderboard
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Dynamic real-time ranking of the 8 SADQ classes based on points awarded from offline Sub-Wing competitions and Main Committee tasks.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#02167f] hover:bg-slate-50 shadow-sm transition-all"
          >
            <span>Browse All Program Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#02167f] shadow-sm transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="order-2 md:order-1 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 mb-3 shadow-inner">
                <Medal className="w-8 h-8 text-slate-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-2">
                Rank #2 — Silver
              </span>
              <h2 className="font-cinzel text-2xl font-black text-slate-900">
                Class {top3[1].class_code}
              </h2>
              <div className="text-3xl font-black text-[#02167f] my-2">
                {top3[1].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
              </div>
              <div className="w-full text-xs text-slate-500 space-y-1 py-2 border-t border-slate-100 mt-2">
                <div className="flex justify-between">
                  <span>Sub-Wing Points:</span>
                  <strong className="text-slate-800">{top3[1].sub_wing_points}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Task Points:</span>
                  <strong className="text-slate-800">{top3[1].main_committee_points}</strong>
                </div>
              </div>
              <Link
                to={`/class/${top3[1].class_code}`}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>Class Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Rank 1 (Gold Champion) */}
          {top3[0] && (
            <div className="order-1 md:order-2 rounded-3xl bg-gradient-to-br from-[#02167f] via-[#031d96] to-[#010e52] text-white p-8 text-center shadow-2xl border-2 border-[#ffd014] hover:-translate-y-1 transition-all flex flex-col items-center relative group">
              <div className="absolute -top-3.5 px-4 py-1 rounded-full bg-[#ffd014] text-[#02167f] text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 border border-white/40">
                <Trophy className="w-3.5 h-3.5" />
                <span>CHAMPION LEADER</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ffd014] via-amber-200 to-[#ffd014] flex items-center justify-center text-[#02167f] mb-4 mt-2 shadow-xl">
                <Award className="w-10 h-10" />
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffd014] text-[#02167f] mb-2">
                Rank #1 — Gold
              </span>
              <h2 className="font-cinzel text-3xl font-black text-white">
                Class {top3[0].class_code}
              </h2>
              <div className="text-4xl font-black text-[#ffd014] my-2 drop-shadow-md">
                {top3[0].total_points} <span className="text-sm font-bold text-amber-200">PTS</span>
              </div>
              <div className="w-full text-xs text-blue-100/80 space-y-1.5 py-3 border-t border-white/15 mt-3">
                <div className="flex justify-between">
                  <span>Sub-Wing Points:</span>
                  <strong className="text-white">{top3[0].sub_wing_points}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Task Points:</span>
                  <strong className="text-white">{top3[0].main_committee_points}</strong>
                </div>
              </div>
              <Link
                to={`/class/${top3[0].class_code}`}
                className="mt-4 w-full py-3 rounded-xl bg-[#ffd014] hover:bg-amber-300 text-[#02167f] font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>View Champion Performance</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="order-3 md:order-3 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
                <Medal className="w-8 h-8 text-amber-700" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                Rank #3 — Bronze
              </span>
              <h2 className="font-cinzel text-2xl font-black text-slate-900">
                Class {top3[2].class_code}
              </h2>
              <div className="text-3xl font-black text-[#02167f] my-2">
                {top3[2].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
              </div>
              <div className="w-full text-xs text-slate-500 space-y-1 py-2 border-t border-slate-100 mt-2">
                <div className="flex justify-between">
                  <span>Sub-Wing Points:</span>
                  <strong className="text-slate-800">{top3[2].sub_wing_points}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Task Points:</span>
                  <strong className="text-slate-800">{top3[2].main_committee_points}</strong>
                </div>
              </div>
              <Link
                to={`/class/${top3[2].class_code}`}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>Class Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Leaderboard Table (All 8 Classes) */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
          <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-cinzel font-bold text-lg text-[#02167f]">
                Complete 8 Classes Score Ledger Standings
              </h3>
              <p className="text-xs text-slate-500">
                Official point ledger ranking for Classes 01 through 08.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
              8 Enrolled Classes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Class Designation</th>
                  <th className="py-4 px-6 text-center">Sub-Wing Points</th>
                  <th className="py-4 px-6 text-center">Main Committee Tasks</th>
                  <th className="py-4 px-6 text-center font-black">Total Score</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c.class_code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${
                        c.rank === 1 ? 'bg-[#ffd014] text-[#02167f] shadow' :
                        c.rank === 2 ? 'bg-slate-200 text-slate-800' :
                        c.rank === 3 ? 'bg-amber-100 text-amber-900' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        #{c.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#02167f]" />
                        <span>Class {c.class_code}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-600">
                      {c.sub_wing_points} pts
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-600">
                      {c.main_committee_points} pts
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#02167f]/10 text-[#02167f] font-black text-sm">
                        {c.total_points}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/class/${c.class_code}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-700 font-semibold text-xs transition-colors"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
