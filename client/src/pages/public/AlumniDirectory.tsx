import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { GraduationCap, Award, Sparkles, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Alumnus {
  user_id: string;
  username: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url?: string;
  graduation_year?: string;
  bio?: string;
  skills: { name: string; level: string; category?: string }[];
  talents: { title: string; category?: string }[];
  certificates_count: number;
  lifetime_points: number;
}

export const AlumniDirectory: React.FC = () => {
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await apiRequest('/public/alumni');
        if (res.success && res.data) {
          setAlumni(res.data);
        }
      } catch (err) {
        console.error('Failed to load alumni:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const years = Array.from(new Set(alumni.map((a) => a.graduation_year).filter(Boolean))) as string[];

  const filtered = alumni.filter((a) => {
    const matchesSearch =
      a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.skills.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.talents.some((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesYear = selectedYear === 'ALL' || a.graduation_year === selectedYear;

    return matchesSearch && matchesYear;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-4 shadow-sm">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Academy Alumni Directory & Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Distinguished Graduated Scholars
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Celebrating Darul Quran scholars who completed their academy journey. Their skills, portfolios, verified credentials, and lifetime achievements remain permanently archived in honour.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholar by name, skill, or talent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#02167f] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedYear('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedYear === 'ALL'
                  ? 'bg-[#02167f] text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Batches ({alumni.length})
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedYear === y
                    ? 'bg-[#02167f] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Batch {y}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading Alumni Directory...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No Alumni Scholars Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {alumni.length === 0
                ? 'No students have graduated to Alumni yet. When the annual promotion is executed, graduated scholars appear here permanently.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((alumnus) => (
              <div
                key={alumnus.user_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-black text-xl shadow overflow-hidden flex-shrink-0">
                        {alumnus.profile_photo_url ? (
                          <img
                            src={alumnus.profile_photo_url}
                            alt={alumnus.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          alumnus.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base leading-tight">
                          {alumnus.full_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">@{alumnus.username}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                      Batch {alumnus.graduation_year || 'Alumni'}
                    </span>
                  </div>

                  {alumnus.bio && (
                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic">
                      "{alumnus.bio}"
                    </p>
                  )}

                  {/* Skills tags */}
                  {alumnus.skills && alumnus.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {alumnus.skills.slice(0, 4).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                        >
                          {sk.name}
                        </span>
                      ))}
                      {alumnus.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{alumnus.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badges / Stats */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {alumnus.certificates_count} Verified Certs
                    </span>
                    <span className="font-extrabold text-[#02167f]">
                      {alumnus.lifetime_points} Lifetime Pts
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={`/portfolio/${alumnus.profile_slug}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition"
                  >
                    <span>View Public Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
