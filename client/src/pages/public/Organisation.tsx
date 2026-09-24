import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { ShieldCheck, Users, Sparkles } from 'lucide-react';

interface Unit {
  code: string;
  name: string;
  description: string;
}

export const Organisation: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await apiRequest<Unit[]>('/public/units');
        if (res.success && res.data) {
          setUnits(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUnits();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-navy-900 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-navy-800" />
          <span>Official Organisational Structure</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          10 Official Units
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          The SADQ executive framework comprises strictly ten official operational wings. Each unit
          fosters specialized student leadership, creative initiatives, and collaborative execution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit) => (
          <div
            key={unit.code}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xl font-bold text-navy-950 px-3 py-1 bg-gold-100/70 border border-gold-300 rounded-lg">
                {unit.code}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Wing
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{unit.name}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {unit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
