import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { Trophy, Medal, Award, ExternalLink, Calendar, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

interface ProgramResult {
  id: string;
  student_name: string;
  class_code: string;
  mark: number;
  position: number;
  class_points: number;
  winner_poster_url?: string;
  published_at: string;
  program_title: string;
  program_desc: string;
  program_date: string;
  sub_wing_name: string;
  sub_wing_code: string;
}

interface ClassSummary {
  class_code: string;
  total_points: number;
  sub_wing_points: number;
  main_committee_points: number;
  rank: number;
}

interface MyResultsData {
  results: ProgramResult[];
  classCode: string | null;
  classSummary: ClassSummary | null;
  recentContributions: any[];
}

export const StudentResults: React.FC = () => {
  const [data, setData] = useState<MyResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyResults = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<MyResultsData>('/students/my-results');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load my results', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f]"></div>
      </div>
    );
  }

  const results = data?.results || [];
  const classSummary = data?.classSummary;
  const firsts = results.filter((r) => r.position === 1).length;
  const seconds = results.filter((r) => r.position === 2).length;
  const thirds = results.filter((r) => r.position === 3).length;
  const totalPointsContributed = results.reduce((sum, r) => sum + (r.class_points || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#02167f] text-[#ffd014] text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
              <span>Student Honors & Class Points</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-[#02167f]">
              My Competition Honors
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Verified record of your Sub-Wing offline competition results and points contributed to your class.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/class-leaderboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#02167f] hover:bg-slate-50 shadow-sm transition-all"
            >
              <span>Championship Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Rank Card */}
          <div className="bg-gradient-to-br from-[#02167f] to-[#010f54] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1">
                My Class Standing
              </span>
              <div className="text-2xl font-black text-white">
                Class {data?.classCode || '—'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/70 uppercase">Leaderboard Rank</span>
                <p className="text-xl font-black text-[#ffd014]">
                  {classSummary ? `#${classSummary.rank}` : '—'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 uppercase">Total Score</span>
                <p className="text-xl font-black text-white">
                  {classSummary ? `${classSummary.total_points} pts` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Points Contributed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                My Contribution
              </span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-emerald-600">
                +{totalPointsContributed}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">Class Pts</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Directly boosted Class {data?.classCode || ''} in the standings
            </p>
          </div>

          {/* Medals Count */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Podium Finishes
            </span>
            <div className="my-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="text-lg font-black text-slate-800">{firsts}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                <span className="text-lg font-black text-slate-800">{seconds}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-700 inline-block" />
                <span className="text-lg font-black text-slate-800">{thirds}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Gold (1st), Silver (2nd), and Bronze (3rd) wins
            </p>
          </div>

          {/* Programs Completed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Programs Participated
            </span>
            <div className="my-2">
              <span className="text-3xl font-black text-[#02167f]">
                {results.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">events</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Logged & published by Sub-Wing leadership
            </p>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#02167f]" />
              <span>Participated Programs & Points</span>
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-cinzel text-lg font-bold text-slate-800">No Competition Records Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Once Sub-Wing Chairman or Convener enter your score for offline competitions, your honors and class points will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#02167f] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#02167f] border border-blue-200">
                        {res.sub_wing_name}
                      </span>
                      {res.position === 1 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Medal className="w-3 h-3 text-amber-600" />
                          1st Place Winner
                        </span>
                      )}
                      {res.position === 2 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                          <Medal className="w-3 h-3 text-slate-500" />
                          2nd Place Winner
                        </span>
                      )}
                      {res.position === 3 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-900/10 text-amber-900 border border-amber-800/30 flex items-center gap-1">
                          <Medal className="w-3 h-3 text-amber-800" />
                          3rd Place Winner
                        </span>
                      )}
                    </div>

                    <h3 className="font-cinzel font-bold text-slate-900 text-base">
                      {res.program_title}
                    </h3>
                    {res.program_desc && (
                      <p className="text-xs text-slate-500 line-clamp-1">{res.program_desc}</p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(res.program_date || res.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {res.winner_poster_url && (
                      <button
                        onClick={() => setSelectedPoster(res.winner_poster_url || null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Winner Poster</span>
                      </button>
                    )}

                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        Mark: <strong className="text-slate-800">{res.mark} pts</strong>
                      </div>
                      <div className="text-lg font-black text-emerald-600">
                        +{res.class_points}{' '}
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          Class Pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Poster Modal */}
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
