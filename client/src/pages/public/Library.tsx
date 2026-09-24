import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { BookMarked, Search, ExternalLink, Download, Sparkles } from 'lucide-react';

export const Library: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLibrary() {
      try {
        const res = await apiRequest<any[]>('/public/library');
        if (res.success && res.data) {
          setResources(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLibrary();
  }, []);

  const filtered = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.author && r.author.toLowerCase().includes(search.toLowerCase())) ||
      (r.category && r.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          Digital Library
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Curated reference materials, classical texts, study guides, and research archives
          verified by the Library Board (LIB).
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, author, or category..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading library catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            Library resources will be published after verification
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Official academic references, verified research materials, and external digital links
            will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded uppercase border border-gold-200">
                  {item.category || item.resource_type}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-2">{item.title}</h3>
                {item.author && (
                  <p className="text-xs text-slate-500 mt-1">Author: {item.author}</p>
                )}
                {item.publisher && (
                  <p className="text-xs text-slate-400">Publisher: {item.publisher}</p>
                )}
              </div>

              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
              >
                <span>Access Resource</span>
                {item.downloadable ? (
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                )}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
