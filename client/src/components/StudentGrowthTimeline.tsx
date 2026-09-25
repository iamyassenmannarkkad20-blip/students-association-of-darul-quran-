import React, { useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Crown,
  FolderGit2,
  FileText,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Calendar,
  Filter,
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'ENROLLMENT' | 'LEADERSHIP' | 'COMPETITION' | 'CERTIFICATE' | 'PROJECT' | 'ARTICLE' | 'ACHIEVEMENT';
  title: string;
  description?: string;
  date: string;
  badge?: string;
  link?: string;
  points?: number;
}

interface StudentGrowthTimelineProps {
  events: TimelineEvent[];
  studentName?: string;
}

export const StudentGrowthTimeline: React.FC<StudentGrowthTimelineProps> = ({ events, studentName }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'COMPETITION' | 'CERTIFICATE' | 'LEADERSHIP' | 'CREATIONS'>('ALL');

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'COMPETITION') return ev.type === 'COMPETITION';
    if (activeFilter === 'CERTIFICATE') return ev.type === 'CERTIFICATE';
    if (activeFilter === 'LEADERSHIP') return ev.type === 'LEADERSHIP';
    if (activeFilter === 'CREATIONS') return ev.type === 'PROJECT' || ev.type === 'ARTICLE';
    return true;
  });

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'COMPETITION':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'CERTIFICATE':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'LEADERSHIP':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'PROJECT':
        return <FolderGit2 className="w-4 h-4 text-blue-500" />;
      case 'ARTICLE':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'ENROLLMENT':
      default:
        return <GraduationCap className="w-4 h-4 text-gold-500" />;
    }
  };

  const getEventColorClasses = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'COMPETITION':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'CERTIFICATE':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'LEADERSHIP':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'PROJECT':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'ARTICLE':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'ENROLLMENT':
      default:
        return 'bg-navy-50 border-navy-200 text-navy-800';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Digital Growth Chronicle</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Student Growth & Leadership Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified chronological journey of {studentName || 'this student'} at Darul Quran Academy.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('COMPETITION')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeFilter === 'COMPETITION'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Honors ({events.filter((e) => e.type === 'COMPETITION').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('CERTIFICATE')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeFilter === 'CERTIFICATE'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Certs ({events.filter((e) => e.type === 'CERTIFICATE').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('LEADERSHIP')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeFilter === 'LEADERSHIP'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roles ({events.filter((e) => e.type === 'LEADERSHIP').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('CREATIONS')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
              activeFilter === 'CREATIONS'
                ? 'bg-[#02167f] text-[#ffd014] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Creations ({events.filter((e) => e.type === 'PROJECT' || e.type === 'ARTICLE').length})
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No timeline events recorded in this category yet.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#02167f] before:via-gold-400 before:to-slate-200">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline Icon Node */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-[#02167f] shadow flex items-center justify-center -translate-x-1/2 group-hover:scale-110 transition-transform">
                {getEventIcon(ev.type)}
              </div>

              {/* Event Card */}
              <div className="bg-slate-50 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-[#02167f]/40 shadow-xs hover:shadow transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventColorClasses(ev.type)}`}>
                      {ev.type.replace('_', ' ')}
                    </span>
                    {ev.badge && (
                      <span className="text-[10px] font-black text-[#02167f] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                        {ev.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(ev.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  {ev.title}
                </h3>

                {ev.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ev.description}
                  </p>
                )}

                {ev.link && (
                  <div className="pt-2">
                    <a
                      href={ev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] hover:text-[#0320a6] hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Verified Resource</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
