import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import {
  User,
  Award,
  Sparkles,
  Layers,
  FolderGit2,
  Lock,
  MessageSquare,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortfolio() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      const res = await apiRequest(`/public/portfolio/${slug}`);
      setLoading(false);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to load portfolio.');
      }
    }
    loadPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Loading student growth portfolio...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-cinzel text-xl font-bold text-slate-800">Private Profile</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'This student growth portfolio is either private or does not exist.'}
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { profile, talents, skills, achievements, projects, organisation } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={profile.fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-gold-400/50 shadow-md"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center border-2 border-gold-400/50 shadow-md">
              <User className="w-12 h-12" />
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-navy-900">
                {profile.fullName}
              </h1>
              <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-300">
                Class {profile.classCode}
              </span>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Interests Pills */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {profile.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{interest}
                  </span>
                ))}
              </div>
            )}

            {/* Direct Contact Buttons if enabled */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {profile.whatsappNumber && (
                <a
                  href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalamu Alaikum ${profile.fullName}, I saw your student portfolio on the SADQ Platform and would like to connect with you.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Connect on WhatsApp</span>
                </a>
              )}
              {profile.emailContact && (
                <a
                  href={`mailto:${profile.emailContact}?subject=${encodeURIComponent(
                    `Connecting via SADQ Platform — ${profile.fullName}`
                  )}&body=${encodeURIComponent(
                    `Assalamu Alaikum ${profile.fullName},\n\nI saw your public student portfolio on the SADQ Platform and would like to get in touch regarding your work/skills.\n\nBest regards.`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Talents & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Talents */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-cinzel text-lg font-bold text-navy-900 flex items-center gap-2 border-b pb-3">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <span>Creative Talents ({talents.length})</span>
          </h2>
          {talents.length === 0 ? (
            <p className="text-xs text-slate-400">No talents published publicly.</p>
          ) : (
            <div className="space-y-3">
              {talents.map((t: any) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">{t.title}</h3>
                    <span className="text-[9px] font-bold text-navy-800 bg-navy-100 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-cinzel text-lg font-bold text-navy-900 flex items-center gap-2 border-b pb-3">
            <Layers className="w-5 h-5 text-gold-500" />
            <span>Skills & Proficiencies ({skills.length})</span>
          </h2>
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400">No skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s: any) => (
                <div
                  key={s.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                >
                  <span className="font-medium text-slate-800">{s.skill_name}</span>
                  <span className="text-[9px] font-bold text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded uppercase">
                    {s.proficiency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-cinzel text-lg font-bold text-navy-900 flex items-center gap-2 border-b pb-3">
          <FolderGit2 className="w-5 h-5 text-gold-500" />
          <span>Projects & Initiatives ({projects.length})</span>
        </h2>
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400">No public projects available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p: any) => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h3 className="font-bold text-slate-900 text-sm">{p.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.description}</p>
                {p.project_url && (
                  <a
                    href={p.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy-900 hover:text-gold-600 font-semibold mt-3"
                  >
                    <span>View Project Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Organisation Leadership */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-cinzel text-lg font-bold text-navy-900 flex items-center gap-2 border-b pb-3">
          <Award className="w-5 h-5 text-gold-500" />
          <span>Organisational Roles & Leadership ({organisation.length})</span>
        </h2>
        {organisation.length === 0 ? (
          <p className="text-xs text-slate-400">No organisational roles recorded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {organisation.map((org: any, i: number) => (
              <div key={i} className="p-4 bg-navy-50/50 rounded-xl border border-navy-100">
                <span className="text-[10px] font-bold text-navy-900 bg-white px-2 py-0.5 rounded border border-navy-200">
                  Unit: {org.unit_code} — {org.unit_name}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{org.designation}</h3>
                {org.is_leadership && (
                  <span className="inline-block mt-1 text-[10px] font-semibold text-gold-700 bg-gold-100 px-2 py-0.5 rounded">
                    Official Leadership
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
