import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Sparkles,
  User,
  ArrowRight,
  Filter,
  GraduationCap,
  ShieldCheck,
  Award,
  Layers,
  MessageSquare,
  Mail,
  Share2,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { ShareModal } from '../../components/ShareModal';
import { InstagramIcon } from '../../components/icons/InstagramIcon';

const SKILL_CATEGORIES = [
  'All Talents & Skills',
  'Arabic Calligraphy',
  'Public Speaking & Oratory',
  'Quran & Tajweed',
  'Creative Writing',
  'Islamic Research',
  'Graphic Design & Media',
  'Web & Technology',
];

const CLASS_CODES = ['01', '02', '03', '04', '05', '06', '07', '08'];

export const TalentDiscovery: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Talents & Skills');
  const [shareTarget, setShareTarget] = useState<any | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedClass) params.append('classCode', selectedClass);
      if (selectedCategory && selectedCategory !== 'All Talents & Skills') {
        params.append('talent', selectedCategory);
      }

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
  }, [search, selectedClass, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#02167f] text-[#ffd014] text-xs font-bold uppercase tracking-wider shadow">
          <Compass className="w-3.5 h-3.5 text-[#ffd014]" />
          <span>Talent & Peer Connect Hub</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-navy-950">
          Student Talents & Peer Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Discover verified talents, graded skills, and public portfolios across Classes 01 to 08. Connect directly with talented peers for academy projects and collaborative initiatives.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, @username, skill, or bio..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#02167f] focus:border-[#02167f]"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#02167f] bg-white cursor-pointer"
            >
              <option value="">All Batches (Classes 01–08)</option>
              {CLASS_CODES.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>

            {(search || selectedClass || selectedCategory !== 'All Talents & Skills') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedClass('');
                  setSelectedCategory('All Talents & Skills');
                }}
                className="px-3.5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[11px]">
            Disciplines:
          </span>
          {SKILL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#02167f] text-[#ffd014] shadow-md shadow-[#02167f]/20 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="text-center py-24 text-slate-400 text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02167f] mx-auto mb-3" />
          Loading student talent profiles...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto space-y-3">
          <Sparkles className="w-12 h-12 text-gold-400 mx-auto" />
          <h3 className="font-cinzel font-bold text-slate-900 text-lg">
            No student profiles match your search
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, class filter, or skill categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const portfolioUrl = `${window.location.origin}/portfolio/${student.profile_slug}`;
            const subWingRole =
              student.sub_wings_leadership && student.sub_wings_leadership.length > 0
                ? student.sub_wings_leadership[0]
                : null;

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#ffd014]/60 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Card: Avatar + Name + Badges */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#ffd014] bg-navy-950 shrink-0 flex items-center justify-center text-white shadow-md">
                      {student.profile_photo_url ? (
                        <img
                          src={student.profile_photo_url}
                          alt={student.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-[#ffd014]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base truncate">
                          {student.display_name || student.full_name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>

                      {student.username && (
                        <span className="text-xs font-bold text-gold-700 block">
                          @{student.username}
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {student.class_code && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded-md border border-navy-200">
                            <GraduationCap className="w-3 h-3 text-navy-700" />
                            Class {student.class_code}
                          </span>
                        )}

                        {subWingRole && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#02167f] bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            <Award className="w-3 h-3 text-amber-700" />
                            {subWingRole.code} {subWingRole.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {student.bio}
                    </p>
                  )}

                  {/* Graded Skills Section */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#02167f]" />
                        <span>Graded Skills:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {student.skills.slice(0, 3).map((sk: any) => (
                          <span
                            key={sk.id || sk.skill_name || sk.name}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                              sk.proficiency === 'EXPERT'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : sk.proficiency === 'ADVANCED'
                                ? 'bg-blue-50 text-blue-900 border-blue-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {sk.name || sk.skill_name}
                            {sk.proficiency && (
                              <span className="opacity-70 font-semibold ml-1">
                                • {sk.proficiency.charAt(0) + sk.proficiency.slice(1).toLowerCase()}
                              </span>
                            )}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{student.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Talents Tags */}
                  {student.talents && student.talents.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-gold-600" />
                        <span>Talents:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {student.talents.slice(0, 3).map((t: any) => (
                          <span
                            key={t.id || t.title}
                            className="text-[10px] font-semibold text-gold-800 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full"
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer: Connect & Share */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Direct Connect: WhatsApp or Private Badge */}
                    {student.whatsapp_number ? (
                      <a
                        href={`https://wa.me/${student.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Assalamu Alaikum ${student.full_name}, I saw your talent profile on the SADQ Student Platform and would like to connect!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-semibold"
                        title="Contact number is kept private by student"
                      >
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Contact Private</span>
                      </span>
                    )}

                    {/* Email Direct Trigger */}
                    {student.email_contact && (
                      <a
                        href={`mailto:${student.email_contact}?subject=${encodeURIComponent(
                          `Connecting via SADQ Platform — ${student.full_name}`
                        )}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-navy-900 hover:text-gold-300 text-slate-700 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Instagram Trigger if present */}
                    {student.instagram_handle && (
                      <a
                        href={`https://instagram.com/${student.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-gradient-to-r hover:from-pink-600 hover:to-amber-500 hover:text-white text-slate-700 transition-colors"
                        title="Instagram Profile"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Share Profile Button */}
                    <button
                      onClick={() => setShareTarget(student)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 transition-colors ml-auto"
                      title="Share Student Profile (QR & WhatsApp)"
                    >
                      <Share2 className="w-3.5 h-3.5 text-gold-600" />
                    </button>
                  </div>

                  {/* View Full Portfolio Button */}
                  <Link
                    to={`/portfolio/${student.profile_slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-[#ffd014] text-slate-800 text-xs font-bold transition-all shadow-sm group-hover:bg-[#02167f] group-hover:text-[#ffd014]"
                  >
                    <span>View Public Portfolio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Share Modal */}
      {shareTarget && (
        <ShareModal
          isOpen={!!shareTarget}
          onClose={() => setShareTarget(null)}
          title={shareTarget.full_name}
          subtitle={`Student Profile • Class ${shareTarget.class_code || 'Academy'}`}
          url={`${window.location.origin}/portfolio/${shareTarget.profile_slug}`}
        />
      )}
    </div>
  );
};
