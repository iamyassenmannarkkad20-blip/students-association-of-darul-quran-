import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Shield, Users } from 'lucide-react';

const UNIT_DESCRIPTIONS: Record<string, string> = {
  EB: 'Executive Board',
  IA: 'Islamic Arts',
  MPW: 'Media & Public Wing',
  MB: 'Media Board',
  LB: 'Literary Board',
  RW: 'Research Wing',
  CS: 'Computer Science',
  DW: 'Da\'wah Wing',
  LIB: 'Library Board',
  SB: 'Sports Board',
};

export const OrganisationView: React.FC = () => {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiRequest('/students/organisation');
      if (res.success && res.data) setMemberships(res.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-navy-700" /> Organisation Memberships
        </h1>
        <p className="text-sm text-slate-500 mt-1">Your active roles across SADQ's 10 official units.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading memberships...</div>
      ) : memberships.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No unit memberships yet</p>
          <p className="text-xs text-slate-400">Contact your unit admin or SADQ admin to be assigned to an official unit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {memberships.map((m: any) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-300 flex items-center justify-center font-cinzel font-bold text-sm shrink-0">
                  {m.unit_code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{UNIT_DESCRIPTIONS[m.unit_code] || m.unit_code}</h3>
                  <p className="text-xs text-slate-500">{m.unit_name}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {m.role_in_unit || 'Member'}
                  </span>
                  {m.position && (
                    <span className="inline-block ml-2 text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                      {m.position}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
