import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Briefcase, MessageSquare, Mail, ExternalLink, Sparkles } from 'lucide-react';

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOpportunities() {
      try {
        const res = await apiRequest<any[]>('/public/opportunities');
        if (res.success && res.data) {
          setOpportunities(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOpportunities();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>Growth & Careers</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          Opportunities & Roles
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Internships, volunteer roles, research projects, and community openings. Connect directly
          with coordinators via WhatsApp or Email.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            No active opportunities listed at this time
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verified campus projects, internships, and educational openings will be announced here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded uppercase border border-navy-200">
                  {opp.category || 'Opportunity'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2">{opp.title}</h3>
                <p className="text-xs text-gold-700 font-semibold mt-0.5">{opp.provider}</p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              {/* Direct Communication Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {opp.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${opp.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {opp.contact_email && (
                  <a
                    href={`mailto:${opp.contact_email}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
                {opp.external_link && !opp.contact_whatsapp && !opp.contact_email && (
                  <a
                    href={opp.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Apply Online</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
