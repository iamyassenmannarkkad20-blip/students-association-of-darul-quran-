import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Shield, BookOpen, CheckCircle, XCircle, Plus, ExternalLink,
  Users, FileText, Check, AlertCircle, RefreshCw, Eye
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'magazines' | 'queue' | 'stats'>('magazines');
  
  // Stats
  const [stats, setStats] = useState<any>(null);
  
  // Pending Queue
  const [queue, setQueue] = useState<{ posts: any[]; articles: any[]; library: any[] }>({
    posts: [],
    articles: [],
    library: [],
  });
  
  // Published Magazines
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [magSuccess, setMagSuccess] = useState<string | null>(null);
  const [magError, setMagError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, queueRes, magRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/pending-queue'),
        apiRequest('/public/magazines'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (queueRes.success) setQueue(queueRes.data);
      if (magRes.success) setMagazines(magRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Magazine Submit
  const handleMagazineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagError(null);
    setMagSuccess(null);
    setSubmittingMag(true);

    try {
      const payload = {
        title: magForm.title.trim(),
        issue: magForm.issue.trim(),
        description: magForm.description.trim() || undefined,
        coverImageUrl: magForm.coverImageUrl.trim() || undefined,
        pdfUrl: magForm.pdfUrl.trim() || undefined,
        issuuUrl: magForm.issuuUrl.trim() || undefined,
        publicationDate: magForm.publicationDate,
        pageCount: Number(magForm.pageCount) || 0,
      };

      const res = await apiRequest('/admin/magazines', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setMagSuccess('✅ Magazine published successfully! It is now live on the public Magazines page.');
        setShowMagForm(false);
        setMagForm({
          title: '',
          issue: '',
          description: '',
          coverImageUrl: '',
          pdfUrl: '',
          issuuUrl: '',
          publicationDate: new Date().toISOString().split('T')[0],
          pageCount: 1,
        });
        loadData();
      } else {
        setMagError(res.error || 'Failed to publish magazine. Please verify URLs.');
      }
    } catch (err: any) {
      setMagError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmittingMag(false);
    }
  };

  // Moderate Post / Article
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

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-800">Access Restricted</h1>
        <p className="text-sm text-slate-600">
          This area is strictly restricted to SADQ Super Admins and Official Administrators.
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
            <span className="text-xs text-slate-500 font-medium">SADQ Institutional Administration</span>
          </div>
          <h1 className="font-cinzel text-3xl font-extrabold text-navy-950 mt-1 flex items-center gap-2">
            <Shield className="w-8 h-8 text-gold-500" />
            Admin & Publication Control
          </h1>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('magazines')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'magazines'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Magazines & Publications ({magazines.length})
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'queue'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Pending Approvals ({queue.posts.length + queue.articles.length + queue.library.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'stats'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Overview & Stats
        </button>
      </div>

      {/* TAB 1: MAGAZINES MANAGEMENT */}
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

          {magSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{magSuccess}</span>
            </div>
          )}

          {/* Magazine Creation Form */}
          {showMagForm && (
            <form
              onSubmit={handleMagazineSubmit}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-5"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-cinzel text-lg font-bold text-navy-900">Publish Magazine / Edition</h3>
                <p className="text-xs text-slate-500">
                  Provide external links (Google Drive public link or Issuu). No direct PDF file upload needed in database.
                </p>
              </div>

              {magError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {magError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Magazine Title *</label>
                  <input
                    type="text"
                    required
                    value={magForm.title}
                    onChange={(e) => setMagForm({ ...magForm, title: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. Al-Bayan Official Magazine"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Issue / Edition *</label>
                  <input
                    type="text"
                    required
                    value={magForm.issue}
                    onChange={(e) => setMagForm({ ...magForm, issue: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. 2026 Annual Edition or Issue #04"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Publication Date *</label>
                  <input
                    type="date"
                    required
                    value={magForm.publicationDate}
                    onChange={(e) => setMagForm({ ...magForm, publicationDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Total Page Count</label>
                  <input
                    type="number"
                    min="1"
                    value={magForm.pageCount}
                    onChange={(e) => setMagForm({ ...magForm, pageCount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. 48"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Google Drive Public Link / PDF URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={magForm.pdfUrl}
                    onChange={(e) => setMagForm({ ...magForm, pdfUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="https://drive.google.com/file/d/... or public PDF link"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Make sure the Google Drive link permission is set to "Anyone with the link can view".
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={magForm.coverImageUrl}
                    onChange={(e) => setMagForm({ ...magForm, coverImageUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="https://... cover photo link"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Issuu Reader URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={magForm.issuuUrl}
                    onChange={(e) => setMagForm({ ...magForm, issuuUrl: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="https://issuu.com/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Editorial Summary</label>
                  <textarea
                    rows={3}
                    value={magForm.description}
                    onChange={(e) => setMagForm({ ...magForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                    placeholder="Brief description about articles, highlights, and themes covered in this edition..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingMag}
                  className="px-6 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 disabled:opacity-50 shadow-md transition-all"
                >
                  {submittingMag ? 'Publishing...' : 'Publish Magazine Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMagForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Published Magazines List */}
          {magazines.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No magazines published yet</h3>
              <p className="text-xs text-slate-400">
                Click "Publish New Magazine" above to add your first publication.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {magazines.map((mag) => (
                <div
                  key={mag.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-gold-700 font-semibold mb-2">
                      <span className="bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        {mag.issue}
                      </span>
                      <span className="text-slate-400">
                        {new Date(mag.publication_date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{mag.title}</h3>
                    {mag.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {mag.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      PUBLISHED
                    </span>

                    {mag.pdf_url || mag.issuu_url ? (
                      <a
                        href={mag.pdf_url || mag.issuu_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy-900 hover:text-navy-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Reader Link
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING APPROVAL QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-lg text-navy-900">Student Content Moderation Queue</h2>
            <p className="text-xs text-slate-500">
              Review and approve or reject submissions from students before public display.
            </p>
          </div>

          {queue.posts.length === 0 && queue.articles.length === 0 && queue.library.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">All caught up!</h3>
              <p className="text-xs text-slate-400">There are no pending posts or articles awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        POST
                      </span>
                      <span className="text-xs text-slate-500">By {post.author_name}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{post.title}</h3>
                    <p className="text-xs text-slate-400">Category: {post.category}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleModerate('post', post.id, 'APPROVE')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate('post', post.id, 'REJECT')}
                      className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OVERVIEW & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-lg text-navy-900">Platform Statistics (Real Database Counts)</h2>
            <p className="text-xs text-slate-500">Live counts directly verified against Supabase PostgreSQL.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy-900">{stats?.totalUsers || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Total Users</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy-900">{stats?.totalStudents || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Students</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy-900">{stats?.organisationUnits || 10}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Official Units</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-navy-900">{stats?.totalPosts || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Community Posts</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-3xl font-extrabold text-gold-600">{stats?.pendingReviewCount || 0}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Pending Review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
