import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Compass, Search, Sparkles, User, ArrowRight, Filter, GraduationCap, ShieldCheck
} from 'lucide-react';

const TALENT_TAGS = [
  'Arabic Calligraphy',
  'Public Speaking',
  'Creative Writing',
  'Islamic Research',
  'Graphic Design',
  'Web Development',
  'Quran Recitation',
];

const CLASS_CODES = ['01', '02', '03', '04', '05', '06', '07', '08'];

export const TalentDiscovery: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTalent, setSelectedTalent] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedClass) params.append('classCode', selectedClass);
      if (selectedTalent) params.append('talent', selectedTalent);

      const res = await apiRequest<any[]>(`/public/students?${params.toString()}`);
      if (res.success && res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedClass, selectedTalent]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 border border-gold-300 text-gold-800 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-gold-600" />
          <span>Talent & Portfolio Directory</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-navy-950">
          Discover Student Talents
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Explore the creative gifts, leadership roles, and public portfolios of students at Darul Quran Islamic Academy.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or bio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            >
              <option value="">All Classes (01–08)</option>
              {CLASS_CODES.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>

            {(search || selectedClass || selectedTalent) && (
              <button
                onClick={() => { setSearch(''); setSelectedClass(''); setSelectedTalent(''); }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Talent Quick Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">Popular talents:</span>
          {TALENT_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTalent(selectedTalent === t ? '' : t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedTalent === t
                  ? 'bg-navy-900 text-gold-300 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Searching student directory...</div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-base">No public student profiles match this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Profiles appear here when students set their portfolio visibility to public.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-gold-400/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold-400 bg-navy-900 shrink-0 flex items-center justify-center text-white shadow-sm">
                    {student.profile_photo_url ? (
                      <img
                        src={student.profile_photo_url}
                        alt={student.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-gold-300" />
                    )}
                  </div>

                  {/* Name & Class */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base truncate">
                        {student.display_name || student.full_name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    {student.class_code && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded border border-navy-200 mt-1">
                        <GraduationCap className="w-3 h-3 text-navy-700" />
                        Class {student.class_code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {student.bio && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {student.bio}
                  </p>
                )}

                {/* Talents Tags */}
                {student.talents && student.talents.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {student.talents.slice(0, 3).map((t: any) => (
                      <span
                        key={t.id || t.title}
                        className="text-[10px] font-semibold text-gold-800 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full"
                      >
                        {t.title}
                      </span>
                    ))}
                    {student.talents.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{student.talents.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* View Portfolio Button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={`/portfolio/${student.profile_slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-navy-900 hover:text-gold-300 text-slate-800 text-xs font-bold transition-all group-hover:bg-navy-900 group-hover:text-gold-300"
                >
                  <span>View Public Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
