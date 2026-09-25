import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  BarChart3,
  Users,
  GraduationCap,
  Award,
  Trophy,
  BookOpen,
  FolderGit2,
  RefreshCw,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminInstitutionalAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any>('/admin/analytics/institutional');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load institutional analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm animate-pulse space-y-4">
        <RefreshCw className="w-8 h-8 text-[#02167f] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
          Compiling Real-Time Campus Intelligence...
        </p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const classBreakdown = data?.classBreakdown || [];
  const unitBreakdown = data?.unitBreakdown || [];

  const maxClassPoints = Math.max(1, ...classBreakdown.map((c: any) => c.total_points || 0));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#01092e] to-[#02167f] p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd014]/20 border border-[#ffd014]/40 text-[#ffd014] text-[10px] font-black uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            Institutional Intelligence
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
            SADQ Campus Analytics & Audit
          </h2>
          <p className="text-xs text-slate-300">
            Real-time aggregate data across all 8 classes, 10 official units, certificates, competitions, and alumni.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#ffd014] font-bold text-xs flex items-center gap-2 border border-white/20 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#02167f] font-mono">
            {summary.totalStudents}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Classes 01 - 08</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Graduated Alumni</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {summary.totalAlumni}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Preserved permanent records</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified Certificates</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {summary.totalCertificates}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Issued by SADQ registry</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Points Awarded</span>
            <Trophy className="w-4 h-4 text-[#ffd014]" />
          </div>
          <div className="text-2xl font-black text-[#02167f] font-mono">
            {summary.totalPointsAwarded}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Across all academic programs</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Competitions Held</span>
            <Trophy className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {summary.totalCompetitions}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Central & Sub-Wing programs</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Student Projects</span>
            <FolderGit2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {summary.totalProjects}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Collaborative initiatives</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Publications Released</span>
            <BookOpen className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {summary.totalPublications}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Magazines & periodicals</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Units</span>
            <Layers className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            10
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Official SADQ Wings</span>
        </div>
      </div>

      {/* Class Performance Distribution Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#02167f] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#ffd014]" />
              8 Classes Performance & Talent Output Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comparative analysis of score ledger points, enrolled batch strength, event winners, and certificates earned.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Total Score</th>
                <th className="py-3 px-4">Relative Score Share</th>
                <th className="py-3 px-4">Students Enrolled</th>
                <th className="py-3 px-4">Winners Produced</th>
                <th className="py-3 px-4">Certificates Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classBreakdown.map((c: any) => {
                const percentage = Math.round((c.total_points / maxClassPoints) * 100);
                return (
                  <tr key={c.class_code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-sm text-[#02167f]">
                      Class {c.class_code}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                      {c.total_points} pts
                    </td>
                    <td className="py-3.5 px-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#02167f] to-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono w-8">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {c.student_count} students
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        🏆 {c.winners_count} winners
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        📜 {c.certificates_count} certs
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10 Official Units Activity Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#02167f] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ffd014]" />
            10 Official Organisation Units Activity
          </h3>
          <p className="text-xs text-slate-500">
            Active committee memberships and student-driven projects registered under each official bureau.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {unitBreakdown.map((u: any) => (
            <div
              key={u.code}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#02167f]/30 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs px-2 py-0.5 rounded-md bg-[#02167f] text-[#ffd014]">
                  {u.code}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {u.member_count} members
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                {u.name}
              </h4>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Projects</span>
                <span className="font-bold text-slate-800">{u.projects_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
