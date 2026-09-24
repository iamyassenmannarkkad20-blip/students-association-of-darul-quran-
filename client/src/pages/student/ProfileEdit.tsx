import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { User, Save, Eye, EyeOff } from 'lucide-react';

export const ProfileEdit: React.FC = () => {
  const { profile, refreshUser } = useAuth();
  const [form, setForm] = useState({
    displayName: '', bio: '', interests: '', profilePhotoUrl: '',
    is_public: true, show_email: false, show_whatsapp: false,
    show_talents: true, show_skills: true, show_achievements: true, show_projects: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.display_name || '',
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || ''),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      ...form,
      interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
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
        onClick={() => setForm(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }))}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form[fieldKey] ? 'bg-navy-900' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form[fieldKey] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
          <User className="w-6 h-6 text-navy-700" /> Profile & Privacy Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your public identity and what others can see on your portfolio.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
        {saved && <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl font-semibold">✅ Profile saved successfully!</p>}

        {/* Profile Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">Profile Information</h2>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
            <input value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="Your display name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-24" placeholder="A short bio about yourself..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Interests <span className="text-slate-400 font-normal">(comma separated)</span></label>
            <input value={form.interests} onChange={e => setForm({...form, interests: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Islamic Studies, Technology, Creative Writing" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Profile Photo URL</label>
            <input value={form.profilePhotoUrl} onChange={e => setForm({...form, profilePhotoUrl: e.target.value})} type="url"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="https://drive.google.com/... or image URL" />
            <p className="text-xs text-slate-400 mt-1">Paste a Google Drive public image URL or any publicly accessible image link.</p>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1">
          <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-navy-700" /> Privacy Settings
          </h2>
          <Toggle label="Public Portfolio (visible to everyone)" fieldKey="is_public" />
          <Toggle label="Show Email Address on Portfolio" fieldKey="show_email" />
          <Toggle label="Show WhatsApp Number on Portfolio" fieldKey="show_whatsapp" />
          <Toggle label="Show Creative Talents section" fieldKey="show_talents" />
          <Toggle label="Show Skills section" fieldKey="show_skills" />
          <Toggle label="Show Achievements section" fieldKey="show_achievements" />
          <Toggle label="Show Projects section" fieldKey="show_projects" />
        </div>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-gold-300 font-bold text-sm hover:bg-navy-800 transition-colors disabled:opacity-50 shadow-md">
          <Save className="w-4 h-4" />
          {saving ? 'Saving changes...' : 'Save Profile & Privacy'}
        </button>
      </form>
    </div>
  );
};
