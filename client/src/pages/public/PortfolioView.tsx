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
  Printer,
  X,
  ShieldCheck,
  QrCode,
  Globe,
  Share2,
  Trophy,
} from 'lucide-react';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { ShareModal } from '../../components/ShareModal';
import { StudentGrowthTimeline } from '../../components/StudentGrowthTimeline';
import { DigitalIdCard } from '../../components/DigitalIdCard';

export const PortfolioView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);


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

  const { profile, talents, skills, achievements, projects, organisation, score, honors, certificates, growth_timeline } = data;

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
              {profile.classCode === 'ALUMNI' ? (
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-300">
                  🎓 Graduated Alumni {profile.graduationYear ? `(${profile.graduationYear})` : ''}
                </span>
              ) : (
                <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-300">
                  Class {profile.classCode}
                </span>
              )}

              {/* Leadership Role Badges */}
              {profile.leadershipRoles && profile.leadershipRoles.map((role: any, idx: number) => (
                <span
                  key={idx}
                  className="text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs"
                >
                  ⭐ {role.title}
                </span>
              ))}
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
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              {/* Instagram */}
              {profile.show_instagram && profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:opacity-95 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>@{profile.instagram_handle.replace('@', '')}</span>
                </a>
              )}

              {/* WhatsApp */}
              {profile.show_whatsapp && (profile.whatsapp_number || profile.phone_number) && (
                <a
                  href={`https://wa.me/${(profile.whatsapp_number || profile.phone_number).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalamu Alaikum ${profile.fullName}, I saw your student portfolio on the SADQ Platform and would like to connect with you.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-105"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Connect on WhatsApp</span>
                </a>
              )}

              {/* Email */}
              {profile.show_email && profile.email_contact && (
                <a
                  href={`mailto:${profile.emailContact || profile.email_contact}?subject=${encodeURIComponent(
                    `Connecting via SADQ Platform — ${profile.fullName}`
                  )}&body=${encodeURIComponent(
                    `Assalamu Alaikum ${profile.fullName},\n\nI saw your public student portfolio on the SADQ Platform and would like to get in touch regarding your work/skills.\n\nBest regards.`
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-gold-300 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                >
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  <span>Send Email</span>
                </a>
              )}

              {/* Website */}
              {profile.website_url && (
                <a
                  href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Portfolio Site</span>
                </a>
              )}

              {/* Digital Student ID Card Trigger */}
              <button
                type="button"
                onClick={() => setShowIdCard(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-400 hover:bg-gold-300 text-navy-950 text-xs font-bold shadow-sm transition-all hover:scale-105"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Digital Student ID</span>
              </button>

              {/* Share Profile & QR Trigger */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-gold-300 border border-gold-400/40 text-xs font-bold shadow-sm transition-all hover:scale-105"
              >
                <Share2 className="w-3.5 h-3.5 text-gold-400" />
                <span>Share & QR</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Academy Performance & Trophy Showcase */}
      <div className="bg-gradient-to-r from-[#02167f] via-[#031d96] to-[#010e52] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#ffd014]/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd014] text-[#02167f] text-[10px] font-black uppercase tracking-wider">
              <Trophy className="w-3 h-3 text-[#02167f]" />
              <span>SADQ Academy Performance Record</span>
            </div>
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-white">
              Official Star Score & Trophy Shelf
            </h2>
            <p className="text-xs text-blue-100/70">
              Verified competition points, awards, and contributions to Class {profile.classCode} Championship.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-center">
              <span className="text-[10px] text-amber-200 uppercase font-bold block">Standing</span>
              <span className="text-xl font-black text-[#ffd014]">
                {score?.rank ? `Rank #${score.rank}` : 'Unranked'}
              </span>
            </div>

            <div className="px-5 py-2.5 rounded-2xl bg-[#ffd014] text-[#02167f] text-center shadow-lg">
              <span className="text-[10px] uppercase font-black block tracking-wider">Academy Score</span>
              <span className="text-2xl font-black leading-none">{score?.total_points || 0} PTS</span>
            </div>
          </div>
        </div>

        {/* Trophies & Medal Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥇</span>
            <div className="font-black text-lg text-white">{score?.first_places || 0}</div>
            <span className="text-[10px] font-bold text-amber-300 uppercase">First Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥈</span>
            <div className="font-black text-lg text-white">{score?.second_places || 0}</div>
            <span className="text-[10px] font-bold text-slate-300 uppercase">Second Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">🥉</span>
            <div className="font-black text-lg text-white">{score?.third_places || 0}</div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">Third Prizes</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-xl block mb-1">📜</span>
            <div className="font-black text-lg text-white">{certificates?.length || 0}</div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase">Verified Certs</span>
          </div>
        </div>
      </div>

      {/* Verified Certificates Locker Section */}
      {certificates && certificates.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Official Credentials</span>
              </div>
              <h2 className="font-cinzel text-xl font-bold text-slate-900 mt-0.5">
                Verified Award Certificates ({certificates.length})
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
              Publicly Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert: any) => (
              <div
                key={cert.certificate_id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-[#02167f] transition-all bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-black text-[#02167f] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                      {cert.certificate_id}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{cert.verification_status || 'VERIFIED'}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {cert.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Issuer: <strong className="text-slate-700">{cert.issuer}</strong></div>
                    <div>Issued: <span className="text-slate-600">{new Date(cert.issue_date).toLocaleDateString()}</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {cert.external_reference_url ? (
                    <a
                      href={cert.external_reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#02167f] text-[#ffd014] hover:bg-[#0320a6] text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View & Download Certificate</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Digital Archive Verified</span>
                  )}

                  <Link
                    to={`/certificates`}
                    className="text-[11px] font-bold text-slate-500 hover:text-[#02167f]"
                    title="Verify on central registry"
                  >
                    Verify Credential →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competition Honors & Events Won */}
      {honors && honors.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-cinzel text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Competition Honors & Campus Events ({honors.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official places won across Sub-Wing and Main Committee competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {honors.map((h: any) => (
              <div key={h.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {h.position === 1 ? '🥇 1st Place' : h.position === 2 ? '🥈 2nd Place' : h.position === 3 ? '🥉 3rd Place' : 'Participant'}
                  </span>
                  <span className="text-[11px] font-bold text-[#02167f] bg-navy-50 px-2 py-0.5 rounded">
                    +{h.class_points} PTS
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{h.event_title}</h4>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span>{h.organizer_name}</span>
                  <span>{new Date(h.program_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Growth & Leadership Timeline */}
      <StudentGrowthTimeline
        events={growth_timeline || []}
        studentName={profile.fullName}
      />

      {showIdCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gold-500/40 space-y-6 relative animate-scale-up">
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Aesthetic Navy & Gold Student ID Badge */}
            <div className="rounded-2xl bg-gradient-to-b from-[#0B1B3D] via-[#0E234E] to-[#071026] text-white p-6 border-2 border-gold-400 shadow-xl relative overflow-hidden">
              {/* Subtle watermark */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <ShieldCheck className="w-48 h-48 text-gold-400" />
              </div>

              {/* Academy Header */}
              <div className="text-center pb-4 border-b border-gold-500/30 space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-gold-400 block">
                  Students Association of Darul Quran
                </span>
                <h4 className="font-cinzel text-xs font-extrabold tracking-wider text-white">
                  STUDENT IDENTITY CARD
                </h4>
              </div>

              {/* Photo & Details */}
              <div className="pt-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gold-400 bg-navy-950 shrink-0 flex items-center justify-center">
                  {profile.profilePhotoUrl ? (
                    <img src={profile.profilePhotoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gold-300" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">{profile.fullName}</h3>
                  <div className="inline-block px-2 py-0.5 rounded bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-bold">
                    Class {profile.classCode}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">ID: {profile.profileSlug}</p>
                </div>
              </div>

              {/* Assigned Units */}
              {organisation && organisation.length > 0 && (
                <div className="pt-3 mt-3 border-t border-gold-500/20">
                  <span className="text-[9px] text-gold-400 font-semibold uppercase block mb-1">Official Wings:</span>
                  <div className="flex flex-wrap gap-1">
                    {organisation.map((org: any) => (
                      <span key={org.unit_code} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                        {org.unit_code} ({org.position || org.role_in_unit})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Stamp */}
              <div className="mt-4 pt-3 border-t border-gold-500/30 flex items-center justify-between text-[9px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VERIFIED STUDENT
                </span>
                <span>SADQ Official</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save ID</span>
              </button>
              <button
                type="button"
                onClick={() => setShowIdCard(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="space-y-3">
              {skills.map((s: any) => {
                const prof = (s.proficiency || 'BEGINNER').toUpperCase();
                const pct = prof === 'EXPERT' ? 100 : prof === 'ADVANCED' ? 80 : prof === 'INTERMEDIATE' ? 55 : 30;
                const barColor =
                  prof === 'EXPERT'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : prof === 'ADVANCED'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500'
                    : prof === 'INTERMEDIATE'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-slate-400 to-slate-300';

                return (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{s.skill_name}</span>
                      <span className="text-[10px] font-black text-navy-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {prof}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
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

      {/* Share & QR Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={profile.fullName}
        subtitle={`Class ${profile.classCode} • SADQ Student Portfolio`}
        url={window.location.href}
      />

      {/* Digital Student ID Card Modal */}
      {showIdCard && (
        <DigitalIdCard
          student={{
            fullName: profile.fullName,
            username: profile.profileSlug,
            classCode: profile.classCode,
            graduationYear: profile.graduationYear,
            profileSlug: profile.profileSlug,
            profilePhotoUrl: profile.profilePhotoUrl,
            userId: data.profile?.user_id,
          }}
          onClose={() => setShowIdCard(false)}
        />
      )}
    </div>
  );
};
