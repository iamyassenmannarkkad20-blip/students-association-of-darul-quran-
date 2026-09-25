import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface AnnouncementItem {
  id: number;
  icon: string;
  badge: string;
  text: string;
  link: string;
  linkText: string;
}

const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    icon: '👑',
    badge: 'LEADERSHIP',
    text: 'SADQ Central Executive Committee 2026–27 Officially Published',
    link: '/about',
    linkText: 'View Committee',
  },
  {
    id: 2,
    icon: '🏆',
    badge: 'CHAMPIONSHIP',
    text: 'Inter-Class Championship: 8 Batch Sangadhanakal Points Live',
    link: '/class-leaderboard',
    linkText: 'Check Standings',
  },
  {
    id: 3,
    icon: '🏛️',
    badge: '10 SUB-WINGS',
    text: 'Official Sub-Wings Active (EB, IA, MPW, MB, LB, RW, CS, DW, LIB, SB)',
    link: '/organisation',
    linkText: 'Explore Units',
  },
  {
    id: 4,
    icon: '📜',
    badge: 'VERIFICATION',
    text: 'Online Student Certificate & Credential Verification Operational',
    link: '/certificates',
    linkText: 'Verify ID',
  },
];

export const AnnouncementStrip: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (dismissed || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [dismissed, isPaused]);

  if (dismissed) return null;

  const current = ANNOUNCEMENTS[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-gradient-to-r from-[#01092e] via-[#02167f] to-[#01092e] text-white border-b border-[#ffd014]/25 text-xs py-1.5 sm:py-2 px-3 sm:px-4 shadow-sm relative w-full select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* Left: Updates Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffd014] text-[#02167f] font-black text-[9px] sm:text-[10px] uppercase tracking-wider shadow">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#02167f]" />
            <span>UPDATES</span>
          </span>
          <span className="hidden md:inline-flex text-[10px] font-bold text-amber-300/80 bg-white/10 px-2 py-0.5 rounded-md">
            {currentIndex + 1}/{ANNOUNCEMENTS.length}
          </span>
        </div>

        {/* Center: Cycling Active Announcement (Never overlaps!) */}
        <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-start overflow-hidden">
          <Link
            to={current.link}
            key={current.id}
            className="group flex items-center gap-2 text-slate-100 hover:text-[#ffd014] transition-all duration-300 min-w-0 truncate"
          >
            <span className="text-sm shrink-0">{current.icon}</span>
            <span className="text-[11px] sm:text-xs font-semibold truncate">
              {current.text}
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-[#ffd014] bg-white/10 px-2 py-0.5 rounded-full group-hover:bg-[#ffd014] group-hover:text-[#02167f] transition-colors shrink-0">
              <span>{current.linkText}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Right: Controls & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrev}
            title="Previous announcement"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            title="Next announcement"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            title="Dismiss announcement strip"
            className="p-1 ml-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
