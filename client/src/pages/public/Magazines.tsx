import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { BookOpen, ExternalLink, Calendar, FileText } from 'lucide-react';

export const Magazines: React.FC = () => {
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMagazines() {
      try {
        const res = await apiRequest<any[]>('/public/magazines');
        if (res.success && res.data) {
          setMagazines(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMagazines();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          Magazines & Publications
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Official periodicals, special editions, and creative literary releases by the Media &
          Publishing Wing (MPW).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading publications...</div>
      ) : magazines.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            Publications will be published after verification
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verified issues and digital publications will appear here once officially published by
            the administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {magazines.map((mag) => (
            <div
              key={mag.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              {mag.cover_image_url ? (
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img
                    src={mag.cover_image_url}
                    alt={mag.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-navy-900 to-navy-950 flex items-center justify-center text-gold-400">
                  <FileText className="w-12 h-12" />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-gold-700 font-semibold mb-2">
                    <span>Issue: {mag.issue}</span>
                    {mag.publication_date && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(mag.publication_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{mag.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {mag.description}
                  </p>
                </div>

                {mag.issuu_url || mag.pdf_url ? (
                  <a
                    href={mag.issuu_url || mag.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Read Publication</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
