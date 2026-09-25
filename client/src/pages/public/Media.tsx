import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Video, ExternalLink, Play, Search, Filter, Sparkles, X, Tv, Film, Radio } from 'lucide-react';
import { extractYouTubeId } from '../admin/AdminMedia';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  category: string;
  created_at: string;
}

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="YouTube"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

export const Media: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await apiRequest<MediaItem[]>('/public/media');
        if (res.success && res.data) {
          setMediaItems(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, []);

  const categories = ['ALL', 'Live Stream', 'Official Programme', 'Speeches & Sessions', 'Documentary & Releases', 'Campus Life & Activities'];

  const filteredMedia = mediaItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getEmbedUrl = (url: string) => {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-widest shadow-md">
          <Film className="w-4 h-4 text-[#ffd014]" />
          <span>SADQ Broadcast Archive & Live Media</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#02167f] tracking-tight">
          Media & Official Broadcasts
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Official recordings, grand student convocation streams, tarbiya discourses, and cultural documentaries produced by the Students Association of Darul Quran.
        </p>
      </div>

      {/* Official YouTube Channel Banner */}
      <div className="max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950 via-[#02167f] to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-red-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 text-center sm:text-left relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <YoutubeIcon className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-cinzel font-black text-xl text-white">SADQ Official Media</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Subscribe for live streaming of collegiate convocations, Islamic Arts festivals, and inter-class championship presentations.
              </p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@sadqofficialmedia"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 relative z-10"
          >
            <span>Subscribe on YouTube</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#02167f] text-[#ffd014] shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Broadcasts' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search video releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#02167f]/20 focus:border-[#02167f]"
            />
          </div>
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f] mx-auto" />
            <p className="text-xs text-slate-400 mt-3 font-semibold">Loading media library...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3 shadow-sm">
            <Video className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-slate-800">No Videos Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Videos will appear here dynamically once published by the administrators via the Admin Suite.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => {
              const ytId = extractYouTubeId(item.media_url);
              const thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : 'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:border-[#02167f] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  onClick={() => setActiveVideo(item)}
                >
                  <div>
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={thumbUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                          <Play className="w-6 h-6 fill-white ml-1" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-md border border-white/20">
                        {item.category || 'Broadcast'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-[#02167f] transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] group-hover:text-red-600 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Stream</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* THEATER MODE VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-950 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-white/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {activeVideo.category || 'Broadcast'}
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getEmbedUrl(activeVideo.media_url)}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Bottom Info */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-snug">
                  {activeVideo.title}
                </h3>
                {activeVideo.description && (
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    {activeVideo.description}
                  </p>
                )}
              </div>

              <a
                href={activeVideo.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
