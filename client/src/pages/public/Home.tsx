import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Play,
  Briefcase,
  Users,
  Compass,
  FileText,
  ShieldCheck,
  Video,
  Megaphone,
  Award,
  Crown,
  User as UserIcon,
  Trophy,
  Medal,
  X,
} from 'lucide-react';
import { extractYouTubeId } from '../admin/AdminMedia';

interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  photo_url: string;
  order_index: number;
  bio?: string;
}

interface Unit {
  code: string;
  name: string;
  description: string;
}

interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  category: string;
}

export const Home: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [homePulse, setHomePulse] = useState<any | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<MediaItem | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper to extract YouTube video ID from any YouTube URL (shorts, live, watch)
  const getYouTubeEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [uRes, mRes, medRes, confRes, comRes, lbRes, pulseRes] = await Promise.all([
          apiRequest<Unit[]>('/public/units'),
          apiRequest<any[]>('/public/magazines'),
          apiRequest<MediaItem[]>('/public/media'),
          apiRequest<any>('/public/config'),
          apiRequest<CommitteeMember[]>('/public/committee'),
          apiRequest<any[]>('/leaderboard/leaderboard'),
          apiRequest<any>('/public/home-pulse'),
        ]);
        if (uRes.success && uRes.data) setUnits(uRes.data);
        if (mRes.success && mRes.data) setMagazines(mRes.data);
        if (medRes.success && medRes.data) setMediaList(medRes.data);
        if (confRes.success && confRes.data?.announcement) setAnnouncement(confRes.data.announcement);
        if (comRes.success && comRes.data) setCommittee(comRes.data);
        if (lbRes.success && lbRes.data) setLeaderboard(lbRes.data);
        if (pulseRes.success && pulseRes.data) setHomePulse(pulseRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const journeySteps = [
    { title: 'Student', desc: 'Active identity' },
    { title: 'Profile', desc: 'Digital footprint' },
    { title: 'Talents', desc: 'Natural gifts' },
    { title: 'Skills', desc: 'Craft & proficiency' },
    { title: 'Achievements', desc: 'Verified milestones' },
    { title: 'Projects', desc: 'Initiatives & impact' },
    { title: 'Leadership', desc: 'Unit involvement' },
    { title: 'Portfolio', desc: 'Growth showcase' },
    { title: 'Opportunities', desc: 'Professional future' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Modern Luxury Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#4B1718] via-[#7A211F] to-[#4B1718] text-white pt-20 pb-32 px-4 sm:px-6 lg:px-8 border-b border-[#D6A64F]/25 shadow-2xl">
        {/* Ambient Radial Golden Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#D6A64F]/15 via-[#7A211F]/30 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-[#D6A64F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-96 h-96 bg-[#7A211F]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Live Official Announcement Banner (Rendered ONLY if admin posts a real message) */}
          {Boolean(announcement && announcement.trim().length > 0) && (
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#D6A64F]/15 border border-[#D6A64F]/60 text-amber-200 text-xs sm:text-sm font-bold shadow-xl shadow-black/40 animate-fade-in max-w-3xl mx-auto backdrop-blur-md">
              <Megaphone className="w-4 h-4 text-[#D6A64F] shrink-0 animate-bounce" />
              <span>{announcement}</span>
            </div>
          )}

          {/* Official SADQ logo asset */}
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <div className="relative group">
              <div className="absolute -inset-5 rounded-full bg-[#D6A64F]/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative rounded-full bg-white/95 p-3 sm:p-4 shadow-2xl ring-1 ring-[#D6A64F]/50">
                <img
                  src="/sadq_logo.png"
                  alt="SADQ official logo"
                  className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-contain"
                  width="160"
                  height="160"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>

          {/* Sub-badge: Beyond The Curriculum */}
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6A64F]/15 border border-[#D6A64F]/40 text-[#D6A64F] text-xs font-black tracking-widest uppercase shadow-md backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A64F]" />
              <span>Beyond The Curriculum</span>
            </div>

          {/* Main Heading: Full Official Name */}
          <div className="space-y-4">
            <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              STUDENTS ASSOCIATION OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D6A64F] to-amber-300 drop-shadow-md">
                DARUL QURAN ISLAMIC ACADEMY
              </span>
            </h1>

            {/* Meaningful Motivation */}
            <div className="max-w-2xl mx-auto space-y-2 pt-1">
              <p className="text-sm sm:text-lg text-amber-100/90 font-medium leading-relaxed">
                Fostering Creative Talents, Leadership, and Holistic Growth in Islamic Education.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-light">
                Creativity, Student Growth, Leadership — Knowledge in Action.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl font-black text-[#7A211F] bg-gradient-to-r from-[#D6A64F] via-amber-300 to-[#D6A64F] hover:from-amber-200 hover:to-[#D6A64F] shadow-xl shadow-[#D6A64F]/30 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base flex items-center gap-2 group"
            >
              <span>Build Student Portfolio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to="/organisation"
              className="px-7 py-4 rounded-2xl font-bold text-white bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:border-[#D6A64F]/50 backdrop-blur-md transition-all text-sm sm:text-base"
            >
              Explore 10 Official Units
            </Link>
          </div>

          {/* Quick Feature Chips */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
            <Link
              to="/organisation"
              className="px-4 py-2 rounded-xl bg-[#4B1718]/80 border border-[#D6A64F]/30 text-amber-200 hover:bg-[#D6A64F]/20 hover:border-[#D6A64F] transition-all shadow-md font-semibold flex items-center gap-1.5"
            >
              <span>🏛️ 10 Wings</span>
            </Link>
            <Link
              to="/library"
              className="px-4 py-2 rounded-xl bg-[#4B1718]/80 border border-[#D6A64F]/30 text-amber-200 hover:bg-[#D6A64F]/20 hover:border-[#D6A64F] transition-all shadow-md font-semibold flex items-center gap-1.5"
            >
              <span>📖 Digital Library</span>
            </Link>
            <Link
              to="/explore"
              className="px-4 py-2 rounded-xl bg-[#4B1718]/80 border border-[#D6A64F]/30 text-amber-200 hover:bg-[#D6A64F]/20 hover:border-[#D6A64F] transition-all shadow-md font-semibold flex items-center gap-1.5"
            >
              <span>🏆 Portfolios & Talents</span>
            </Link>
            <Link
              to="/media"
              className="px-4 py-2 rounded-xl bg-[#4B1718]/80 border border-[#D6A64F]/30 text-amber-200 hover:bg-[#D6A64F]/20 hover:border-[#D6A64F] transition-all shadow-md font-semibold flex items-center gap-1.5"
            >
              <span>🎥 Live Broadcasts</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Campus Pulse & Defending Champion Section */}
      {homePulse && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-6 relative z-20 space-y-4">
          {/* Active Cycle Bar */}
          {homePulse.active_cycle && (
            <div className="bg-gradient-to-r from-[#7A211F] via-[#8E2D27] to-[#641B1C] rounded-2xl p-4 sm:p-5 text-white shadow-xl border border-[#D6A64F]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#D6A64F] bg-[#D6A64F]/20 border border-[#D6A64F]/40 px-2 py-0.5 rounded">
                      Active Leave Cycle
                    </span>
                    <span className="text-xs text-blue-200">
                      Since {new Date(homePulse.active_cycle.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base truncate mt-0.5">
                    {homePulse.active_cycle.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/class-leaderboard"
                  className="px-4 py-2 rounded-xl bg-[#D6A64F] hover:bg-amber-300 text-[#7A211F] text-xs font-black transition-all shadow-md active:scale-95"
                >
                  View Live Cycle Standings →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Pulse Cards: Defending Champion, Latest Result, and Featured Achiever */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Defending Champion Golden Trophy Card */}
            {homePulse.defending_champion ? (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300/80 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                    Defending Champion
                  </span>
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-amber-950 text-base">
                    {homePulse.defending_champion.union_name || `Class ${homePulse.defending_champion.best_class_code}`}
                  </h4>
                  <p className="text-xs text-amber-800">
                    Won Best Class Trophy with {homePulse.defending_champion.best_class_points} PTS
                  </p>
                </div>
                <Link
                  to={`/class/${homePulse.defending_champion.best_class_code}`}
                  className="inline-block text-xs font-bold text-amber-900 hover:underline pt-1"
                >
                  View Champion Class 360° →
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#7A211F] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                    Cycle Standings
                  </span>
                  <Trophy className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-slate-900 text-sm">
                    Inaugural Leave Cycle Active
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Best Class Trophy will be awarded at next campus leave.
                  </p>
                </div>
                <Link to="/class-leaderboard" className="text-xs font-bold text-[#7A211F] hover:underline pt-1">
                  View Live Ranks →
                </Link>
              </div>
            )}

            {/* Latest Competition Result Ticker */}
            {homePulse.latest_results && homePulse.latest_results.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Latest Victory
                  </span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {homePulse.latest_results[0].student_name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {homePulse.latest_results[0].position === 1 ? '🥇 1st Place' : 'Winner'} • {homePulse.latest_results[0].event_title}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-black text-emerald-700">
                    +{homePulse.latest_results[0].class_points} PTS for Class {homePulse.latest_results[0].class_code}
                  </span>
                  <Link to="/results" className="text-xs font-bold text-[#7A211F] hover:underline">
                    All Results →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Competition Central
                  </span>
                  <Award className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Official published competition results and verified certificates.
                </p>
                <Link to="/results" className="text-xs font-bold text-[#7A211F] hover:underline">
                  Browse Results Portal →
                </Link>
              </div>
            )}

            {/* Featured Star Achiever */}
            {homePulse.featured_star ? (
              <div className="bg-gradient-to-br from-navy-50/60 to-white border border-navy-100 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-[#7A211F] bg-white px-2 py-0.5 rounded border border-navy-200">
                    Top Star Contributor
                  </span>
                  <Crown className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {homePulse.featured_star.full_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class {homePulse.featured_star.class_code} • {homePulse.featured_star.total_points} Points Contributed
                  </p>
                </div>
                <Link
                  to={`/portfolio/${homePulse.featured_star.profile_slug}`}
                  className="text-xs font-bold text-[#7A211F] hover:underline pt-1"
                >
                  View 360° Profile →
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Talent Discovery
                  </span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                  Discover peer talents and skills across Classes 01 through 08.
                </p>
                <Link to="/explore" className="text-xs font-bold text-[#7A211F] hover:underline">
                  Explore Peer Directory →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Live Class Championship Podium Spotlight */}
      {leaderboard.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-2xl shadow-[#7A211F]/10 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm animate-float">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg sm:text-xl font-black text-[#7A211F]">
                    Live Class Championship Standing
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time podium points calculated from offline Sub-Wing competitions and Main Committee tasks.
                  </p>
                </div>
              </div>

              <Link
                to="/class-leaderboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7A211F] text-[#D6A64F] text-xs font-bold hover:bg-[#641B1C] shadow-md transition-all self-start sm:self-auto shrink-0"
              >
                <span>Full Leaderboard (All 8 Classes)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((item, idx) => (
                <Link
                  key={item.class_code}
                  to={`/class/${item.class_code}`}
                  className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] flex items-center justify-between ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-md'
                      : idx === 1
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-900/5 border-amber-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-cinzel font-black text-lg ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-md animate-bounce'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : 'bg-amber-800/20 text-amber-900'
                      }`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                        Rank #{item.rank || idx + 1}
                      </span>
                      <h4 className="font-cinzel text-base font-black text-slate-900">
                        Class {item.class_code}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-[#7A211F]">
                      {item.total_points}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Points
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SADQ Apex Executive Committee Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7A211F] text-[#D6A64F] text-xs font-bold tracking-widest uppercase mb-3 shadow-lg shadow-[#7A211F]/15 border border-[#D6A64F]/40">
            <Crown className="w-4 h-4 text-[#D6A64F]" />
            <span>SADQ Executive Committee</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#7A211F] tracking-tight">
            Central Executive Committee
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 font-medium">
            Students Association of Darul Quran (SADQ) apex leadership driving academic excellence, spiritual vitality, and student empowerment.
          </p>
          <div className="mt-3 w-16 h-1 bg-gradient-to-r from-transparent via-[#D6A64F] to-transparent mx-auto rounded-full" />
        </div>

        {/* Top 3 Apex Officers: President, Secretary, Treasurer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {committee.slice(0, 3).map((leader) => (
            <div
              key={leader.id}
              className="relative rounded-3xl bg-gradient-to-br from-[#7A211F] via-[#031d96] to-[#641B1C] text-white p-6 sm:p-8 border-2 border-[#D6A64F] shadow-2xl shadow-[#7A211F]/25 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
            >
              {/* Golden Crown badge on top card */}
              <div className="absolute -top-3.5 px-3.5 py-0.5 rounded-full bg-[#D6A64F] text-[#7A211F] text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1 border border-white/40">
                <Award className="w-3 h-3" />
                <span>Apex Officer</span>
              </div>

              {/* Photo Frame: Blank minimal frame when no photo uploaded */}
              <div className="relative mt-2 mb-5">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#D6A64F] via-amber-200 to-[#D6A64F] shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#4B1718] border-2 border-[#7A211F] flex items-center justify-center">
                    {leader.photo_url ? (
                      <img
                        src={leader.photo_url}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      /* Clean blank minimalist frame until admin adds photo */
                      <div className="w-full h-full bg-[#4B1718] flex items-center justify-center" />
                    )}
                  </div>
                </div>
              </div>

              {/* Designation Badge */}
              <span className="inline-block px-4 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#D6A64F] text-[#7A211F] shadow-sm mb-2">
                {leader.designation}
              </span>

              {/* Leader Full Name */}
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide">
                {leader.name}
              </h3>

              {/* Bio / Description */}
              {leader.bio && (
                <p className="text-xs text-blue-100/80 mt-2 line-clamp-2 leading-relaxed">
                  {leader.bio}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Next Officers: Vice Presidents & Joint Secretaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {committee.slice(3).map((leader) => (
            <div
              key={leader.id}
              className="rounded-2xl bg-white p-5 border-2 border-slate-200/80 hover:border-[#D6A64F] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group"
            >
              {/* Photo Frame: Blank minimal frame when no photo uploaded */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#7A211F] to-[#D6A64F] shadow-md group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white flex items-center justify-center">
                    {leader.photo_url ? (
                      <img
                        src={leader.photo_url}
                        alt={leader.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      /* Clean blank minimalist frame until admin adds photo */
                      <div className="w-full h-full bg-[#7A211F] flex items-center justify-center" />
                    )}
                  </div>
                </div>
              </div>

              {/* Designation Badge */}
              <span className="inline-block px-3 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-[#7A211F]/10 text-[#7A211F] border border-[#7A211F]/20 mb-1.5">
                {leader.designation}
              </span>

              {/* Leader Full Name */}
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                {leader.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Official YouTube Media Spotlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gold-600 mb-1 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-red-500" />
              <span>Official Media Broadcasts</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-navy-900">
              SADQ Official Spotlight
            </h2>
          </div>
          <a
            href="https://www.youtube.com/@sadqofficialmedia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-navy-900 hover:text-red-600 flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>Visit @sadqofficialmedia</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Video Grid — 4 official SADQ Live videos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mediaList.length > 0 ? (
            mediaList.slice(0, 4).map((item) => {
              const ytId = extractYouTubeId(item.media_url);
              const thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : 'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveVideoModal(item)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-red-500 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-sm">
                      {item.category || 'Official Broadcast'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#7A211F]">
                      <span className="flex items-center gap-1 group-hover:text-red-600">
                        <Play className="w-3.5 h-3.5 fill-current" /> Watch Video
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <Video className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Loading official media...</p>
            </div>
          )}
        </div>
      </section>

      {/* Student Growth Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">
            The Student Growth Journey
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            From an enrolled learner to an articulate student with a visible, verified growth identity.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {journeySteps.map((step, idx) => (
            <div
              key={step.title}
              className="relative p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-gold-500/50 hover:shadow-md transition-all text-center flex flex-col justify-between"
            >
              <div className="text-[10px] font-bold text-gold-600 bg-gold-50 w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2">
                0{idx + 1}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 Official Units Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7A211F]/10 text-[#7A211F] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7A211F]" />
              <span>10 Official Wings</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-[#7A211F]">
              10 Official Units of SADQ
            </h2>
          </div>
          <Link
            to="/organisation"
            className="text-xs font-bold uppercase tracking-wider text-[#7A211F] hover:text-[#D6A64F] flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 hover:bg-[#7A211F] hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <span>Explore All 10 Units</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {units.map((unit) => (
            <div
              key={unit.code}
              className="p-5 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-[#D6A64F] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-cinzel font-black text-sm text-[#7A211F] px-2.5 py-1 bg-gradient-to-r from-[#D6A64F]/20 to-amber-100 rounded-lg border border-[#D6A64F]/40">
                    {unit.code}
                  </span>
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#7A211F] bg-slate-100 px-2 py-0.5 rounded">
                    Official
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[#7A211F] transition-colors">
                  {unit.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {unit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact & Zero Fee Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-8 sm:p-12 text-white relative overflow-hidden border border-gold-500/20 shadow-xl">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30">
              Direct Contact & Zero Platform Fees
            </span>
            <h2 className="font-cinzel text-2xl sm:text-4xl font-bold leading-tight">
              Connect Directly via WhatsApp & Gmail
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              No middleman commission, no payment checkout, and no academic ERP. Students collaborate on
              projects, list creative services, and connect with peers and opportunities directly.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/opportunities"
                className="px-6 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 font-bold text-sm transition-all shadow-md"
              >
                Browse Opportunities
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/15"
              >
                Community Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THEATER MODE VIDEO MODAL */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="bg-slate-950 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-white/10 relative max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {activeVideoModal.category || 'Official Broadcast'}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getYouTubeEmbedUrl(activeVideoModal.media_url)}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-snug">
                  {activeVideoModal.title}
                </h3>
                {activeVideoModal.description && (
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {activeVideoModal.description}
                  </p>
                )}
              </div>

              <a
                href={activeVideoModal.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
