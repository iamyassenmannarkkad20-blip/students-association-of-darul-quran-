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
} from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('/shorts/')) {
      const id = url.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [uRes, mRes, medRes] = await Promise.all([
          apiRequest<Unit[]>('/public/units'),
          apiRequest<any[]>('/public/magazines'),
          apiRequest<MediaItem[]>('/public/media'),
        ]);
        if (uRes.success && uRes.data) setUnits(uRes.data);
        if (mRes.success && mRes.data) setMagazines(mRes.data);
        if (medRes.success && medRes.data) setMediaList(medRes.data);
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
      {/* Hero Section with Large Official Emblem */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#071026] via-[#0B1B3D] to-navy-950 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Prominent Majestic Emblem (VALUTHAKKI VENAM) */}
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <div className="relative group">
              {/* Glowing Aura */}
              <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/30 to-amber-500/30 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-1000" />
              
              {/* Grand Shield Crest */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-[#102A43] to-[#071026] p-1.5 shadow-2xl border-2 border-gold-400 flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] border border-gold-500/40 bg-gradient-to-b from-navy-800 to-navy-950 flex flex-col items-center justify-center p-2">
                  <div className="w-8 h-8 rounded-full border border-gold-400/50 flex items-center justify-center mb-1">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="font-cinzel font-extrabold text-2xl sm:text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-500">
                    SADQ
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-300 font-semibold mt-0.5">
                    Est. 2016
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs sm:text-sm font-semibold tracking-wide">
              <span>Students Association of Darul Quran Islamic Academy</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              BEYOND THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-amber-400">CURRICULUM</span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              A modern, secure, student-centered digital ecosystem. Build your digital portfolio,
              collaborate in 10 official units, showcase creative talents, and unlock verified opportunities.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold text-navy-950 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 shadow-xl shadow-gold-500/25 transition-all text-sm sm:text-base flex items-center gap-2 group"
            >
              <span>Build Student Portfolio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/organisation"
              className="px-6 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all text-sm sm:text-base"
            >
              Explore 10 Official Units
            </Link>
          </div>
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

        {/* Video Grid featuring 3 official YouTube videos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaList.length > 0 ? (
            mediaList.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-[9/12] sm:aspect-[9/14] bg-black overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(item.media_url)}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase border border-red-200">
                      {item.category || 'Official Broadcast'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <a
                    href={item.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
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
            <div className="text-xs font-bold uppercase tracking-wider text-gold-600 mb-1">
              Structure & Leadership
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-navy-900">
              10 Official Units of SADQ
            </h2>
          </div>
          <Link
            to="/organisation"
            className="text-sm font-semibold text-navy-900 hover:text-gold-600 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Learn more about units</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {units.map((unit) => (
            <div
              key={unit.code}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-gold-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-cinzel font-bold text-base text-gold-600 px-2 py-0.5 bg-gold-50 rounded-md border border-gold-200">
                    {unit.code}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Official</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{unit.name}</h3>
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
    </div>
  );
};
