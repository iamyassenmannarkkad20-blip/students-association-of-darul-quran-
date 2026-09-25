import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { ShieldCheck, Users, Sparkles, Award, Trophy, Table, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WingAnalytics {
  id: string;
  code: string;
  name: string;
  description: string;
  chairman_name: string | null;
  convener_name: string | null;
  programs_count: number;
  participants_count: number;
  certificates_count: number;
  total_points_distributed: number;
}

interface AnalyticsData {
  wings: WingAnalytics[];
  classes: string[];
  matrix: Record<string, Record<string, number>>;
  totals: {
    total_programs: number;
    total_participants: number;
    total_certificates: number;
    total_points_distributed: number;
  };
}

export const Organisation: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMatrix, setShowMatrix] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiRequest<AnalyticsData>('/subwings/analytics');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load subwing analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#ffd014]" />
          <span>Official Institutional Structure</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-navy-950">
          10 Official Sub-Wings
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          The SADQ executive framework comprises strictly ten official operational wings. Each unit
          fosters specialized student leadership, offline competitions, and collaborative excellence.
        </p>
      </div>

      {/* Aggregate Platform Totals */}
      {data && data.totals && (
        <div className="bg-gradient-to-r from-[#02167f] via-[#0320a6] to-[#010e52] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#ffd014]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase text-[#ffd014] tracking-widest block">
                Activity Intelligence & Impact
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
                Sub-Wing Overall Performance Overview
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all self-start sm:self-auto"
            >
              <Table className="w-3.5 h-3.5 text-gold-400" />
              <span>{showMatrix ? 'Hide Class Matrix' : 'View Sub-Wing vs Class Matrix'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-white block">{data.totals.total_programs}</span>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Programs Conducted</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-white block">{data.totals.total_participants}</span>
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Student Competitors</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-white block">{data.totals.total_certificates}</span>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Certificates Awarded</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-[#ffd014] block">
                {data.totals.total_points_distributed} <span className="text-xs">PTS</span>
              </span>
              <span className="text-[11px] font-bold text-[#ffd014] uppercase tracking-wider">Points Distributed</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Wing vs Class Relationship Matrix */}
      {showMatrix && data && data.matrix && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
                <span>Relationship Matrix</span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                Sub-Wing vs Class Score Distribution Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Cross-tabulation showing how many points each class (01 to 08) won in programs organized by each Sub-Wing.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 rounded-l-xl">Sub-Wing Unit</th>
                  {data.classes.map((cls) => (
                    <th key={cls} className="py-3 px-3 text-center">
                      <Link to={`/class/${cls}`} className="hover:text-[#02167f] hover:underline">
                        Class {cls}
                      </Link>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right rounded-r-xl">Total Distributed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.wings.map((w) => {
                  const wingRow = data.matrix[w.code] || {};
                  return (
                    <tr key={w.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[11px] text-[#02167f] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                            {w.code}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[180px]">{w.name}</span>
                        </div>
                      </td>
                      {data.classes.map((cls) => {
                        const pts = wingRow[cls] || 0;
                        return (
                          <td key={cls} className="py-3 px-3 text-center">
                            {pts > 0 ? (
                              <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block min-w-[32px]">
                                +{pts}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-right font-black text-[#02167f]">
                        {w.total_points_distributed} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10 Sub-Wings Detail Cards */}
      <div className="space-y-4">
        <h2 className="font-cinzel text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-500" />
          <span>Operational Units Directory</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.wings.map((unit) => (
            <div
              key={unit.code}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#02167f]/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-lg font-black text-[#02167f] px-3 py-1 bg-navy-50 border border-navy-200 rounded-xl">
                    {unit.code}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    Official Wing
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{unit.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                {/* Appointed Leaders */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                  {unit.chairman_name && (
                    <span className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg font-semibold">
                      Chairman: <strong>{unit.chairman_name}</strong>
                    </span>
                  )}
                  {unit.convener_name && (
                    <span className="text-[11px] text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg font-semibold">
                      Convener: <strong>{unit.convener_name}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Wing Activity Metrics */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-sm font-black text-slate-800 block">{unit.programs_count}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Programs</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-sm font-black text-slate-800 block">{unit.participants_count}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Scholars</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-sm font-black text-emerald-700 block">+{unit.total_points_distributed}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Pts Awarded</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
