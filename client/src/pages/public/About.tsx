import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  History,
  ShieldAlert,
  Award,
  Compass,
  Sparkles,
  Crown,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OrganisationTree } from '../../components/OrganisationTree';

interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  photo_url: string;
  order_index: number;
  bio?: string;
}

export const About: React.FC = () => {
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCommittee() {
      try {
        const res = await apiRequest<CommitteeMember[]>('/public/committee');
        if (res.success && res.data) {
          setCommittee(res.data);
        }
      } catch (err) {
        console.error('Failed to load committee', err);
      } finally {
        setLoading(false);
      }
    }
    loadCommittee();
  }, []);

  const top3 = committee.slice(0, 3);
  const remainingLeaders = committee.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Title & Institutional Mission */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-widest shadow-md">
          <Sparkles className="w-4 h-4 text-[#ffd014]" />
          <span>Institutional Framework & Heritage</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#02167f] tracking-tight">
          About SADQ
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Students Association of Darul Quran Islamic Academy — an integrated student-led ecosystem dedicated to nurturing articulate scholars, creative leaders, and impactful community innovators beyond the standard curriculum.
        </p>
      </div>

      {/* Verification Notice */}
      <div className="max-w-5xl mx-auto">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Institutional Content Notice:</strong> Historical milestones and official leadership designations are certified under the executive authority of Darul Quran Islamic Academy.
          </div>
        </div>
      </div>

      {/* SECTION: SADQ EXECUTIVE COMMITTEE (കേന്ദ്ര സാരഥികൾ) */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Apex Leadership</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-black text-[#02167f]">
            SADQ Central Executive Committee
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            The central executive leadership governing student initiatives, 10 official operational wings, and collegiate representation.
          </p>
        </div>

        {/* Top 3 Officers: President, Secretary, Treasurer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((leader) => (
            <div
              key={leader.id}
              className="relative rounded-3xl bg-gradient-to-br from-[#02167f] via-[#031d96] to-[#010e52] text-white p-6 sm:p-8 border-2 border-[#ffd014] shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="absolute -top-3.5 px-3.5 py-0.5 rounded-full bg-[#ffd014] text-[#02167f] text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-1 border border-white/40">
                <Award className="w-3 h-3" />
                <span>Apex Officer</span>
              </div>

              {/* Minimalist Blank Frame / Photo */}
              <div className="relative mt-2 mb-4">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#ffd014] via-amber-200 to-[#ffd014] shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#01092e] border-2 border-[#02167f] flex items-center justify-center">
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
                      <div className="w-full h-full bg-[#010a38] flex items-center justify-center" />
                    )}
                  </div>
                </div>
              </div>

              <span className="inline-block px-3.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-[#ffd014] text-[#02167f] shadow-sm mb-1.5">
                {leader.designation}
              </span>

              <h3 className="font-cinzel text-xl font-bold text-white tracking-wide">
                {leader.name}
              </h3>

              {leader.bio && (
                <p className="text-xs text-blue-100/80 mt-2 line-clamp-2 leading-relaxed">
                  {leader.bio}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Other Officers: Vice Presidents & Joint Secretaries */}
        {remainingLeaders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {remainingLeaders.map((leader) => (
              <div
                key={leader.id}
                className="rounded-3xl bg-white p-5 border-2 border-slate-200/80 hover:border-[#ffd014] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#02167f] to-[#ffd014] shadow-md group-hover:scale-105 transition-transform duration-300">
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
                        <div className="w-full h-full bg-[#02167f] flex items-center justify-center" />
                      )}
                    </div>
                  </div>
                </div>

                <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 mb-1.5">
                  {leader.designation}
                </span>

                <h4 className="font-cinzel text-base font-bold text-slate-900">
                  {leader.name}
                </h4>

                {leader.bio && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-snug">
                    {leader.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: VISUAL ORGANISATION TREE */}
      <section className="max-w-5xl mx-auto">
        <OrganisationTree />
      </section>

      {/* SECTION: CHRONOLOGY & ORIGINS */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <History className="w-6 h-6 text-[#02167f]" />
          <h2 className="font-cinzel text-2xl font-black text-slate-900">
            Chronology & Origins (ചരിത്ര നാഴികക്കല്ലുകൾ)
          </h2>
        </div>

        <div className="relative border-l-2 border-[#ffd014] ml-4 pl-8 space-y-8">
          {/* Milestone 2008 */}
          <div className="relative bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full bg-[#02167f] border-4 border-[#ffd014] shadow-md" />
            <span className="inline-block text-xs font-black text-[#02167f] bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300 mb-2">
              Year 2008
            </span>
            <h3 className="font-cinzel font-black text-slate-900 text-lg">
              Hifzul Quran Foundations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Institutional activities commenced with a focused foundation in Quran memorisation, classical recitation science (Tajweed), and spiritual learning under the guidance of venerable scholars.
            </p>
          </div>

          {/* Milestone 2016 Academy */}
          <div className="relative bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full bg-[#02167f] border-4 border-[#ffd014] shadow-md" />
            <span className="inline-block text-xs font-black text-[#02167f] bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300 mb-2">
              Year 2016
            </span>
            <h3 className="font-cinzel font-black text-slate-900 text-lg">
              Darul Quran Islamic Academy Expansion
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              In 2016, the institution expanded into a comprehensive continuing and higher education campus, formally establishing Darul Quran Islamic Academy to integrate religious sciences with contemporary knowledge.
            </p>
          </div>

          {/* Milestone 2016 SADQ */}
          <div className="relative bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full bg-[#02167f] border-4 border-[#ffd014] shadow-md" />
            <span className="inline-block text-xs font-black text-[#02167f] bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300 mb-2">
              Year 2016
            </span>
            <h3 className="font-cinzel font-black text-slate-900 text-lg">
              Inception of SADQ (Students Association)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              SADQ was established under the Academy as the sovereign student organization to champion leadership, literary clubs, artistic exhibitions, social welfare, campus coordination, and inter-class championship leagues.
            </p>
          </div>

          {/* Milestone 2026 Digital Era */}
          <div className="relative bg-white p-6 rounded-3xl border-2 border-gold-400 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute -left-[45px] top-6 w-6 h-6 rounded-full bg-emerald-600 border-4 border-gold-400 shadow-md animate-pulse" />
            <span className="inline-block text-xs font-black text-navy-950 bg-gold-400 px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-sm">
              Year 2026 • DIGITAL ERA
            </span>
            <h3 className="font-cinzel font-black text-slate-900 text-lg">
              SADQ Digital Student Growth Platform & Central Executive 2026–27
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Launch of the integrated digital ecosystem powering 10 official sub-wings, live Inter-Class Championship leaderboards, digital student portfolios, published results, online certificate authentication, and seamless administration.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: CORE PHILOSOPHY & BEYOND THE CURRICULUM */}
      <section className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#02167f] to-[#010e52] text-white p-8 sm:p-12 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-black text-[#ffd014] uppercase tracking-widest">
            Institutional Manifesto
          </span>
          <h2 className="font-cinzel text-2xl sm:text-4xl font-black text-white">
            The Core Idea: Beyond The Curriculum
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          SADQ is not an ordinary college website or an academic marks portal. It is a digital platform designed to help every student transition from simply being an enrolled learner into an active, articulate individual with a visible portfolio of verified talents, leadership roles, and real creative output.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-[#ffd014]">10 Wings</div>
            <p className="text-xs text-white/80">
              Specialized departments enabling student initiatives across arts, debates, media, and campus life.
            </p>
            <Link
              to="/organisation"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#ffd014] hover:underline pt-1"
            >
              <span>Explore Units</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-[#ffd014]">8 Classes</div>
            <p className="text-xs text-white/80">
              Dynamic inter-class championship tracking every offline task, debate, and sporting victory live.
            </p>
            <Link
              to="/class-leaderboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#ffd014] hover:underline pt-1"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-2">
            <div className="text-2xl font-black text-[#ffd014]">Digital Portfolios</div>
            <p className="text-xs text-white/80">
              Public student profiles showcasing verified skills, creative achievements, and public writings.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#ffd014] hover:underline pt-1"
            >
              <span>Discover Talents</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
