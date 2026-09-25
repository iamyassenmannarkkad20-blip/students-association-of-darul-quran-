import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import {
  BookOpen, Video, FolderGit2, Image as ImageIcon, FileText,
  ExternalLink, Sparkles, Filter, ChevronRight
} from 'lucide-react';

interface ReleaseItem {
  id: string;
  class_code: string;
  title: string;
  description: string;
  category: 'PROJECT' | 'MAGAZINE' | 'VIDEO' | 'POSTER' | 'DOCUMENT';
  item_url: string;
  thumbnail_url?: string;
  union_name?: string;
  creator_name?: string;
  created_at: string;
}

export const ClassUnionReleasesFeed: React.FC<{ limit?: number; classCode?: string }> = ({
  limit = 6,
  classCode,
}) => {
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let url = '/class-unions/items/all';
        const params: string[] = [];
        if (selectedCategory !== 'ALL') params.push(`category=${selectedCategory}`);
        if (classCode) params.push(`classCode=${classCode}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await apiRequest(url);
        if (res.success && res.data) {
          setItems(res.data.slice(0, limit));
        }
      } catch (err) {
        console.error('Failed to load class union releases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, classCode, limit]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MAGAZINE':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'PROJECT':
        return <FolderGit2 className="w-4 h-4 text-emerald-600" />;
      case 'POSTER':
        return <ImageIcon className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const categories = [
    { key: 'ALL', label: 'All Releases' },
    { key: 'MAGAZINE', label: 'Magazines' },
    { key: 'PROJECT', label: 'Projects' },
    { key: 'VIDEO', label: 'Videos' },
    { key: 'POSTER', label: 'Posters' },
  ];

  if (loading) return null;
  if (items.length === 0 && selectedCategory === 'ALL' && !classCode) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#02167f] text-xs font-bold border border-blue-100 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Official Class Union Releases</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Class Union Publications, Projects & Videos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real projects, magazines, posters, and YouTube/Drive media published by the 8 student batch unions.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === c.key
                  ? 'bg-[#02167f] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No releases under this category yet. Appointed Class Chairmen can publish batch magazines and projects from their portal.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>

                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#02167f] text-white">
                    Class {item.class_code}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-400 mb-0.5">
                  {item.union_name || `Class ${item.class_code} Union`}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#02167f] transition-colors">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>

                <a
                  href={item.item_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] hover:underline"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
