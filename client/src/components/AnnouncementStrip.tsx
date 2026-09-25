import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Award, X, ChevronRight } from 'lucide-react';

export const AnnouncementStrip: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#01092e] via-[#02167f] to-[#01092e] text-white border-b border-gold-400/30 text-xs py-2 px-4 shadow-sm relative overflow-hidden group">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-400 text-navy-950 font-black text-[10px] uppercase tracking-wider shadow">
            <Sparkles className="w-3 h-3 text-navy-950" />
            <span>UPDATES</span>
          </span>
        </div>

        {/* Scrolling Ticker Text */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-6 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] text-[11px] sm:text-xs">
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-gold-300 transition-colors"
            >
              <span>👑 SADQ Central Executive Committee 2026–27 Officially Published</span>
              <ChevronRight className="w-3 h-3 text-gold-400" />
            </Link>

            <span className="text-gold-400/60">•</span>

            <Link
              to="/class-leaderboard"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-gold-300 transition-colors"
            >
              <span>🏆 Inter-Class Championship: 8 Batch Sangadhanakal Points Live</span>
              <ChevronRight className="w-3 h-3 text-gold-400" />
            </Link>

            <span className="text-gold-400/60">•</span>

            <Link
              to="/organisation"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-gold-300 transition-colors"
            >
              <span>🏛️ 10 Official Sub-Wings Active (EB, IA, MPW, MB, LB, RW, CS, DW, LIB, SB)</span>
              <ChevronRight className="w-3 h-3 text-gold-400" />
            </Link>

            <span className="text-gold-400/60">•</span>

            <Link
              to="/certificates"
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-gold-300 transition-colors"
            >
              <span>📜 Online Certificate Verification System Operational</span>
              <ChevronRight className="w-3 h-3 text-gold-400" />
            </Link>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          title="Dismiss banner"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
