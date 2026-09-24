import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Award, Plus, Trash2, Calendar } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', achievementDate: '', issuer: '', visibility: 'COMMUNITY' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await apiRequest('/students/achievements');
    if (res.success && res.data) setAchievements(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await apiRequest('/students/achievements', { method: 'POST', body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.success) {
      setShowForm(false);
      setForm({ title: '', description: '', category: '', achievementDate: '', issuer: '', visibility: 'COMMUNITY' });
      load();
    } else {
      setError(res.error || 'Failed to add achievement.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    await apiRequest(`/students/achievements/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" /> Achievements
          </h1>
          <p className="text-sm text-slate-500 mt-1">Log verified milestones, awards, and recognitions.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">New Achievement</h3>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. First Prize in Oratory Competition" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Literary Arts" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Issuer / Authority</label>
              <input value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. SADQ Literary Board" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Achievement Date</label>
              <input type="date" value={form.achievementDate} onChange={e => setForm({...form, achievementDate: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Visibility</label>
              <select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
                {['PRIVATE', 'COMMUNITY', 'PUBLIC'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-16" placeholder="Brief details about this achievement..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Achievement'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No achievements logged yet</p>
          <p className="text-xs text-slate-400">Add your verified awards and milestones.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                  {a.category && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{a.category}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
                  {a.issuer && <span>By <strong>{a.issuer}</strong></span>}
                  {a.achievement_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.achievement_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {a.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{a.description}</p>}
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
