import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Award, Plus, Trash2, ExternalLink, Edit3, CheckCircle2,
  BookOpen, Video, FolderGit2, Image as ImageIcon, FileText, ArrowLeft,
  Sparkles, ShieldCheck
} from 'lucide-react';

interface ClassUnionItem {
  id: string;
  class_code: string;
  title: string;
  description: string;
  category: 'PROJECT' | 'MAGAZINE' | 'VIDEO' | 'POSTER' | 'DOCUMENT';
  item_url: string;
  thumbnail_url?: string;
  creator_name?: string;
  creator_username?: string;
  created_at: string;
}

export const ClassUnionPortal: React.FC = () => {
  const { user, assignedClassUnion, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'releases' | 'profile' | 'members'>('releases');
  const [union, setUnion] = useState<any | null>(null);
  const [items, setItems] = useState<ClassUnionItem[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    motto: '',
    description: '',
    logo_url: '',
    banner_url: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // New Item Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    category: 'MAGAZINE' as 'PROJECT' | 'MAGAZINE' | 'VIDEO' | 'POSTER' | 'DOCUMENT',
    item_url: '',
    thumbnail_url: '',
  });
  const [submittingItem, setSubmittingItem] = useState(false);

  // Determine which class code this user manages
  const targetClassCode = assignedClassUnion?.class_code || user?.classCode || '01';

  const loadData = async () => {
    setLoading(true);
    try {
      const [unionRes, itemsRes] = await Promise.all([
        apiRequest(`/class-unions/${targetClassCode}`),
        apiRequest(`/class-unions/${targetClassCode}/items`),
      ]);

      if (unionRes.success && unionRes.data) {
        setUnion(unionRes.data.union);
        setMembers(unionRes.data.members || []);
        setProfileForm({
          name: unionRes.data.union.name || `Class ${targetClassCode} Union`,
          motto: unionRes.data.union.motto || '',
          description: unionRes.data.union.description || '',
          logo_url: unionRes.data.union.logo_url || '',
          banner_url: unionRes.data.union.banner_url || '',
        });
      }

      if (itemsRes.success && itemsRes.data) {
        setItems(itemsRes.data);
      }
    } catch (err) {
      console.error('Error loading class union portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetClassCode]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiRequest(`/class-unions/${targetClassCode}`, {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });

      if (res.success) {
        setActionNotice('✅ Class Union identity updated successfully!');
        setTimeout(() => setActionNotice(null), 4000);
        refreshUser();
        loadData();
      } else {
        alert(res.error || 'Failed to update union profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.title.trim() || !itemForm.item_url.trim()) {
      return alert('Title and valid external link are required.');
    }

    setSubmittingItem(true);
    try {
      const res = await apiRequest(`/class-unions/${targetClassCode}/items`, {
        method: 'POST',
        body: JSON.stringify(itemForm),
      });

      if (res.success) {
        setShowItemModal(false);
        setItemForm({
          title: '',
          description: '',
          category: 'MAGAZINE',
          item_url: '',
          thumbnail_url: '',
        });
        setActionNotice(res.message || '🎉 Publication release added successfully!');
        setTimeout(() => setActionNotice(null), 4000);
        loadData();
      } else {
        alert(res.error || 'Failed to add release.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating release.');
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await apiRequest(`/class-unions/items/${itemId}`, { method: 'DELETE' });
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setActionNotice('✅ Release deleted successfully.');
        setTimeout(() => setActionNotice(null), 3000);
      } else {
        alert(res.error || 'Failed to delete item.');
      }
    } catch {
      alert('Error deleting item.');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MAGAZINE':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'PROJECT':
        return <FolderGit2 className="w-4 h-4 text-emerald-600" />;
      case 'POSTER':
        return <ImageIcon className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading Class Union Portal...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Return to Student Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          to="/student"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#02167f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
        <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full">
          ⭐ Official {assignedClassUnion?.leadership_role || 'Chairman'} — Class {targetClassCode}
        </span>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#01092e] via-[#02167f] to-[#010e52] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Class {targetClassCode} Union Leadership Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {union?.name || `Class ${targetClassCode} Union`}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 italic mt-1">
              "{union?.motto || 'Distinction & Academic Nobility'}"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowItemModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Release / Project / Magazine</span>
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('releases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'releases' ? 'bg-white text-[#02167f] shadow' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            Releases & Publications ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'profile' ? 'bg-white text-[#02167f] shadow' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            Union Profile & Identity
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'members' ? 'bg-white text-[#02167f] shadow' : 'text-blue-100 hover:bg-white/10'
            }`}
          >
            Enrolled Classmates ({members.length})
          </button>
        </div>
      </div>

      {/* TAB 1: RELEASES & PUBLICATIONS */}
      {activeTab === 'releases' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Class Union Releases & Digital Shelf</h2>
              <p className="text-xs text-slate-500">
                Magazines, research projects, event posters, and videos published by your batch union.
              </p>
            </div>
            <button
              onClick={() => setShowItemModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#02167f] hover:bg-[#0320b3] text-white px-4 py-2 rounded-xl shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Release Link</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">No Releases Published Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                As the Class Chairman, you can share Google Drive links to batch magazines, YouTube videos, and research project papers.
              </p>
              <button
                onClick={() => setShowItemModal(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[#02167f] text-white font-bold text-xs px-5 py-2 rounded-xl shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish First Release</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={item.item_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] hover:underline"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete release"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & BRANDING */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Customize Class {targetClassCode} Union
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            You can define your batch union's official identity, choose a real name, slogan, and emblem.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Union Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="e.g. Al-Farooq Union, Class 08 Union"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Union Motto / Slogan
              </label>
              <input
                type="text"
                value={profileForm.motto}
                onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                placeholder="e.g. Excellence, Integrity & Distinction"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                About / History of this Batch
              </label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                placeholder="Describe your batch union, ideals, and vision..."
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-[#02167f] hover:bg-[#0320b3] text-white font-bold text-xs rounded-xl shadow transition"
              >
                {savingProfile ? 'Saving...' : 'Save Union Identity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CLASSMATES ROSTER */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Enrolled Scholars in Class {targetClassCode} ({members.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fellow classmates registered in your batch union.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((st) => (
              <div key={st.user_id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-[#02167f] font-black text-sm flex items-center justify-center overflow-hidden">
                    {st.profile_photo_url ? (
                      <img src={st.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      st.full_name?.charAt(0) || 'S'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{st.full_name}</h3>
                    <p className="text-xs text-slate-400 font-mono">@{st.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {st.certificates_count > 0 && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {st.certificates_count} certs
                    </span>
                  )}
                  {st.profile_slug && (
                    <Link
                      to={`/portfolio/${st.profile_slug}`}
                      className="text-xs font-bold text-[#02167f] hover:underline"
                    >
                      Portfolio
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PUBLISH RELEASE MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#02167f]" />
                Publish Class Union Release
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  <option value="MAGAZINE">Magazine / Bulletin</option>
                  <option value="PROJECT">Research Project / Paper</option>
                  <option value="VIDEO">Video (YouTube / Drive)</option>
                  <option value="POSTER">Event Poster / Notice</option>
                  <option value="DOCUMENT">General Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Farooq Batch Magazine Vol. 1"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  External Link (Google Drive / YouTube / PDF) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  value={itemForm.item_url}
                  onChange={(e) => setItemForm({ ...itemForm, item_url: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief synopsis of this release..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="px-5 py-2 bg-[#02167f] hover:bg-[#0320b3] text-white rounded-xl text-sm font-bold shadow"
                >
                  {submittingItem ? 'Publishing...' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
