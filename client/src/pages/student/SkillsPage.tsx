import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Layers, Plus, Trash2 } from 'lucide-react';

const PROFICIENCIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
const PROFICIENCY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-slate-100 text-slate-700',
  INTERMEDIATE: 'bg-blue-50 text-blue-700',
  ADVANCED: 'bg-emerald-50 text-emerald-700',
  EXPERT: 'bg-gold-50 text-gold-700',
};

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ skillName: '', proficiency: 'BEGINNER' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = async () => {
    const res = await apiRequest('/students/skills');
    if (res.success && res.data) setSkills(res.data);
    setLoading(false);
  };

  useEffect(() => { loadSkills(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await apiRequest('/students/skills', { method: 'POST', body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.success) {
      setShowForm(false);
      setForm({ skillName: '', proficiency: 'BEGINNER' });
      loadSkills();
    } else {
      setError(res.error || 'Failed to add skill.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    await apiRequest(`/students/skills/${id}`, { method: 'DELETE' });
    loadSkills();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" /> Skills & Proficiency
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track your skills from Beginner to Expert level.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">New Skill Entry</h3>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Skill Name *</label>
              <input value={form.skillName} onChange={e => setForm({...form, skillName: e.target.value})} required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Public Speaking" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Proficiency Level</label>
              <select value={form.proficiency} onChange={e => setForm({...form, proficiency: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
                {PROFICIENCIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50">
              {submitting ? 'Saving...' : 'Add Skill'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading skills...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No skills recorded yet</p>
          <p className="text-xs text-slate-400">Add skills with honest proficiency levels.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="font-semibold text-slate-900 text-sm">{s.skill_name}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${PROFICIENCY_COLORS[s.proficiency] || 'bg-slate-100 text-slate-700'}`}>
                {s.proficiency}
              </span>
              <button onClick={() => handleDelete(s.id)} className="text-slate-300 hover:text-red-400 transition-colors ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
