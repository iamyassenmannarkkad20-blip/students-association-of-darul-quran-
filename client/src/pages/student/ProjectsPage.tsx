import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { FolderGit2, Plus, Trash2, ExternalLink, Users } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  ON_HOLD: 'bg-amber-50 text-amber-700',
};

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', projectType: '', status: 'PLANNING',
    repositoryUrl: '', liveUrl: '', visibility: 'COMMUNITY'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await apiRequest('/students/projects');
    if (res.success && res.data) setProjects(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await apiRequest('/students/projects', { method: 'POST', body: JSON.stringify(form) });
    setSubmitting(false);
    if (res.success) {
      setShowForm(false);
      setForm({ title: '', description: '', projectType: '', status: 'PLANNING', repositoryUrl: '', liveUrl: '', visibility: 'COMMUNITY' });
      load();
    } else {
      setError(res.error || 'Failed to create project.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await apiRequest(`/students/projects/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl font-bold text-navy-900 flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-purple-600" /> Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and collaborate on student-led initiatives and projects.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">New Project</h3>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. SADQ Islamic Quiz App" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Project Type</label>
              <input value={form.projectType} onChange={e => setForm({...form, projectType: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="e.g. Technology, Research" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white">
                {['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Repository / Drive Link</label>
              <input value={form.repositoryUrl} onChange={e => setForm({...form, repositoryUrl: e.target.value})} type="url"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Live / Demo URL</label>
              <input value={form.liveUrl} onChange={e => setForm({...form, liveUrl: e.target.value})} type="url"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900" placeholder="https://..." />
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none h-20" placeholder="Describe your project..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-300 text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No projects yet</p>
          <p className="text-xs text-slate-400">Create your first student-led initiative.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                  {p.project_type && <p className="text-xs text-slate-500">{p.project_type}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-700'}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
              {p.description && <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>}
              <div className="flex flex-wrap gap-2 mt-auto">
                {p.repository_url && (
                  <a href={p.repository_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy-800 hover:text-navy-900 underline">
                    <ExternalLink className="w-3 h-3" /> Repository
                  </a>
                )}
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-navy-800 hover:text-navy-900 underline">
                    <ExternalLink className="w-3 h-3" /> Live Demo
                  </a>
                )}
              </div>
              <button onClick={() => handleDelete(p.id)}
                className="mt-1 self-end text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
