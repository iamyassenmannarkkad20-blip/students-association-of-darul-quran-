import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { User, Save, Eye, Camera, Upload, Check, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  {
    name: 'SADQ Navy Shield',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Islamic Geometric Gold',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Arabic Calligraphy Emblem',
    url: 'https://images.unsplash.com/photo-1584281722572-c51954f9d146?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Darul Quran Scholar Badge',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80',
  },
];

export const ProfileEdit: React.FC = () => {
  const { profile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    interests: '',
    profilePhotoUrl: '',
    is_public: true,
    show_email: false,
    show_whatsapp: false,
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
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : profile.interests || '',
        profilePhotoUrl: profile.profile_photo_url || '',
        is_public: profile.is_public ?? true,
        show_email: profile.show_email ?? false,
        show_whatsapp: profile.show_whatsapp ?? false,
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

  // Select a preset avatar
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
      ...form,
      interests: form.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
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
        <p className="text-sm font-semibold text-slate-800">{label}</p>
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
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
          <User className="w-6 h-6 text-navy-700" /> Profile & Identity Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your photo, biographical details, and public portfolio privacy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">{error}</p>}
        {saved && (
          <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl font-semibold border border-emerald-200 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Changes saved successfully!
          </p>
        )}

        {/* Profile Picture Upload Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-gold-600" />
            Profile Picture & Avatar
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
                Choose a photo directly from your phone gallery or computer (JPG, PNG, WebP up to 5MB).
              </p>
            </div>
          </div>

          {/* Preset Avatars */}
          <div className="pt-3 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Or pick an official SADQ badge avatar:
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`p-1.5 rounded-xl border transition-all text-center group flex flex-col items-center gap-1 ${
                    form.profilePhotoUrl === preset.url
                      ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-400/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] text-slate-600 line-clamp-1">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">Biographical Information</h2>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-24"
              placeholder="A short bio about yourself, studies, or interests..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Interests <span className="text-slate-400 font-normal">(comma separated)</span>
            </label>
            <input
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              placeholder="e.g. Islamic Studies, Technology, Creative Writing, Calligraphy"
            />
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
          <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-navy-700" /> Privacy & Visibility Toggles
          </h2>
          <Toggle label="Public Portfolio (Visible on discovery & direct link)" fieldKey="is_public" />
          <Toggle label="Show Email Address on Portfolio" fieldKey="show_email" />
          <Toggle label="Show WhatsApp Number on Portfolio" fieldKey="show_whatsapp" />
          <Toggle label="Show Creative Talents section" fieldKey="show_talents" />
          <Toggle label="Show Skills & Proficiency section" fieldKey="show_skills" />
          <Toggle label="Show Verified Achievements section" fieldKey="show_achievements" />
          <Toggle label="Show Student Projects section" fieldKey="show_projects" />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-gold-300 font-bold text-sm hover:bg-navy-800 transition-colors disabled:opacity-50 shadow-md"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Profile & Privacy'}
        </button>
      </form>
    </div>
  );
};
