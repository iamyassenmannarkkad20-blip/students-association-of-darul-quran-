import React from 'react';
import { History, ShieldAlert, Award, Compass, Sparkles } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Institutional Background</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          About SADQ
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          Students Association of Darul Quran Islamic Academy — an ecosystem dedicated to
          holistic student growth beyond the traditional curriculum.
        </p>
      </div>

      {/* Verification Notice Badge */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Institutional Content Notice:</strong> Unverified
          historical claims are never published as official fact. Sections marked with{' '}
          <span className="font-bold underline decoration-amber-400">Content pending confirmation</span>{' '}
          remain in preliminary status until officially certified by the Academy leadership.
        </div>
      </div>

      {/* Historical Milestones */}
      <section className="space-y-6">
        <h2 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2 border-b pb-3">
          <History className="w-6 h-6 text-gold-600" />
          <span>Chronology & Origins</span>
        </h2>

        <div className="relative border-l-2 border-gold-400/40 ml-4 pl-6 space-y-8">
          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gold-500 border-4 border-white shadow-sm" />
            <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
              2008
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-2">Hifzul Quran Foundations</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Institutional activities commenced with a focused foundation in Quran memorisation
              and classical spiritual learning.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gold-500 border-4 border-white shadow-sm" />
            <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
              2016
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-2">
              Darul Quran Islamic Academy Expansion
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              In 2016, the institution expanded into a broader continuing and further education
              direction, formally establishing Darul Quran Islamic Academy.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gold-500 border-4 border-white shadow-sm" />
            <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
              2016
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-2">
              Inception of SADQ (Students Association)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              SADQ was established under the Academy to champion student growth, leadership,
              creative arts, social awareness, welfare, and collaborative student-led governance.
            </p>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="p-8 rounded-2xl bg-navy-900 text-white space-y-4">
        <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-gold-400">
          The Core Idea: Beyond The Curriculum
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          SADQ is not an ordinary college website or an academic marks portal. It is a digital
          platform designed to help every student transition from simply being an enrolled learner
          into an active, articulate individual with a visible portfolio of talents, verified
          achievements, real projects, and leadership experience.
        </p>
      </section>
    </div>
  );
};
