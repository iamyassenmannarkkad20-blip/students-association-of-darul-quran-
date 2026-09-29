import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Trophy,
  Shield,
  Sparkles,
  Users,
  BookOpen,
  FileText,
  Video,
  Award,
  Calendar,
  CheckCircle,
  Briefcase,
  Layers,
  MessageSquare,
  GraduationCap,
  ChevronRight,
  ExternalLink,
  Crown,
} from 'lucide-react';

interface SideNavHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const OFFICIAL_WINGS = [
  { code: 'EB', name: 'Education Board', color: 'from-blue-600 to-indigo-700' },
  { code: 'IA', name: 'Islamic Affairs', color: 'from-emerald-600 to-teal-700' },
  { code: 'MPW', name: 'Moral & Personality', color: 'from-amber-600 to-yellow-700' },
  { code: 'MB', name: 'Media Board', color: 'from-rose-600 to-red-700' },
  { code: 'LB', name: 'Literary Board', color: 'from-purple-600 to-violet-700' },
  { code: 'RW', name: 'Research Wing', color: 'from-cyan-600 to-blue-700' },
  { code: 'CS', name: 'Cultural Society', color: 'from-orange-600 to-amber-700' },
  { code: 'DW', name: "Da'wa Wing", color: 'from-green-600 to-emerald-700' },
  { code: 'LIB', name: 'Central Library', color: 'from-indigo-600 to-blue-800' },
  { code: 'SB', name: 'Sports Board', color: 'from-red-600 to-rose-700' },
];

export const SideNavHub: React.FC<SideNavHubProps> = ({ isOpen, onClose }) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#01092e] text-white shadow-2xl border-l border-[#ffd014]/30 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#02167f] to-[#01092e]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ffd014] via-amber-200 to-[#ffd014] p-0.5 shadow-md">
                <div className="w-full h-full rounded-2xl bg-[#02167f] flex items-center justify-center font-cinzel font-black text-[#ffd014]">
                  S
                </div>
              </div>
              <div>
                <h2 className="font-cinzel font-black text-base sm:text-lg text-white leading-tight">
                  SADQ Campus Hub
                </h2>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  Directory, Sub-Wings & Academics
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs no-scrollbar scroll-touch">
            {/* 1. Academic & Championship */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase tracking-wider text-[10px]">
                <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
                <span>Class Championship & Batches</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/class-leaderboard"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#ffd014] flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors">
                        Live Class Leaderboard
                      </div>
                      <span className="text-[11px] text-slate-400">
                        8 Batch Sangadhanakal dynamic scores
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>

                <Link
                  to="/class-unions"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors">
                        8 Class Sangadhanakal
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Class 01 through 08 official unions
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>

                <Link
                  to="/results"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors">
                        Program Results & Trophies
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Offline competition marks & awards
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>
              </div>
            </div>

            {/* 2. 10 Official Sub-Wings (Quick Grid) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>10 Official Sub-Wings</span>
                </div>
                <Link
                  to="/organisation"
                  onClick={onClose}
                  className="text-[10px] text-[#ffd014] hover:underline font-bold"
                >
                  View All Units →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {OFFICIAL_WINGS.map((wing) => (
                  <Link
                    key={wing.code}
                    to="/organisation"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold-400/40 transition-all group flex items-center gap-2"
                  >
                    <span className="font-cinzel font-black text-xs text-[#ffd014] px-1.5 py-0.5 rounded bg-white/10">
                      {wing.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 group-hover:text-white truncate">
                      {wing.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Student Growth & Star Achievers */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Student Growth & Achievers</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/students"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-400/20 to-white/5 hover:from-[#ffd014]/30 hover:to-white/10 border border-[#ffd014]/40 transition-all hover:border-[#ffd014] group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ffd014] text-[#02167f] flex items-center justify-center font-black">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors flex items-center gap-1.5">
                        <span>Students Directory (Class 01–08)</span>
                        <span className="text-[9px] bg-[#ffd014] text-[#02167f] font-black px-1.5 rounded">ALL</span>
                      </div>
                      <span className="text-[11px] text-amber-200/90 font-medium">
                        Explore all student 360° dashboards & scores
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#ffd014] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/explore"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#ffd014]/20 text-[#ffd014] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors flex items-center gap-1.5">
                        <span>Peer Talents & Connect</span>
                        <span className="text-[9px] bg-[#ffd014] text-[#02167f] font-black px-1.5 rounded">NEW</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Student profiles, skills & direct WhatsApp
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>

                <Link
                  to="/alumni"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors">
                        Alumni Scholars
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Distinguished graduates directory
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>

                <Link
                  to="/certificates"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-[#ffd014]/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm group-hover:text-[#ffd014] transition-colors">
                        Certificate Verification
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Authenticate official student credentials
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#ffd014]" />
                </Link>
              </div>
            </div>

            {/* 4. Media, Library & Discourse */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold uppercase tracking-wider text-[10px]">
                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                <span>Media, Library & Discourse</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/library"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">Digital Library</div>
                  <span className="text-[10px] text-slate-400">Islamic texts & catalogs</span>
                </Link>

                <Link
                  to="/magazines"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <FileText className="w-4 h-4 text-rose-400 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">Magazines</div>
                  <span className="text-[10px] text-slate-400">Official periodicals</span>
                </Link>

                <Link
                  to="/media"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <Video className="w-4 h-4 text-red-500 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">YouTube Spotlight</div>
                  <span className="text-[10px] text-slate-400">Official live streams</span>
                </Link>

                <Link
                  to="/community"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">Community Feed</div>
                  <span className="text-[10px] text-slate-400">Student discourse & notes</span>
                </Link>
              </div>
            </div>

            {/* 5. Opportunities & Services */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-gold-300 font-bold uppercase tracking-wider text-[10px]">
                <Briefcase className="w-3.5 h-3.5 text-gold-400" />
                <span>Opportunities & Marketplace</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/opportunities"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <Briefcase className="w-4 h-4 text-amber-400 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">Opportunities</div>
                  <span className="text-[10px] text-slate-400">Projects & internships</span>
                </Link>

                <Link
                  to="/services"
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 group"
                >
                  <Layers className="w-4 h-4 text-blue-400 mb-1" />
                  <div className="font-bold text-white group-hover:text-[#ffd014]">Services</div>
                  <span className="text-[10px] text-slate-400">Creative offerings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <Link to="/about" onClick={onClose} className="hover:text-white flex items-center gap-1">
              <span>About SADQ Leadership</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <span className="text-amber-300/80 font-mono">v2.4 Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
