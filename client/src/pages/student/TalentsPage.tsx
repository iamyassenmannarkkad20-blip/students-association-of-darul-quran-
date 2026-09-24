import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Sparkles, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const VISIBILITY_OPTIONS = ['PRIVATE', 'COMMUNITY', 'PUBLIC'] as const;

export const TalentsPage: React.FC = () => {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', visibility: 'COMMUNITY' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTalents = async () => {
    const res = await apiRequest('/students/talents');
    if (res.success && res.data) setTalents(res.data);
    setLoading(false);
  };

  useEffect(() => { loadTalents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await apiRequest('/students/talents', { method: 'POST', body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.success) {
      setShowForm(false);
      setForm({ title: '', category: '', description: '', visibility: 'COMMUNITY' });
      loadTalents();
    } else {
      setError(res.error || 'Failed to add talent.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this talent?')) return;
    await apiRequest(`/students/talents/${id}`, { method: 'DELETE' });
    loadTalents();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-500" /> Creative Talents
          </h1>
          <p className="text-sm text-slate-500 mt-1">Showcase your natural gifts and areas of creative excellence.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Talent
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">New Talent Entry</h3>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Arabic Calligraphy" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Islamic Arts" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-20" placeholder="Briefly describe this talent..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Visibility</label>
            <select value={form.visibility} onChange={e => setForm({...form, visibility: e.target.value})}
              className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
              {VISIBILITY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : 'Add Talent'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading talents...</div>
      ) : talents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No talents added yet</p>
          <p className="text-xs text-slate-400">Click "Add Talent" above to showcase your creative abilities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {talents.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                  <span className="text-[10px] font-bold text-navy-900 bg-navy-50 px-2 py-0.5 rounded border border-navy-200">{t.category}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{t.visibility}</span>
                </div>
                {t.description && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{t.description}</p>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
