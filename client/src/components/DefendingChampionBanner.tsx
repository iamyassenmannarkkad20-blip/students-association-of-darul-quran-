import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { Trophy, Award, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DefendingChampionData {
  id: string;
  name: string;
  best_class_code: string;
  best_class_points: number;
  best_class_task_count: number;
  closed_at: string;
  union_name?: string;
  union_motto?: string;
  union_logo_url?: string;
  chairman_name?: string;
  convener_name?: string;
}

interface ActiveCycleData {
  id: string;
  name: string;
  start_date: string;
  target_leave_date?: string;
}

export const DefendingChampionBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [champion, setChampion] = useState<DefendingChampionData | null>(null);
  const [activeCycle, setActiveCycle] = useState<ActiveCycleData | null>(null);
  const [leadingClass, setLeadingClass] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [champRes, activeRes] = await Promise.all([
          apiRequest('/cycles/defending-champion'),
          apiRequest('/cycles/active'),
        ]);

        if (isMounted) {
          if (champRes.success && champRes.data) {
            setChampion(champRes.data);
          }
          if (activeRes.success && activeRes.data) {
            setActiveCycle(activeRes.data.cycle);
            setLeadingClass(activeRes.data.current_leader);
          }
        }
      } catch (err) {
        console.error('Error fetching defending champion / cycle data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return null;
  if (!champion && !activeCycle) return null;

  return (
    <div className="w-full mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#021359] via-[#02167f] to-[#0424a8] text-white p-6 md:p-8 shadow-xl border border-amber-400/30">
        {/* Decorative Golden Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Defending Champion Showcase */}
          <div className="flex items-center gap-5 w-full lg:w-auto">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#02167f] flex flex-col items-center justify-center text-center p-1">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-400 animate-bounce" />
                  <span className="text-[10px] md:text-xs font-black uppercase text-amber-300 tracking-wider">CHAMPION</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                ★ 1ST
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Defending Best Class of the Month
                </span>
                {champion?.name && (
                  <span className="text-xs text-blue-200">
                    Won in: <strong className="text-white">{champion.name}</strong>
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <span>Class {champion ? champion.best_class_code : '08'}</span>
                <span className="text-amber-400 font-bold text-lg md:text-xl">
                  — {champion?.union_name || `Class ${champion?.best_class_code || '08'} Sangadhana`}
                </span>
              </h2>

              <p className="text-xs md:text-sm text-blue-100/90 italic mt-0.5">
                "{champion?.union_motto || 'Distinction, Solidarity and Academic Nobility'}"
              </p>

              {champion && (
                <div className="flex items-center gap-3 mt-2 text-xs text-blue-200">
                  <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
                    🏆 {champion.best_class_points} Championship Points
                  </span>
                  {champion.chairman_name && (
                    <span>Chairman: <strong className="text-white">{champion.chairman_name}</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Cycle Status Card */}
          {activeCycle && (
            <div className="w-full lg:w-auto flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Current Running Cycle</span>
                </div>
                <div className="text-base font-extrabold text-white mt-1">
                  {activeCycle.name}
                </div>
                <div className="text-xs text-blue-200 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-300" />
                  <span>Started: {new Date(activeCycle.start_date).toLocaleDateString()}</span>
                  {activeCycle.target_leave_date && (
                    <span>• Leave Date: {new Date(activeCycle.target_leave_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {leadingClass && (
                <div className="flex items-center justify-between gap-3 pt-2 sm:pt-0 lg:pt-2 border-t sm:border-t-0 lg:border-t border-white/15">
                  <div className="text-xs">
                    <span className="text-blue-200">Current Leader: </span>
                    <strong className="text-amber-300">Class {leadingClass.class_code}</strong> ({leadingClass.total_points} pts)
                  </div>
                  <Link
                    to="/leaderboard"
                    className="inline-flex items-center gap-1 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1.5 rounded-lg shadow transition-colors"
                  >
                    Leaderboard
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
