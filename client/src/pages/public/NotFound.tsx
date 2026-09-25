import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Home,
  Trophy,
  Award,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-navy-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl text-center space-y-6 relative z-10">
        {/* Animated Compass Icon */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-navy-950 to-navy-900 border-2 border-gold-400 flex items-center justify-center mx-auto text-gold-400 shadow-xl animate-float">
            <Compass className="w-10 h-10 text-gold-400 animate-spin-slow" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gold-400 text-navy-950 font-black text-xs shadow-md">
            404
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-navy-900">
            Lost on Campus?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            You seem to have taken an uncharted turn on the Darul Quran digital campus. The record or page you're seeking may have moved or been updated.
          </p>
        </div>

        {/* Quick Recovery Navigation Grid */}
        <div className="space-y-2 pt-2 text-left">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
            Recommended Destinations:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <Link
              to="/"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-900 font-bold border border-navy-200/60 transition-colors"
            >
              <Home className="w-4 h-4 text-navy-700 shrink-0" />
              <span>SADQ Home</span>
            </Link>

            <Link
              to="/results"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200/60 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Published Results</span>
            </Link>

            <Link
              to="/organisation"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200/60 transition-colors"
            >
              <Award className="w-4 h-4 text-purple-600 shrink-0" />
              <span>10 Official Wings</span>
            </Link>

            <Link
              to="/student"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200/60 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Student Workspace</span>
            </Link>
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-navy-950 to-navy-900 text-gold-300 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg transition-all"
          >
            <span>Return to Main Entrance</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};
