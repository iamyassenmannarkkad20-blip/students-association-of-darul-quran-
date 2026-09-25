import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Shield, BookOpen, CheckCircle, XCircle, Plus, ExternalLink,
  Users, Check, AlertCircle, RefreshCw, Megaphone, UserCheck, ShieldAlert
} from 'lucide-react';

const OFFICIAL_UNITS = [
  { code: 'EB', name: 'Excellence Bureau' },
  { code: 'IA', name: 'Islamic Arts' },
  { code: 'MPW', name: 'Media & Publishing Wing' },
  { code: 'MB', name: 'Medical Board' },
  { code: 'LB', name: 'Literary Board' },
  { code: 'RW', name: 'Research Wing' },
  { code: 'CS', name: 'Campus Squad' },
  { code: 'DW', name: 'Da\'wah Wing' },
  { code: 'LIB', name: 'Library Board' },
  { code: 'SB', name: 'Samajam Board' },
];

const ROLES = ['STUDENT', 'TEACHER', 'ORGANISATION_ADMIN', 'ADMIN', 'SUPER_ADMIN'];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'magazines' | 'users' | 'announcement' | 'queue' | 'stats'>('users');

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Users
  const [usersList, setUsersList] = useState<any[]>([]);

  // Queue
  const [queue, setQueue] = useState<{ posts: any[]; articles: any[]; library: any[] }>({
    posts: [],
    articles: [],
    library: [],
  });

  // Magazines
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement
  const [announcementText, setAnnouncementText] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState<string | null>(null);

  // Assign Unit Form Modal
  const [selectedUserForUnit, setSelectedUserForUnit] = useState<any | null>(null);
  const [unitForm, setUnitForm] = useState({ unitCode: 'EB', roleInUnit: 'Member', position: 'Member' });
  const [assigningUnit, setAssigningUnit] = useState(false);

  // Magazine Form
  const [showMagForm, setShowMagForm] = useState(false);
  const [magForm, setMagForm] = useState({
    title: '',
    issue: '',
    description: '',
    coverImageUrl: '',
    pdfUrl: '',
    issuuUrl: '',
    publicationDate: new Date().toISOString().split('T')[0],
    pageCount: 1,
  });
  const [submittingMag, setSubmittingMag] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, magRes, usersRes, configRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/pending-queue'),
        apiRequest('/public/magazines'),
        apiRequest('/admin/users'),
        apiRequest('/public/config'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (magRes.success) setMagazines(magRes.data);
      if (usersRes.success) setUsersList(usersRes.data);
      if (configRes.success && configRes.data?.announcement) {
        setAnnouncementText(configRes.data.announcement);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Role
  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await apiRequest(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });

    if (res.success) {
      setActionNotice(`✅ User role updated to ${newRole}.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    } else {
      alert(res.error || 'Failed to update role.');
    }
  };

  // Assign Unit
  const handleAssignUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForUnit) return;

    setAssigningUnit(true);
    const res = await apiRequest('/admin/assign-unit', {
      method: 'POST',
      body: JSON.stringify({
        userId: selectedUserForUnit.id,
        unitCode: unitForm.unitCode,
        roleInUnit: unitForm.roleInUnit,
        position: unitForm.position,
      }),
    });

    setAssigningUnit(false);
    if (res.success) {
      setSelectedUserForUnit(null);
      setActionNotice(`✅ Student assigned to ${unitForm.unitCode} successfully.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    } else {
      alert(res.error || 'Failed to assign unit.');
    }
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementSuccess(null);

    const res = await apiRequest('/admin/announcement', {
      method: 'POST',
      body: JSON.stringify({ announcement: announcementText }),
    });

    setSavingAnnouncement(false);
    if (res.success) {
      setAnnouncementSuccess('✅ Announcement updated! It is now live on the Home page banner.');
      setTimeout(() => setAnnouncementSuccess(null), 4000);
    } else {
      alert(res.error || 'Failed to update announcement.');
    }
  };

  // Moderate Queue
  const handleModerate = async (entityType: string, entityId: string, action: 'APPROVE' | 'REJECT') => {
    const res = await apiRequest('/admin/moderate', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, action }),
    });

    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Moderation action failed.');
    }
  };

  // Handle Magazine
  const handleMagazineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingMag(true);

    const res = await apiRequest('/admin/magazines', {
      method: 'POST',
      body: JSON.stringify(magForm),
    });

    setSubmittingMag(false);
    if (res.success) {
      setShowMagForm(false);
      setActionNotice('✅ Magazine published successfully to public view!');
      setTimeout(() => setActionNotice(null), 3000);
      loadData();
    } else {
      alert(res.error || 'Failed to publish magazine.');
    }
  };

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-800">Access Restricted</h1>
        <p className="text-sm text-slate-600">
          This area is strictly restricted to SADQ Official Administrators.
        </p>
        <Link to="/login" className="inline-block mt-4 px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-semibold">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-800 border border-gold-300">
              {user.role}
            </span>
            <span className="text-xs text-slate-500 font-medium">Logged in as {user.fullName}</span>
          </div>
          <h1 className="font-cinzel text-3xl font-extrabold text-navy-950 mt-1 flex items-center gap-2">
            <Shield className="w-8 h-8 text-gold-500" />
            Institutional Admin Suite
          </h1>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'users' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Students & Roles ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'announcement' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4 text-gold-600" />
          Home Notice Banner
        </button>

        <button
          onClick={() => setActiveTab('magazines')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'magazines' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Magazines & Publications ({magazines.length})
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'queue' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Pending Approvals ({queue.posts.length + queue.articles.length + queue.library.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'stats' ? 'border-navy-900 text-navy-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Database Stats
        </button>
      </div>

      {/* TAB 1: USERS & 10 UNIT ASSIGNMENTS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-lg text-navy-900">Registered Students & Official Roles</h2>
              <p className="text-xs text-slate-500">
                Promote roles (Student, Teacher, Org Admin) and assign students to the 10 official units.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">System Role</th>
                    <th className="py-3.5 px-4">Assigned Units</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <span>{u.full_name || 'Anonymous Student'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 font-bold text-navy-900">
                        {u.class_code ? `Class ${u.class_code}` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-navy-900"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.units && u.units.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.units.map((unit: any) => (
                              <span
                                key={unit.unit_code}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-50 text-navy-900 border border-navy-200"
                              >
                                {unit.unit_code}: {unit.position || 'Member'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForUnit(u);
                            setUnitForm({ unitCode: 'EB', roleInUnit: 'Member', position: 'Member' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-[11px] shadow-sm transition-colors"
                        >
                          + Assign Unit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unit Assignment Modal */}
          {selectedUserForUnit && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleAssignUnitSubmit}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
              >
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-navy-900">Assign to Official Unit</h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong>{selectedUserForUnit.full_name || selectedUserForUnit.email}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Select Official Unit (10 Units)</label>
                  <select
                    value={unitForm.unitCode}
                    onChange={(e) => setUnitForm({ ...unitForm, unitCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                  >
                    {OFFICIAL_UNITS.map((u) => (
                      <option key={u.code} value={u.code}>
                        {u.code} — {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Role in Unit</label>
                  <select
                    value={unitForm.roleInUnit}
                    onChange={(e) => setUnitForm({ ...unitForm, roleInUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                  >
                    <option value="Executive">Executive</option>
                    <option value="Convener">Convener</option>
                    <option value="Editor">Editor</option>
                    <option value="Member">General Member</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Specific Position / Title</label>
                  <input
                    value={unitForm.position}
                    onChange={(e) => setUnitForm({ ...unitForm, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. President, General Secretary, Sub-editor"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={assigningUnit}
                    className="flex-1 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50"
                  >
                    {assigningUnit ? 'Saving...' : 'Confirm Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForUnit(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT NOTICE BANNER */}
      {activeTab === 'announcement' && (
        <form onSubmit={handleSaveAnnouncement} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-bold text-lg text-navy-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gold-600" />
              Live Home Page Notice Banner
            </h2>
            <p className="text-xs text-slate-500">
              Publish an urgent announcement or greeting message that will flash at the top of the Home page for all visitors.
            </p>
          </div>

          {announcementSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{announcementSuccess}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Announcement Text (Leave empty to hide the banner)
            </label>
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
              placeholder="e.g. 📢 Registrations are now open for the Annual SADQ Oratory & Debate Fest 2026. Submit your entries via the Create Center!"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingAnnouncement}
              className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50 shadow-md transition-all"
            >
              {savingAnnouncement ? 'Saving Notice...' : 'Save & Publish Banner'}
            </button>
            <button
              type="button"
              onClick={() => setAnnouncementText('')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Clear Notice
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: MAGAZINES MANAGEMENT */}
      {activeTab === 'magazines' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg text-navy-900">Official Magazines & Releases</h2>
              <p className="text-xs text-slate-500">
                Upload magazine details, link Google Drive PDF or Issuu reader, and publish directly.
              </p>
            </div>

            <button
              onClick={() => setShowMagForm(!showMagForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 shadow-md transition-all"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              {showMagForm ? 'Close Form' : 'Publish New Magazine'}
            </button>
          </div>

          {showMagForm && (
            <form
              onSubmit={handleMagazineSubmit}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-4"
            >
              <h3 className="font-cinzel text-lg font-bold text-navy-900">Publish Magazine Edition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Title *</label>
                  <input
                    required
                    value={magForm.title}
                    onChange={(e) => setMagForm({ ...magForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    placeholder="e.g. Al-Quran Souvenir 2026"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Issue *</label>
                  <input
                    required
                    value={magForm.issue}
                    onChange={(e) => setMagForm({ ...magForm, issue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    placeholder="e.g. Vol 01"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Google Drive PDF URL *</label>
                  <input
                    required
                    type="url"
                    value={magForm.pdfUrl}
                    onChange={(e) => setMagForm({ ...magForm, pdfUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submittingMag}
                className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs"
              >
                {submittingMag ? 'Publishing...' : 'Publish Magazine'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {magazines.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                    {m.issue}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description}</p>
                </div>
                {m.pdf_url && (
                  <a
                    href={m.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Drive Link
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENDING QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-navy-900">Content Moderation Queue</h2>
          {queue.posts.length === 0 && queue.articles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">All submissions approved!</p>
            </div>
          ) : (
            queue.posts.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">POST</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{p.title}</h3>
                  <p className="text-xs text-slate-500">By {p.author_name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate('post', p.id, 'APPROVE')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate('post', p.id, 'REJECT')}
                    className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: STATS */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-3xl font-extrabold text-navy-900">{stats?.totalUsers || 0}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Total Users</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-3xl font-extrabold text-navy-900">{stats?.totalStudents || 0}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Students</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="text-3xl font-extrabold text-gold-600">{stats?.organisationUnits || 10}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Official Units</div>
          </div>
        </div>
      )}
    </div>
  );
};
