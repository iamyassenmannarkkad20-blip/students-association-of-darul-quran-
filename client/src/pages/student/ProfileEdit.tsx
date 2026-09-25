import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  User,
  Save,
  Eye,
  Camera,
  Upload,
  Check,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { SADQ_BADGE_AVATARS } from '../../constants/avatars';

export const ProfileEdit: React.FC = () => {
  const { profile, user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    interests: '',
    profilePhotoUrl: '',
    whatsapp_number: '',
    phone_number: '',
    email_contact: '',
    instagram_handle: '',
    website_url: '',
    is_public: true,
    show_email: false,
    show_whatsapp: false,
    show_instagram: true,
    show_talents: true,
    show_skills: true,
    show_achievements: true,
    show_projects: true,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.full_name || profile.display_name || '',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || '',
        profilePhotoUrl: profile.profile_photo_url || '',
        whatsapp_number: profile.whatsapp_number || '',
        phone_number: profile.phone_number || '',
        email_contact: profile.email_contact || '',
        instagram_handle: profile.instagram_handle || '',
        website_url: profile.website_url || '',
        is_public: profile.is_public ?? true,
        show_email: profile.show_email ?? false,
        show_whatsapp: profile.show_whatsapp ?? false,
        show_instagram: profile.show_instagram ?? true,
        show_talents: profile.show_talents ?? true,
        show_skills: profile.show_skills ?? true,
        show_achievements: profile.show_achievements ?? true,
        show_projects: profile.show_projects ?? true,
      });
    }
  }, [profile]);

  // Handle direct file upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await apiRequest('/students/avatar', {
          method: 'POST',
          body: JSON.stringify({ imageBase64: base64 }),
        });

        if (res.success && res.data?.profilePhotoUrl) {
          setForm((prev) => ({ ...prev, profilePhotoUrl: res.data.profilePhotoUrl }));
          await refreshUser();
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          setError(res.error || 'Failed to upload photo.');
        }
      } catch (err: any) {
        setError(err.message || 'Error uploading file.');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select an official Islamic badge avatar
  const handleSelectPreset = async (url: string) => {
    setUploadingPhoto(true);
    setError(null);
    try {
      const res = await apiRequest('/students/avatar', {
        method: 'POST',
        body: JSON.stringify({ presetUrl: url }),
      });
      if (res.success) {
        setForm((prev) => ({ ...prev, profilePhotoUrl: url }));
        await refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set avatar.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      bio: form.bio,
      interests: form.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      profilePhotoUrl: form.profilePhotoUrl,
      whatsappNumber: form.whatsapp_number,
      phoneNumber: form.phone_number,
      emailContact: form.email_contact,
      instagramHandle: form.instagram_handle.replace('@', '').trim(),
      websiteUrl: form.website_url.trim(),
      isPublic: form.is_public,
      showEmail: form.show_email,
      showWhatsapp: form.show_whatsapp,
      showInstagram: form.show_instagram,
      showTalents: form.show_talents,
      showSkills: form.show_skills,
      showAchievements: form.show_achievements,
      showProjects: form.show_projects,
    };
    const res = await apiRequest('/students/profile', { method: 'PATCH', body: JSON.stringify(payload) });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(res.error || 'Failed to save profile.');
    }
  };

  const Toggle = ({ label, fieldKey }: { label: string; fieldKey: keyof typeof form }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-800">{label}</p>
      </div>
      <button
        type="button"
        onClick={() => setForm((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }))}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          form[fieldKey] ? 'bg-navy-900' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            form[fieldKey] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <User className="w-6 h-6 text-navy-700" /> Profile & Identity Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize your avatar, social channels, and public student portfolio privacy.
          </p>
        </div>
        {user?.username && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-navy-900 text-xs font-bold self-start">
            <span className="text-gold-600">@</span>
            <span>{user.username}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200 font-medium">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-xs text-emerald-800 bg-emerald-50 p-3.5 rounded-xl font-semibold border border-emerald-200 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Profile and contact settings saved successfully!
          </p>
        )}

        {/* 1. Profile Picture & Official Islamic Badges */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-gold-600" />
            Profile Picture & Official Islamic Badges
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Current Avatar Preview */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-400 bg-navy-900 flex items-center justify-center text-white shadow-md">
                {form.profilePhotoUrl ? (
                  <img
                    src={form.profilePhotoUrl}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gold-300" />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-gold-400" />
                {uploadingPhoto ? 'Uploading Photo...' : 'Upload Photo from Device'}
              </button>

              <p className="text-[11px] text-slate-400">
                Choose your photo from your phone or PC (JPG, PNG, WebP up to 5MB).
              </p>
            </div>
          </div>

          {/* Official Islamic Badges (Zero Women/Human Stock Photos) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                Pick an official Islamic & Darul Quran badge avatar:
              </label>
              <span className="text-[10px] text-gold-700 bg-gold-50 px-2 py-0.5 rounded-full font-semibold border border-gold-200">
                100% Modest & Geometric
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SADQ_BADGE_AVATARS.map((badge) => {
                const isSelected = form.profilePhotoUrl === badge.svgDataUri;
                return (
                  <button
                    type="button"
                    key={badge.id}
                    onClick={() => handleSelectPreset(badge.svgDataUri)}
                    title={badge.name}
                    className={`p-2 rounded-2xl border transition-all text-center group flex flex-col items-center gap-1.5 relative ${
                      isSelected
                        ? 'border-gold-500 bg-gold-50/70 ring-2 ring-gold-400/40 shadow-sm scale-105'
                        : 'border-slate-200 hover:border-gold-300 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={badge.svgDataUri}
                      alt={badge.name}
                      className="w-12 h-12 rounded-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-bold text-slate-700 line-clamp-1 leading-tight">
                      {badge.name.replace('Darul Quran ', '')}
                    </span>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center text-[9px] font-black shadow">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Biographical Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-navy-700" />
            Biographical Information
          </h2>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name / Display Name</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. Hafiz Yaseen Mannarkkad"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Bio / Profile Summary</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-24"
              placeholder="A short bio about your academic focus, Quranic studies, or talents..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Interests <span className="text-slate-400 font-normal">(comma separated)</span>
            </label>
            <input
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. Qira'at, Arabic Calligraphy, Islamic History, Web Tech"
            />
          </div>
        </div>

        {/* 3. Contact Details & Social Profiles (NEW) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Contact & Social Channels
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Optional</span>
          </div>

          <p className="text-xs text-slate-500">
            Provide the contact options you would like to make accessible on your public student profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Number
              </label>
              <input
                type="text"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Direct Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-navy-600" />
                Alternative Phone Number
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            {/* Contact Email / Gmail */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-500" />
                Contact Gmail / Email
              </label>
              <input
                type="email"
                value={form.email_contact}
                onChange={(e) => setForm({ ...form, email_contact: e.target.value })}
                placeholder="student.quran@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                Instagram ID / Handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  value={form.instagram_handle}
                  onChange={(e) => setForm({ ...form, instagram_handle: e.target.value.replace('@', '') })}
                  placeholder="username"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-600"
                />
              </div>
            </div>
          </div>

          {/* Personal Website */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Personal Website / Portfolio Link
            </label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              placeholder="https://myportfolio.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* 4. Privacy & Visibility Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
          <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-navy-700" /> Privacy & Visibility Toggles
          </h2>
          <Toggle label="Public Portfolio (Visible on discovery & direct link)" fieldKey="is_public" />
          <Toggle label="Show Instagram Profile on Public Portfolio" fieldKey="show_instagram" />
          <Toggle label="Show WhatsApp / Phone Number on Portfolio" fieldKey="show_whatsapp" />
          <Toggle label="Show Contact Email Address on Portfolio" fieldKey="show_email" />
          <Toggle label="Show Creative Talents Section" fieldKey="show_talents" />
          <Toggle label="Show Skills & Proficiency Section" fieldKey="show_skills" />
          <Toggle label="Show Verified Achievements Section" fieldKey="show_achievements" />
          <Toggle label="Show Student Projects Section" fieldKey="show_projects" />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-sm hover:bg-navy-800 transition-colors disabled:opacity-50 shadow-md"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Profile & Settings'}
        </button>
      </form>
    </div>
  );
};
