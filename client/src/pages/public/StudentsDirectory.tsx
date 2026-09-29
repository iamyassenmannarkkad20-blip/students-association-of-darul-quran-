import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Filter,
  GraduationCap,
  Crown,
  ExternalLink,
} from 'lucide-react';

interface StudentDirectoryItem {
  user_id: string;
  username: string;
  full_name: string;
  profile_slug: string;
  class_code: string;
  bio?: string;
  profile_photo_url?: string;
  total_points: number;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  verified_certs: number;
  leadership_role?: string;
  talents: { title: string; category: string }[];
}

const CLASS_OPTIONS = ['ALL', '01', '02', '03', '04', '05', '06', '07', '08'];

export const StudentsDirectory: React.FC = () => {
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'points' | 'medals' | 'name'>('points');

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = selectedClass !== 'ALL' ? `?class_code=${selectedClass}` : '';
        const res = await apiRequest<StudentDirectoryItem[]>(`/public/students${queryParams}`);
        if (res.success && res.data) {
          setStudents(res.data);
        } else {
          setError(res.error || 'Failed to load students directory.');
        }
      } catch (err: any) {
        setError(err.message || 'Error connecting to students directory.');
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [selectedClass]);

  // Client-side search and sorting
  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const nameMatch = s.full_name.toLowerCase().includes(q);
        const usernameMatch = s.username.toLowerCase().includes(q);
        const talentMatch = s.talents?.some((t) => t.title.toLowerCase().includes(q));
        const roleMatch = s.leadership_role?.toLowerCase().includes(q);
        return nameMatch || usernameMatch || talentMatch || roleMatch;
      });
    }

    if (sortBy === 'points') {
      result.sort((a, b) => b.total_points - a.total_points);
    } else if (sortBy === 'medals') {
      result.sort(
        (a, b) =>
          b.gold_medals * 3 +
          b.silver_medals * 2 +
          b.bronze_medals -
          (a.gold_medals * 3 + a.silver_medals * 2 + a.bronze_medals)
      );
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return result;
  }, [students, searchQuery, sortBy]);

  // Aggregate stats
  const totalPoints = useMemo(
    () => students.reduce((acc, s) => acc + (s.total_points || 0), 0),
    [students]
  );
  const totalGold = useMemo(
    () => students.reduce((acc, s) => acc + (s.gold_medals || 0), 0),
    [students]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#02167f] via-blue-950 to-[#010a38] border border-[#ffd014]/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#ffd014]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd014]/20 border border-[#ffd014]/40 text-[#ffd014] text-xs font-bold tracking-wide">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>SADQ Student Growth Ecosystem</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-white tracking-wide leading-tight">
              Students Directory & Growth Dashboards
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore all enrolled students across Class 01 through Class 08. Click any student to
              open their comprehensive <strong>Student 360° Growth Dashboard</strong>, including
              class championship points, competition medals, verified credentials, and digital portfolios.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-[#ffd014]">
                {loading ? '...' : students.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Students
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-amber-300">
                {loading ? '...' : totalPoints}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Class Points
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-black text-amber-200">
                🥇 {loading ? '...' : totalGold}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                Gold Medals
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or talent..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ffd014] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {CLASS_OPTIONS.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClass === cls
                    ? 'bg-[#ffd014] text-[#02167f] shadow-md shadow-[#ffd014]/30 scale-105'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-300 shrink-0">
            <span className="font-semibold text-slate-400 hidden lg:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              aria-label="Sort students by"
              className="bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ffd014]"
            >
              <option value="points">Highest Points</option>
              <option value="medals">Most Medals</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#ffd014]/20 border-t-[#ffd014] rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading student dashboards...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Students Card Grid */}
      {!loading && !error && (
        <>
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">No students found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No students match your active filters ({selectedClass !== 'ALL' ? `Class ${selectedClass}` : 'All Classes'}{' '}
                {searchQuery ? `with query "${searchQuery}"` : ''}).
              </p>
              <button
                onClick={() => {
                  setSelectedClass('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((st) => (
                <div
                  key={st.user_id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#ffd014] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header: Photo, Name, Class Badge */}
                    <div className="flex items-start gap-4">
                      {st.profile_photo_url ? (
                        <img
                          src={st.profile_photo_url}
                          alt={st.full_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#02167f] to-navy-900 border-2 border-[#ffd014]/60 flex items-center justify-center font-cinzel font-black text-xl text-[#ffd014] shadow-md shrink-0 group-hover:scale-105 transition-transform">
                          {st.full_name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-sm text-navy-950 truncate group-hover:text-[#02167f]">
                            {st.full_name}
                          </h2>
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#ffd014] text-[#02167f] rounded-md shrink-0">
                            Class {st.class_code}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          @{st.username}
                        </div>
                        {st.leadership_role && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 border border-amber-200/60 truncate max-w-full">
                            <Crown className="w-3 h-3 text-[#ffd014] shrink-0" />
                            <span className="truncate">{st.leadership_role}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {st.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {st.bio}
                      </p>
                    )}

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">
                          Points
                        </div>
                        <div className="text-xs font-black text-[#02167f]">
                          {st.total_points} pts
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">
                          Medals
                        </div>
                        <div className="text-xs font-bold text-amber-600">
                          🥇 {st.gold_medals} 🥈 {st.silver_medals}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">
                          Certs
                        </div>
                        <div className="text-xs font-bold text-emerald-700">
                          {st.verified_certs} verified
                        </div>
                      </div>
                    </div>

                    {/* Talents Tags */}
                    {st.talents && st.talents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {st.talents.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {t.title}
                          </span>
                        ))}
                        {st.talents.length > 3 && (
                          <span className="px-2 py-0.5 text-[9px] font-bold text-slate-400">
                            +{st.talents.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Primary CTA: Open Student 360 Dashboard */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <Link
                      to={`/portfolio/${st.profile_slug}`}
                      className="w-full py-2.5 bg-gradient-to-r from-[#02167f] to-navy-900 hover:from-[#ffd014] hover:to-amber-300 text-white hover:text-[#02167f] font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                      title={`Open ${st.full_name}'s Student Growth Dashboard`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd014] group-hover:text-[#02167f]" />
                      <span>Open Student Dashboard (360°)</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
