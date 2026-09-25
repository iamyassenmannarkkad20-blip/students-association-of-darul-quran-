import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Award,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

const OFFICIAL_WINGS = [
  { code: 'EB', name: 'Excellence Bureau', description: 'Academic excellence and strategic coordination.' },
  { code: 'IA', name: 'Islamic Arts', description: 'Traditional Islamic calligraphy, design, and cultural arts.' },
  { code: 'MPW', name: 'Media & Publishing Wing', description: 'Publications, magazines, photography, and video media.' },
  { code: 'MB', name: 'Medical Board', description: 'Health awareness, medical welfare, first-aid coordination.' },
  { code: 'LB', name: 'Literary Board', description: 'Literature, debate, oratory, essays, and creative writing.' },
  { code: 'RW', name: 'Research Wing', description: 'Academic research, Islamic studies analysis, and documentation.' },
  { code: 'CS', name: 'Campus Squad', description: 'Discipline, event volunteer corps, and campus coordination.' },
  { code: 'DW', name: "Da'wah Wing", description: 'Islamic outreach, spiritual development, and community ethics.' },
  { code: 'LIB', name: 'Library Board', description: 'Digital resource management, reading promotion, and archiving.' },
  { code: 'SB', name: 'Samajam Board', description: 'Student assemblies, union sessions, and public speaking gatherings.' },
];

export const OrganisationTree: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const activeUnitData = OFFICIAL_WINGS.find((u) => u.code === selectedUnit);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-gold-700 bg-gold-50 border border-gold-300 px-3 py-1 rounded-full">
          Hierarchical Institutional Architecture
        </span>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-navy-900">
          SADQ Organisation Tree
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Interactive structural map connecting the Central Apex Leadership, 10 Official Specialized Wings, and 8 Class Batch Organisations.
        </p>
      </div>

      {/* Visual Flow Tree */}
      <div className="space-y-6 text-center">
        {/* Tier 1: Apex Leadership */}
        <div>
          <div className="inline-flex flex-col items-center">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white border-2 border-gold-400 shadow-xl max-w-md w-full">
              <div className="flex items-center justify-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4 text-gold-400" />
                <span>Central Executive Committee 2026–27</span>
              </div>
              <div className="text-sm font-bold text-white">
                President • General Secretary • Treasurer
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Apex authority presiding over all collegiate activities, wings, and student welfare
              </p>
              <div className="mt-3">
                <Link
                  to="/about#sarathikal"
                  className="inline-flex items-center gap-1 text-[11px] text-gold-300 hover:text-white font-bold bg-white/10 px-3 py-1 rounded-lg border border-gold-400/30"
                >
                  <span>View All 7 Central Leaders</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-8 bg-gradient-to-b from-gold-400 to-navy-900 mx-auto my-1"></div>
          </div>
        </div>

        {/* Tier 2: 10 Official Specialized Sub-Wings */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-900 border border-navy-200 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-navy-700" />
            <span>10 Official Specialized Sub-Wings (Units)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-w-4xl mx-auto">
            {OFFICIAL_WINGS.map((unit) => {
              const isSelected = selectedUnit === unit.code;
              return (
                <button
                  type="button"
                  key={unit.code}
                  onClick={() => setSelectedUnit(isSelected ? null : unit.code)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-400/40 shadow-md scale-105'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-cinzel text-xs font-black text-navy-900">{unit.code}</span>
                    <span className="text-[10px] text-gold-600 font-bold">● Active</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
                    {unit.name}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {unit.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detailed Preview Drawer for Selected Unit */}
          {activeUnitData && (
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-navy-900 text-white border border-gold-400/40 text-left animate-in fade-in duration-150 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-gold-400 text-navy-950 font-black text-xs">
                    {activeUnitData.code}
                  </span>
                  <h4 className="font-cinzel font-bold text-sm text-gold-300">{activeUnitData.name}</h4>
                </div>
                <Link
                  to={`/organisation#${activeUnitData.code}`}
                  className="inline-flex items-center gap-1 text-[11px] text-gold-300 hover:text-white font-bold"
                >
                  <span>Full Wing View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-slate-300">{activeUnitData.description}</p>
            </div>
          )}

          {/* Connecting Vertical Line */}
          <div className="w-0.5 h-8 bg-slate-300 mx-auto my-1"></div>
        </div>

        {/* Tier 3: 8 Class Sangadhanakal */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>8 Class Sangadhanakal (Batch Councils • Classes 01 to 08)</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-w-4xl mx-auto">
            {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
              <Link
                key={c}
                to={`/class/${c}`}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-all text-center group shadow-sm"
              >
                <div className="font-cinzel text-xs font-black text-navy-900 group-hover:text-emerald-700">
                  Class {c}
                </div>
                <span className="text-[9px] text-slate-400 group-hover:text-emerald-600 block mt-0.5">
                  Points & Ranks →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
