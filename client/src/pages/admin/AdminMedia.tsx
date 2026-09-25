import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Video, Plus, Trash2, ExternalLink, Play, Sparkles, Check, Film, Tv, Radio } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: string;
  media_url: string;
  category: string;
  created_at: string;
}

export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  return match ? match[1] : '';
}

export const AdminMedia: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Video Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCategory, setVideoCategory] = useState('Official Program');
  const [videoDesc, setVideoDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<MediaItem[]>('/admin/media');
      if (res.success && res.data) {
        setMediaList(res.data);
      }
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const res = await apiRequest('/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          title: videoTitle,
          media_url: videoUrl,
          category: videoCategory,
          description: videoDesc,
          media_type: 'youtube',
        }),
      });

      if (res.success) {
        setNotice('✅ Video added successfully to public view!');
        setShowAddModal(false);
        setVideoTitle('');
        setVideoUrl('');
        setVideoDesc('');
        fetchMedia();
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert(res.error || 'Failed to add video');
      }
    } catch (err) {
      console.error('Add video error', err);
      alert('Error adding video');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the media broadcasts?`)) {
      return;
    }

    try {
      const res = await apiRequest(`/admin/media/${id}`, { method: 'DELETE' });
      if (res.success) {
        setNotice('Video deleted successfully.');
        setTimeout(() => setNotice(null), 3000);
        fetchMedia();
      } else {
        alert(res.error || 'Failed to delete video');
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const previewId = extractYouTubeId(videoUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-[#02167f] uppercase tracking-wider">
            Broadcast & Media Management
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Official YouTube Videos & Streams
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Publish YouTube broadcasts, event recordings, speeches, and documentary releases directly to the public Media Hub.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add YouTube Video</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-slate-800">No Media Broadcasts Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "+ Add YouTube Video" to paste any YouTube stream link, select a category, and publish it to the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaList.map((item) => {
            const ytId = extractYouTubeId(item.media_url);
            const thumbUrl = ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : 'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-red-500 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/600x400/02167f/ffffff?text=Video+Broadcast';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm">
                      {item.category || 'Broadcast'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={item.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 transition-colors"
                  >
                    <span>Open YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteVideo(item.id, item.title)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white transition-all"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD VIDEO MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="font-cinzel text-xl font-black text-slate-900 mb-4">
              Add YouTube Broadcast
            </h2>

            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SADQ Grand Convocation & Inaugural Session"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  YouTube Video Link (or ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=loBBhKjIQZM or https://youtu.be/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Live Thumbnail Preview */}
              {previewId && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-24 h-14 object-cover rounded-xl shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                      ✓ Valid YouTube ID: {previewId}
                    </span>
                    <span className="text-xs text-slate-500">Thumbnail detected successfully</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Live Stream">Live Stream</option>
                  <option value="Official Programme">Official Programme</option>
                  <option value="Speeches & Sessions">Speeches & Sessions</option>
                  <option value="Documentary & Releases">Documentary & Releases</option>
                  <option value="Campus Life & Activities">Campus Life & Activities</option>
                  <option value="Student Leadership">Student Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Event Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief context or speaker information"
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
