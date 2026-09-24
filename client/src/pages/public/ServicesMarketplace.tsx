import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Wrench, MessageSquare, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export const ServicesMarketplace: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [tab, setTab] = useState<'services' | 'marketplace'>('services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, mRes] = await Promise.all([
          apiRequest<any[]>('/public/services'),
          apiRequest<any[]>('/public/marketplace'),
        ]);
        if (sRes.success && sRes.data) setServices(sRes.data);
        if (mRes.success && mRes.data) setMarketplace(mRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          Services & Talent Marketplace
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Discover student creative skills (Arabic calligraphy, graphic design, translation, editing).
          Direct communication via WhatsApp & Email — zero platform transaction fees.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setTab('services')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'services'
              ? 'bg-navy-900 text-gold-300 shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Student Services ({services.length})
        </button>
        <button
          onClick={() => setTab('marketplace')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            tab === 'marketplace'
              ? 'bg-navy-900 text-gold-300 shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Marketplace Items ({marketplace.length})
        </button>
      </div>

      {/* Zero Payment Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 max-w-2xl mx-auto flex items-center justify-center gap-2 text-xs text-slate-600 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Direct Contact Model:</strong> SADQ provides pure discovery. All negotiations and
          communications happen directly via WhatsApp or Email. No internal transactions.
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading listings...</div>
      ) : tab === 'services' ? (
        services.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-base">
              No service listings currently active
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Students can list their creative offerings and professional skills from their dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <span className="text-[10px] font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded uppercase border border-navy-200">
                    {item.category || 'Creative Service'}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-2">{item.title}</h3>
                  <p className="text-xs text-gold-700 font-medium">Offered by {item.provider_name}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {item.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${item.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {item.contact_email && (
                    <a
                      href={`mailto:${item.contact_email}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : marketplace.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            No marketplace items currently active
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Student creations, publications, and items will be displayed here for direct inquiry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplace.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded uppercase border border-navy-200">
                  {item.category || 'Marketplace'}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {item.contact_whatsapp && (
                  <a
                    href={`https://wa.me/${item.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {item.contact_email && (
                  <a
                    href={`mailto:${item.contact_email}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
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
