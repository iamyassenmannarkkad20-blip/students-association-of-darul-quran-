import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Video, ExternalLink, Play } from 'lucide-react';

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
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await apiRequest<any[]>('/public/media');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-900">
          Media & Broadcasts
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Speeches, documentary releases, creative video projects, and community recordings produced
          by SADQ.
        </p>
      </div>

      {/* Official Channel Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950 via-navy-900 to-navy-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-red-500/20 shadow-lg">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
            <YoutubeIcon className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">SADQ Official Media</h3>
            <p className="text-xs text-slate-300">
              Official YouTube channel of Students Association of Darul Quran Islamic Academy
            </p>
          </div>
        </div>
        <a
          href="https://www.youtube.com/@sadqofficialmedia"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shrink-0 shadow-md"
        >
          <span>Subscribe on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading media...</div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            Media content will be published after verification
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verified recordings, seminar archives, and creative media will be curated and presented
            here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase border border-red-200">
                    {item.category || item.media_type}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">{item.description}</p>
                </div>

                <a
                  href={item.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                  <span>Watch Stream</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
