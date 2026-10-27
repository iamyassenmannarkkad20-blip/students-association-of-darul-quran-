import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { BookMarked, Search, ExternalLink, Download, Sparkles, Filter, FileText, Upload, Plus } from 'lucide-react';

const CATEGORIES = [
  'All Subjects',
  'Class Union Releases',
  'Quranic Studies',
  'Hadith & Fiqh',
  'Arabic Literature',
  'Islamic History',
  'Technology & Skills',
];

const CLASS_CODES = ['All', '01', '02', '03', '04', '05', '06', '07', '08'];

export const Library: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [unionItems, setUnionItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Subjects');
  const [selectedClass, setSelectedClass] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [libRes, notesRes, unionRes] = await Promise.all([
          apiRequest<any[]>('/public/library'),
          apiRequest<any[]>('/community/notes'),
          apiRequest<any[]>('/class-unions/items/all'),
        ]);

        if (libRes.success && libRes.data) setResources(libRes.data);
        if (notesRes.success && notesRes.data) setNotes(notesRes.data);
        if (unionRes.success && unionRes.data) setUnionItems(unionRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Combine official library items, student verified notes, and Class Union releases
  const allItems = [
    ...resources.map((r) => ({
      id: r.id,
      title: r.title,
      author: r.author || 'SADQ Library Board',
      category: r.category || 'General',
      externalUrl: r.external_url,
      downloadable: r.downloadable,
      description: '',
      type: 'official',
      classCode: null,
    })),
    ...notes.map((n) => ({
      id: n.id,
      title: n.title,
      author: n.author_name ? `Student: ${n.author_name}` : 'Student Contributor',
      category: n.subject_area || 'Study Notes',
      externalUrl: n.file_url,
      downloadable: n.downloadable,
      description: n.description,
      type: 'notes',
      classCode: null,
    })),
    ...unionItems.map((u) => ({
      id: u.id,
      title: u.title,
      author: u.creator_name ? `${u.creator_name} (Class ${u.class_code})` : (u.union_name || `Class ${u.class_code} Union`),
      category: u.category ? `Class Union (${u.category})` : 'Class Union Releases',
      externalUrl: u.item_url,
      downloadable: true,
      description: u.description || `Published under Class ${u.class_code} Union`,
      type: 'class_union',
      classCode: u.class_code,
    })),
  ];

  const filtered = allItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Subjects' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesClass =
      selectedClass === 'All' ||
      item.classCode === selectedClass ||
      (item.description && item.description.includes(`Class ${selectedClass}`));

    return matchesSearch && matchesCategory && matchesClass;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-navy-950 via-[#02167f] to-navy-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#ffd014] text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <BookMarked className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Digital Archive & Knowledge Center</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-white">
            Digital Library & Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
            Curated reference materials, classical texts, student projects, study notes, and research archives
            verified by the Library Board (LIB) and Class Unions. Open to all readers worldwide.
          </p>
        </div>
        <Link
          to="/student/create"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ffd014] text-[#02167f] text-xs font-extrabold hover:bg-yellow-400 transition-all shadow-lg shrink-0 transform hover:-translate-y-0.5"
        >
          <Upload className="w-4 h-4" />
          <span>Submit Project / Notes</span>
        </Link>
      </div>

      {/* Filter and Search Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, book title, author, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Subject:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-navy-900 text-gold-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Classes (01-08) */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Class:</span>
          {CLASS_CODES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${
                selectedClass === c
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c === 'All' ? 'All Classes' : `Class ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading library catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">
            No matching resources found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Resources and study notes will be published after verification by the library board.
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded uppercase border border-gold-200">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {item.type === 'notes' ? 'Student Note' : 'Reference'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.author}</p>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                )}
              </div>

              {item.externalUrl && (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Open Drive / PDF Link</span>
                  {item.downloadable ? (
                    <Download className="w-3.5 h-3.5 text-gold-400" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
                  )}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
