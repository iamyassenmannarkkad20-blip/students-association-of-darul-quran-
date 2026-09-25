import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Trophy, ArrowLeft, Award, ExternalLink, Calendar, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { ClassUnionReleasesFeed } from '../../components/ClassUnionReleasesFeed';

interface ClassSummary {
  class_code: string;
  total_points: number;
  sub_wing_points: number;
  main_committee_points: number;
  rank: number;
}

interface LedgerEntry {
  id: string;
  class_code: string;
  source_type: 'SUB_WING_RESULT' | 'MAIN_COMMITTEE_TASK';
  source_id: string;
  points: number;
  description: string;
  created_at: string;
  winner_poster_url?: string;
}

export const ClassDetail: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [history, setHistory] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetail = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<{ summary: ClassSummary; history: LedgerEntry[] }>(
          `/leaderboard/leaderboard/class/${code}`
        );
        if (res.success && res.data) {
          setSummary(res.data.summary);
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.error('Failed to load class detail', err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchClassDetail();
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f]"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Class Not Found</h1>
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <div>
          <Link
            to="/class-leaderboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#02167f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Championship Leaderboard</span>
          </Link>
        </div>

        {/* Hero Banner for Class */}
        <div className="rounded-3xl bg-gradient-to-r from-[#02167f] via-[#0320a6] to-[#010e52] text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd014]/20 border border-[#ffd014]/40 text-[#ffd014] text-xs font-black tracking-wider uppercase">
                <Trophy className="w-3.5 h-3.5" />
                <span>Class Performance Portfolio</span>
              </div>
              <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
                Class {summary.class_code}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm max-w-lg">
                Official score history and performance breakdown recorded from SADQ offline Sub-Wing competitions and Main Committee initiatives.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 self-start md:self-auto">
              <div className="text-center">
                <span className="block text-[10px] font-bold text-white/70 uppercase tracking-widest">
                  Leaderboard Rank
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

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 uppercase">Sub-Wing Points</span>
              <p className="text-2xl font-black text-[#ffd014] mt-1">{summary.sub_wing_points} PTS</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-white/70 uppercase">Main Committee Points</span>
              <p className="text-2xl font-black text-white mt-1">{summary.main_committee_points} PTS</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-white/70 uppercase">Total Verified Events</span>
              <p className="text-2xl font-black text-white mt-1">{history.length}</p>
            </div>
          </div>
        </div>

        {/* Ledger / History Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#02167f]" />
              <h2 className="font-cinzel text-xl font-black text-slate-900">
                Score Contribution History
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {history.length} record{history.length === 1 ? '' : 's'} logged
            </span>
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-cinzel font-bold text-slate-800 text-lg">No Points Logged Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Points will appear here dynamically once Sub-Wing program results or Main Committee task scores are published.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-[#02167f] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          entry.source_type === 'SUB_WING_RESULT'
                            ? 'bg-blue-50 text-[#02167f] border border-blue-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {entry.source_type === 'SUB_WING_RESULT' ? 'Sub-Wing Program' : 'Main Committee Task'}
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
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {entry.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {entry.winner_poster_url && (
                      <button
                        onClick={() => setSelectedPoster(entry.winner_poster_url || null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Winner Poster</span>
                      </button>
                    )}

                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600">
                        +{entry.points}
                      </span>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Class Pts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Official Class Union Releases & Media */}
        <div className="pt-6 border-t border-slate-200">
          <ClassUnionReleasesFeed limit={12} classCode={code} />
        </div>
      </div>

      {/* Winner Poster Modal */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ffd014]" />
                Official Winner Poster
              </span>
              <button
                onClick={() => setSelectedPoster(null)}
                className="text-white/70 hover:text-white text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={selectedPoster}
                alt="Winner Poster"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x800/02167f/ffffff?text=Poster+Preview';
                }}
              />
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
              <a
                href={selectedPoster}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Original Poster</span>
              </a>
              <button
                onClick={() => setSelectedPoster(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
