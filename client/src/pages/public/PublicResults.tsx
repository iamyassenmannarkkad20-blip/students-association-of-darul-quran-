import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Trophy,
  Award,
  Medal,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ResultItem {
  id: string;
  source_id: string;
  student_name: string;
  class_code: string;
  mark: number;
  position: number;
  class_points: number;
  winner_poster_url?: string;
  published_at: string;
  event_title: string;
  event_desc: string;
  event_date: string;
  event_type: 'SUB_WING_PROGRAM' | 'MAIN_COMMITTEE_TASK';
  entity_name: string;
  entity_code: string;
}

export const PublicResults: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'SUB_WING_PROGRAM' | 'MAIN_COMMITTEE_TASK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const typeParam = filterType !== 'ALL' ? `?type=${filterType}` : '';
      const res = await apiRequest<ResultItem[]>(`/leaderboard/results${typeParam}`);
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filterType]);

  const filteredResults = results.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.event_title.toLowerCase().includes(q) ||
      item.student_name.toLowerCase().includes(q) ||
      item.entity_name.toLowerCase().includes(q) ||
      `class ${item.class_code}`.includes(q)
    );
  });

  const getPositionBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
          <Medal className="w-3.5 h-3.5 text-amber-600" />
          1st Place
        </span>
      );
    }
    if (pos === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-500" />
          2nd Place
        </span>
      );
    }
    if (pos === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-900/10 text-amber-900 border border-amber-800/30">
          <Medal className="w-3.5 h-3.5 text-amber-800" />
          3rd Place
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
        Participant
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-widest shadow-md">
          <Trophy className="w-4 h-4 text-[#ffd014]" />
          <span>Official SADQ Published Catalog</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#02167f] tracking-tight">
          Competition & Task Results
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Browse verified results from offline Sub-Wing competitions and Main Committee tasks, complete with student honors and class score increments.
        </p>

        <div className="pt-2 flex justify-center">
          <Link
            to="/class-leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <span>View Class Championship Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === 'ALL'
                  ? 'bg-white text-[#02167f] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setFilterType('SUB_WING_PROGRAM')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === 'SUB_WING_PROGRAM'
                  ? 'bg-white text-[#02167f] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sub-Wing Programs
            </button>
            <button
              onClick={() => setFilterType('MAIN_COMMITTEE_TASK')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === 'MAIN_COMMITTEE_TASK'
                  ? 'bg-white text-[#02167f] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Main Committee Tasks
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by event, student, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#02167f]/20 focus:border-[#02167f]"
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f]"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-slate-800">
              No Published Results Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Results will appear here immediately once Sub-Wing leaders or Admin verify and publish scores.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-[#02167f] transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.event_type === 'SUB_WING_PROGRAM'
                          ? 'bg-blue-50 text-[#02167f] border border-blue-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {item.entity_name}
                    </span>
                    <Link
                      to={`/class/${item.class_code}`}
                      className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-white hover:bg-[#02167f] transition-colors"
                    >
                      Class {item.class_code}
                    </Link>
                  </div>

                  {/* Title & Event date */}
                  <div>
                    <h3 className="font-cinzel font-black text-slate-900 text-lg line-clamp-2">
                      {item.event_title}
                    </h3>
                    {item.event_desc && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.event_desc}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.event_date || item.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Winner / Student Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Participant / Class
                      </span>
                      {getPositionBadge(item.position)}
                    </div>
                    <div className="font-bold text-slate-900 text-base">
                      {item.student_name}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">
                        Score: <strong className="text-slate-800">{item.mark} pts</strong>
                      </span>
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +{item.class_points} Class Pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with poster button */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  {item.winner_poster_url ? (
                    <button
                      onClick={() => setSelectedPoster(item.winner_poster_url || null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Winner Poster</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No poster attached</span>
                  )}

                  <Link
                    to={`/class/${item.class_code}`}
                    className="text-xs font-bold text-[#02167f] hover:underline flex items-center gap-1"
                  >
                    <span>Class {item.class_code}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
