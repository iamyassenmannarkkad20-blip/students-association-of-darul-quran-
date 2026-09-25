import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Trophy, Award, Medal, ArrowRight, ShieldCheck, RefreshCw, Sparkles,
  ChevronRight, Users, GraduationCap, FileCheck, Star, ExternalLink, User
} from 'lucide-react';
import { DefendingChampionBanner } from '../../components/DefendingChampionBanner';

interface ClassScore {
  class_code: string;
  total_points: number;
  sub_wing_points: number;
  main_committee_points: number;
  entries_count: number;
  rank: number;
}

interface StudentScore {
  user_id: string;
  username: string;
  full_name: string;
  profile_slug: string;
  class_code: string;
  profile_photo_url?: string;
  total_points: number;
  events_count: number;
  first_places: number;
  second_places: number;
  third_places: number;
  certificates_count: number;
  rank: number;
}

export const ClassLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classes' | 'students'>('classes');
  const [classes, setClasses] = useState<ClassScore[]>([]);
  const [students, setStudents] = useState<StudentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentClassFilter, setStudentClassFilter] = useState('');

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const studentQuery = studentClassFilter ? `/leaderboard/students?classCode=${studentClassFilter}` : '/leaderboard/students';
      const [classRes, studentRes] = await Promise.all([
        apiRequest<ClassScore[]>('/leaderboard/leaderboard'),
        apiRequest<StudentScore[]>(studentQuery),
      ]);
      if (classRes.success && classRes.data) {
        setClasses(classRes.data);
      }
      if (studentRes.success && studentRes.data) {
        setStudents(studentRes.data);
      }
    } catch (err) {
      console.error('Failed to load leaderboards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, [studentClassFilter]);

  const top3Classes = classes.slice(0, 3);
  const remainingClasses = classes.slice(3);

  const top3Students = students.slice(0, 3);
  const remainingStudents = students.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-widest shadow-md">
          <Trophy className="w-4 h-4 text-[#ffd014]" />
          <span>SADQ Official Performance & Honours System</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#02167f] tracking-tight">
          {activeTab === 'classes' ? 'Class Championship Leaderboard' : 'Student Star Achievers Leaderboard'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {activeTab === 'classes'
            ? 'Dynamic real-time ranking of the 8 SADQ batch sangadhanakal based on cumulative points from offline Sub-Wing competitions and Main Committee tasks.'
            : 'Individual academy star rankings. Students earn points, trophies, and official certificates for 1st, 2nd, and 3rd place competition honors.'}
        </p>

        {/* Tab Toggle Pill */}
        <div className="flex items-center justify-center pt-3">
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md gap-1.5">
            <button
              onClick={() => setActiveTab('classes')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'classes'
                  ? 'bg-[#02167f] text-[#ffd014] shadow-md shadow-[#02167f]/20 scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Class Championship (8 Batches)</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-[#02167f] text-[#ffd014] shadow-md shadow-[#02167f]/20 scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Student Star Achievers</span>
            </button>
          </div>
        </div>

        {/* Navigation Action Links */}
        <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
          <Link
            to="/results"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#02167f] hover:bg-slate-50 shadow-sm transition-all"
          >
            <span>Browse All Program Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/class-unions"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#02167f]" />
            <span>8 Class Sangadhanakal</span>
          </Link>
          <Link
            to="/alumni"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-800 hover:bg-slate-50 shadow-sm transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Alumni Scholars</span>
          </Link>
          <button
            onClick={fetchLeaderboards}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#02167f] shadow-sm transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Defending Champion Banner */}
      <div className="max-w-5xl mx-auto">
        <DefendingChampionBanner />
      </div>

      {/* ================================================== */}
      {/* TAB 1: CLASS CHAMPIONSHIP LEADERBOARD */}
      {/* ================================================== */}
      {activeTab === 'classes' && (
        <div className="space-y-12">
          {/* Top 3 Podium Cards */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Rank 2 (Silver) */}
              {top3Classes[1] && (
                <div className="order-2 md:order-1 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 mb-3 shadow-inner">
                    <Medal className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-2">
                    Rank #2 — Silver
                  </span>
                  <h2 className="font-cinzel text-2xl font-black text-slate-900">
                    Class {top3Classes[1].class_code}
                  </h2>
                  <div className="text-3xl font-black text-[#02167f] my-2">
                    {top3Classes[1].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
                  </div>
                  <div className="w-full text-xs text-slate-500 space-y-1 py-2 border-t border-slate-100 mt-2">
                    <div className="flex justify-between">
                      <span>Sub-Wing Points:</span>
                      <strong className="text-slate-800">{top3Classes[1].sub_wing_points}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Task Points:</span>
                      <strong className="text-slate-800">{top3Classes[1].main_committee_points}</strong>
                    </div>
                  </div>
                  <Link
                    to={`/class/${top3Classes[1].class_code}`}
                    className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Class Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Rank 1 (Gold Champion) */}
              {top3Classes[0] && (
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
                    Class {top3Classes[0].class_code}
                  </h2>
                  <div className="text-4xl font-black text-[#ffd014] my-2 drop-shadow-md">
                    {top3Classes[0].total_points} <span className="text-sm font-bold text-amber-200">PTS</span>
                  </div>
                  <div className="w-full text-xs text-blue-100/80 space-y-1.5 py-3 border-t border-white/15 mt-3">
                    <div className="flex justify-between">
                      <span>Sub-Wing Points:</span>
                      <strong className="text-white">{top3Classes[0].sub_wing_points}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Task Points:</span>
                      <strong className="text-white">{top3Classes[0].main_committee_points}</strong>
                    </div>
                  </div>
                  <Link
                    to={`/class/${top3Classes[0].class_code}`}
                    className="mt-4 w-full py-3 rounded-xl bg-[#ffd014] hover:bg-amber-300 text-[#02167f] font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>View Champion Performance</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3Classes[2] && (
                <div className="order-3 md:order-3 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
                    <Medal className="w-8 h-8 text-amber-700" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
                    Rank #3 — Bronze
                  </span>
                  <h2 className="font-cinzel text-2xl font-black text-slate-900">
                    Class {top3Classes[2].class_code}
                  </h2>
                  <div className="text-3xl font-black text-[#02167f] my-2">
                    {top3Classes[2].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
                  </div>
                  <div className="w-full text-xs text-slate-500 space-y-1 py-2 border-t border-slate-100 mt-2">
                    <div className="flex justify-between">
                      <span>Sub-Wing Points:</span>
                      <strong className="text-slate-800">{top3Classes[2].sub_wing_points}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Task Points:</span>
                      <strong className="text-slate-800">{top3Classes[2].main_committee_points}</strong>
                    </div>
                  </div>
                  <Link
                    to={`/class/${top3Classes[2].class_code}`}
                    className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Class Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Full Table */}
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
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6 w-20">Rank</th>
                      <th className="py-4 px-6">Class Entity</th>
                      <th className="py-4 px-6 text-center">Sub-Wing Points</th>
                      <th className="py-4 px-6 text-center">Main Committee Points</th>
                      <th className="py-4 px-6 text-center">Total Points</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classes.map((c) => (
                      <tr key={c.class_code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                              c.rank === 1
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-sm'
                                : c.rank === 2
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : c.rank === 3
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{c.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>Class {c.class_code}</span>
                            {c.rank === 1 && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                          </div>
                          <span className="text-[11px] text-slate-400">Batch Sangadhana</span>
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-700">
                          {c.sub_wing_points} pts
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-700">
                          {c.main_committee_points} pts
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-navy-50 text-[#02167f] font-black text-sm border border-navy-200">
                            {c.total_points} PTS
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/class/${c.class_code}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-[#ffd014] text-slate-800 text-xs font-bold transition-all shadow-sm"
                          >
                            <span>Breakdown</span>
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
      )}

      {/* ================================================== */}
      {/* TAB 2: STUDENT STAR ACHIEVERS (INDIVIDUAL RANKING) */}
      {/* ================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-12">
          {/* Batch Filter Bar */}
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter by Batch:</span>
              <select
                value={studentClassFilter}
                onChange={(e) => setStudentClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white cursor-pointer"
              >
                <option value="">All Classes (Classes 01–08)</option>
                {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              {studentClassFilter && (
                <button
                  onClick={() => setStudentClassFilter('')}
                  className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {students.length} Ranked Academy Stars
            </div>
          </div>

          {/* Top 3 Students Podium */}
          {top3Students.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Student Rank 2 (Silver) */}
                {top3Students[1] && (
                  <div className="order-2 md:order-1 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-100 flex items-center justify-center mb-3 shadow">
                      {top3Students[1].profile_photo_url ? (
                        <img
                          src={top3Students[1].profile_photo_url}
                          alt={top3Students[1].full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 mb-1">
                      Rank #2 — Silver Star
                    </span>
                    <h2 className="font-bold text-lg text-slate-900 line-clamp-1">
                      {top3Students[1].full_name}
                    </h2>
                    <span className="text-xs font-bold text-gold-600 mb-2">
                      @{top3Students[1].username} • Class {top3Students[1].class_code}
                    </span>
                    <div className="text-3xl font-black text-[#02167f] my-2">
                      {top3Students[1].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 py-2 border-t border-slate-100 w-full justify-center">
                      <span>🥇 {top3Students[1].first_places}</span>
                      <span>🥈 {top3Students[1].second_places}</span>
                      <span>🥉 {top3Students[1].third_places}</span>
                      <span>📜 {top3Students[1].certificates_count} Certs</span>
                    </div>

                    <Link
                      to={`/portfolio/${top3Students[1].profile_slug}`}
                      className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-[#ffd014] text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Student Portfolio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Student Rank 1 (Gold Star Champion) */}
                {top3Students[0] && (
                  <div className="order-1 md:order-2 rounded-3xl bg-gradient-to-br from-[#02167f] via-[#031d96] to-[#010e52] text-white p-8 text-center shadow-2xl border-2 border-[#ffd014] hover:-translate-y-1 transition-all flex flex-col items-center relative group">
                    <div className="absolute -top-3.5 px-4 py-1 rounded-full bg-[#ffd014] text-[#02167f] text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 border border-white/40">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>TOP ACADEMY STAR</span>
                    </div>

                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#ffd014] bg-white/10 flex items-center justify-center mb-3 mt-2 shadow-xl">
                      {top3Students[0].profile_photo_url ? (
                        <img
                          src={top3Students[0].profile_photo_url}
                          alt={top3Students[0].full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-amber-200" />
                      )}
                    </div>

                    <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#ffd014] text-[#02167f] mb-1">
                      Rank #1 — Gold Star
                    </span>

                    <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white line-clamp-1">
                      {top3Students[0].full_name}
                    </h2>
                    <span className="text-xs font-bold text-amber-200 mb-2">
                      @{top3Students[0].username} • Class {top3Students[0].class_code}
                    </span>

                    <div className="text-4xl font-black text-[#ffd014] my-2 drop-shadow-md">
                      {top3Students[0].total_points} <span className="text-sm font-bold text-amber-200">PTS</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-bold text-amber-100 py-2 border-t border-white/15 w-full justify-center">
                      <span>🥇 {top3Students[0].first_places} Firsts</span>
                      <span>🥈 {top3Students[0].second_places} Seconds</span>
                      <span>📜 {top3Students[0].certificates_count} Certs</span>
                    </div>

                    <Link
                      to={`/portfolio/${top3Students[0].profile_slug}`}
                      className="mt-3 w-full py-3 rounded-xl bg-[#ffd014] hover:bg-amber-300 text-[#02167f] font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
                    >
                      <span>View Star Portfolio</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Student Rank 3 (Bronze) */}
                {top3Students[2] && (
                  <div className="order-3 md:order-3 rounded-3xl bg-white border-2 border-slate-200 p-6 text-center shadow-lg hover:border-[#02167f] transition-all flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-200 bg-amber-50 flex items-center justify-center mb-3 shadow">
                      {top3Students[2].profile_photo_url ? (
                        <img
                          src={top3Students[2].profile_photo_url}
                          alt={top3Students[2].full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-amber-800" />
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-1">
                      Rank #3 — Bronze Star
                    </span>
                    <h2 className="font-bold text-lg text-slate-900 line-clamp-1">
                      {top3Students[2].full_name}
                    </h2>
                    <span className="text-xs font-bold text-gold-600 mb-2">
                      @{top3Students[2].username} • Class {top3Students[2].class_code}
                    </span>
                    <div className="text-3xl font-black text-[#02167f] my-2">
                      {top3Students[2].total_points} <span className="text-xs font-semibold text-slate-500">PTS</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 py-2 border-t border-slate-100 w-full justify-center">
                      <span>🥇 {top3Students[2].first_places}</span>
                      <span>🥈 {top3Students[2].second_places}</span>
                      <span>🥉 {top3Students[2].third_places}</span>
                      <span>📜 {top3Students[2].certificates_count} Certs</span>
                    </div>

                    <Link
                      to={`/portfolio/${top3Students[2].profile_slug}`}
                      className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-[#ffd014] text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Student Portfolio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Student Leaderboard Table */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
              <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-[#02167f]">
                    Academy Student Individual Scoreboard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official rankings of individual student achievers across all offline Sub-Wing and Main Committee competitions.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {students.length} Star Achievers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6 w-20">Rank</th>
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Class</th>
                      <th className="py-4 px-6 text-center">Honors & Trophies</th>
                      <th className="py-4 px-6 text-center">Certificates</th>
                      <th className="py-4 px-6 text-center">Total Points</th>
                      <th className="py-4 px-6 text-right">Portfolio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((s) => (
                      <tr key={s.user_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                              s.rank === 1
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-sm'
                                : s.rank === 2
                                ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                : s.rank === 3
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{s.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {s.profile_photo_url ? (
                                <img
                                  src={s.profile_photo_url}
                                  alt={s.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 m-2 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{s.full_name}</span>
                                {s.rank === 1 && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              </div>
                              <span className="text-[11px] text-gold-700 font-semibold block">
                                @{s.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-50 text-[#02167f] font-bold text-[11px] border border-navy-200">
                            <GraduationCap className="w-3 h-3" />
                            <span>Class {s.class_code}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold">
                            <span title="First Place Honors">🥇 {s.first_places}</span>
                            <span title="Second Place Honors">🥈 {s.second_places}</span>
                            <span title="Third Place Honors">🥉 {s.third_places}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                            <span>{s.certificates_count} verified</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl bg-navy-50 text-[#02167f] font-black text-sm border border-navy-200">
                            {s.total_points} PTS
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            to={`/portfolio/${s.profile_slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-[#ffd014] text-slate-800 text-xs font-bold transition-all shadow-sm"
                          >
                            <span>Profile</span>
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
      )}
    </div>
  );
};
