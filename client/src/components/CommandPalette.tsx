import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Video,
  Trophy,
  Users,
  Shield,
  GraduationCap,
  Briefcase,
  FileText,
  Flame,
  CornerDownLeft,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pages' | '10 Sub-Wings' | '8 Classes' | 'Workspace & Admin';
  path: string;
  icon: React.ReactNode;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Pages
  { id: 'p-home', title: 'Home', subtitle: 'Welcome Page, Crest & Class Podium', category: 'Pages', path: '/', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
  { id: 'p-about', title: 'About SADQ', subtitle: 'Central Executive Committee & History', category: 'Pages', path: '/about', icon: <Users className="w-4 h-4 text-blue-400" /> },
  { id: 'p-org', title: 'Organisation & Wings', subtitle: '10 Official Sub-Wings Directory', category: 'Pages', path: '/organisation', icon: <Award className="w-4 h-4 text-purple-400" /> },
  { id: 'p-results', title: 'Published Results', subtitle: 'Campus Events & Sub-Wing Competitions', category: 'Pages', path: '/results', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
  { id: 'p-leaderboard', title: 'Class Championship Leaderboard', subtitle: 'Points Table for Classes 01 to 08', category: 'Pages', path: '/class-leaderboard', icon: <Flame className="w-4 h-4 text-amber-500" /> },
  { id: 'p-media', title: 'Media & YouTube Broadcasts', subtitle: 'Official Live Streams & Video Hub', category: 'Pages', path: '/media', icon: <Video className="w-4 h-4 text-red-500" /> },
  { id: 'p-library', title: 'Digital Library', subtitle: 'Islamic Texts, Research & Books', category: 'Pages', path: '/library', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
  { id: 'p-magazines', title: 'Magazines & Releases', subtitle: 'Official Periodicals & Issuu Reads', category: 'Pages', path: '/magazines', icon: <FileText className="w-4 h-4 text-rose-400" /> },
  { id: 'p-opportunities', title: 'Opportunities Board', subtitle: 'Workshops, Roles & Internships', category: 'Pages', path: '/opportunities', icon: <Briefcase className="w-4 h-4 text-indigo-400" /> },
  { id: 'p-services', title: 'Services & Marketplace', subtitle: 'Student Skills & Talent Discovery', category: 'Pages', path: '/services', icon: <Briefcase className="w-4 h-4 text-cyan-400" /> },
  { id: 'p-students', title: 'Students Directory & Dashboards', subtitle: 'Browse all students (Class 01 to 08) & individual 360° growth profiles', category: 'Pages', path: '/students', icon: <Users className="w-4 h-4 text-[#ffd014]" /> },
  { id: 'p-cert', title: 'Verify Certificates', subtitle: 'Authenticity & Credential Verification', category: 'Pages', path: '/certificates', icon: <Award className="w-4 h-4 text-emerald-400" /> },

  // 10 Official Sub-Wings
  { id: 'w-eb', title: 'Excellence Bureau (EB)', subtitle: 'Academic excellence and strategic coordination', category: '10 Sub-Wings', path: '/organisation#EB', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-ia', title: 'Islamic Arts (IA)', subtitle: 'Calligraphy, traditional and cultural arts', category: '10 Sub-Wings', path: '/organisation#IA', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-mpw', title: 'Media & Publishing Wing (MPW)', subtitle: 'Publications, magazines and video media', category: '10 Sub-Wings', path: '/organisation#MPW', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-mb', title: 'Medical Board (MB)', subtitle: 'Health awareness and medical welfare', category: '10 Sub-Wings', path: '/organisation#MB', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-lb', title: 'Literary Board (LB)', subtitle: 'Debate, oratory and creative writing', category: '10 Sub-Wings', path: '/organisation#LB', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-rw', title: 'Research Wing (RW)', subtitle: 'Academic research and documentation', category: '10 Sub-Wings', path: '/organisation#RW', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-cs', title: 'Campus Squad (CS)', subtitle: 'Discipline, event volunteer corps', category: '10 Sub-Wings', path: '/organisation#CS', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-dw', title: "Da'wah Wing (DW)", subtitle: 'Outreach and spiritual development', category: '10 Sub-Wings', path: '/organisation#DW', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-lib', title: 'Library Board (LIB)', subtitle: 'Resource management and reading promotion', category: '10 Sub-Wings', path: '/organisation#LIB', icon: <Award className="w-4 h-4 text-gold-400" /> },
  { id: 'w-sb', title: 'Samajam Board (SB)', subtitle: 'Student assemblies and public speaking', category: '10 Sub-Wings', path: '/organisation#SB', icon: <Award className="w-4 h-4 text-gold-400" /> },

  // 8 Class Sangadhanakal
  { id: 'c-01', title: 'Class 01 Batch Sangadhana', subtitle: 'First Year Batch Profile & Points', category: '8 Classes', path: '/class/01', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-02', title: 'Class 02 Batch Sangadhana', subtitle: 'Second Year Batch Profile & Points', category: '8 Classes', path: '/class/02', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-03', title: 'Class 03 Batch Sangadhana', subtitle: 'Third Year Batch Profile & Points', category: '8 Classes', path: '/class/03', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-04', title: 'Class 04 Batch Sangadhana', subtitle: 'Fourth Year Batch Profile & Points', category: '8 Classes', path: '/class/04', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-05', title: 'Class 05 Batch Sangadhana', subtitle: 'Fifth Year Batch Profile & Points', category: '8 Classes', path: '/class/05', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-06', title: 'Class 06 Batch Sangadhana', subtitle: 'Sixth Year Batch Profile & Points', category: '8 Classes', path: '/class/06', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-07', title: 'Class 07 Batch Sangadhana', subtitle: 'Seventh Year Batch Profile & Points', category: '8 Classes', path: '/class/07', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },
  { id: 'c-08', title: 'Class 08 Batch Sangadhana', subtitle: 'Senior Apex Batch Profile & Points', category: '8 Classes', path: '/class/08', icon: <GraduationCap className="w-4 h-4 text-emerald-400" /> },

  // Workspaces
  { id: 'w-student', title: 'My Student Workspace', subtitle: 'Dashboard, Talents & Submission Center', category: 'Workspace & Admin', path: '/student', icon: <GraduationCap className="w-4 h-4 text-amber-400" /> },
  { id: 'w-profile', title: 'Edit Student Profile & Socials', subtitle: 'Islamic Badges, Instagram & Contact info', category: 'Workspace & Admin', path: '/student/profile', icon: <Users className="w-4 h-4 text-slate-300" /> },
  { id: 'w-subwing', title: 'My Sub-Wing Portal', subtitle: 'Unit Leader Operations & Result Publishing', category: 'Workspace & Admin', path: '/subwing', icon: <Award className="w-4 h-4 text-amber-400" /> },
  { id: 'w-admin', title: 'Admin Control Center', subtitle: 'Executive Suite, Media & Results Moderation', category: 'Workspace & Admin', path: '/admin', icon: <Shield className="w-4 h-4 text-amber-400" /> },
  { id: 'w-admin-login', title: 'Official Admin Gateway', subtitle: 'High-Security Administrator Login', category: 'Workspace & Admin', path: '/admin/login', icon: <Shield className="w-4 h-4 text-rose-400" /> },
];

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filtered = COMMAND_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-navy-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#01092e] border-2 border-gold-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-navy-900/60">
          <Search className="w-5 h-5 text-gold-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type to search pages, 10 wings, 8 classes, results..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-gold-300 bg-white/10 rounded-md border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-500 mx-auto" />
              <p>No matching SADQ records or pages found for "{query}".</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-gold-500/20 to-navy-800 border border-gold-400/50 shadow-sm'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-navy-950/80 border border-white/10">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-semibold text-gold-400/90 bg-gold-400/10 px-2 py-0.5 rounded-full border border-gold-400/20">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] text-gold-300 font-bold">
                      <span className="hidden sm:inline">Jump</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 bg-navy-950/90 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-gold-400 font-bold">SADQ Spotlight</span>
        </div>
      </div>
    </div>
  );
};
