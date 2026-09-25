import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  GraduationCap,
  Key,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  User,
  ShieldAlert,
  Building,
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

interface UserRecord {
  id: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  full_name: string;
  class_code: string | null;
  graduation_year: string | null;
  bio: string | null;
  profile_slug: string | null;
  profile_photo_url: string | null;
  units: any[];
  certificates_count: number;
  lifetime_points: number;
  created_at: string;
}

export const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    classCode: '01',
    graduationYear: '',
    role: 'STUDENT',
    bio: '',
  });

  // Edit Modal
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    classCode: '01',
    graduationYear: '',
    role: 'STUDENT',
    bio: '',
    isActive: true,
    newPassword: '',
  });

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  // Assign Unit Modal
  const [selectedUserForUnit, setSelectedUserForUnit] = useState<UserRecord | null>(null);
  const [unitForm, setUnitForm] = useState({ unitCode: 'EB', roleInUnit: 'Member', position: 'Member' });

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (classFilter) params.append('classCode', classFilter);
      if (roleFilter) params.append('role', roleFilter);

      const res = await apiRequest<UserRecord[]>(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, classFilter, roleFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiRequest<any>('/admin/users/create', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });

      if (res.success) {
        setMessage({ text: res.message || 'Account created successfully!', type: 'success' });
        setShowCreateModal(false);
        setCreateForm({
          fullName: '',
          username: '',
          email: '',
          password: '',
          classCode: '01',
          graduationYear: '',
          role: 'STUDENT',
          bio: '',
        });
        fetchUsers();
      } else {
        setMessage({ text: res.error || 'Failed to create user account.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to create user account.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (u: UserRecord) => {
    setEditingUser(u);
    setEditForm({
      fullName: u.full_name || '',
      classCode: u.class_code || '01',
      graduationYear: u.graduation_year || '',
      role: u.role || 'STUDENT',
      bio: u.bio || '',
      isActive: u.is_active,
      newPassword: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const body: any = {
        fullName: editForm.fullName,
        classCode: editForm.classCode,
        graduationYear: editForm.classCode === 'ALUMNI' ? editForm.graduationYear : null,
        role: editForm.role,
        bio: editForm.bio,
        isActive: editForm.isActive,
      };
      if (editForm.newPassword.trim()) {
        body.password = editForm.newPassword.trim();
      }

      const res = await apiRequest<any>(`/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      if (res.success) {
        setMessage({ text: 'User details updated successfully!', type: 'success' });
        setEditingUser(null);
        fetchUsers();
      } else {
        setMessage({ text: res.error || 'Failed to update user.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update user.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiRequest<any>(`/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setMessage({ text: res.message || 'User deleted permanently.', type: 'success' });
        setDeleteTarget(null);
        fetchUsers();
      } else {
        setMessage({ text: res.error || 'Failed to delete user.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete user.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForUnit) return;

    setSubmitting(true);
    try {
      const res = await apiRequest('/admin/assign-unit', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUserForUnit.id,
          unitCode: unitForm.unitCode,
          roleInUnit: unitForm.roleInUnit,
          position: unitForm.position || unitForm.roleInUnit,
        }),
      });

      if (res.success) {
        setMessage({ text: `Assigned ${selectedUserForUnit.full_name} to ${unitForm.unitCode} wing!`, type: 'success' });
        setSelectedUserForUnit(null);
        fetchUsers();
      } else {
        setMessage({ text: res.error || 'Failed to assign unit.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to assign unit.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const alumniCount = users.filter((u) => u.class_code === 'ALUMNI').length;
  const studentCount = users.filter((u) => u.class_code && u.class_code !== 'ALUMNI').length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Master User Control</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Student, Alumni & Staff Authority
          </h2>
          <p className="text-xs text-slate-500">
            Full administrative control over all students and graduated alumni. Edit profiles, change classes, reset passwords, or delete accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] hover:bg-[#0320a6] text-[#ffd014] text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student / Alumni</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Directory</span>
          <span className="text-2xl font-black text-slate-900">{users.length} Accounts</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Scholars</span>
          <span className="text-2xl font-black text-[#02167f]">{studentCount} (Classes 01-08)</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Graduated Alumni</span>
          <span className="text-2xl font-black text-purple-700">{alumniCount} Scholars</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Control Status</span>
          <span className="text-2xl font-black text-emerald-600">Super Admin</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, @username, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#02167f]"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#02167f]"
        >
          <option value="">All Batches & Alumni</option>
          {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
          <option value="ALUMNI">🎓 Graduated Alumni</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#02167f]"
        >
          <option value="">All System Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Users & Alumni Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Scholar / User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-3">Batch / Class</th>
                <th className="py-3.5 px-3">System Role</th>
                <th className="py-3.5 px-3">Points</th>
                <th className="py-3.5 px-4">Official Units</th>
                <th className="py-3.5 px-4 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching this filter.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-navy-900 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-gold-400/30">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold block truncate">{u.full_name || 'Anonymous User'}</span>
                          <span className="text-[11px] text-slate-400 block truncate">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]" title={u.email}>
                      {u.email}
                    </td>
                    <td className="py-3 px-3">
                      {u.class_code === 'ALUMNI' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 whitespace-nowrap">
                          🎓 Alumni {u.graduation_year ? `(${u.graduation_year})` : ''}
                        </span>
                      ) : u.class_code ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#02167f] border border-blue-200">
                          Class {u.class_code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-black text-emerald-700">
                      +{u.lifetime_points}
                    </td>
                    <td className="py-3 px-4">
                      {u.units && u.units.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.units.map((unit: any) => (
                            <span
                              key={unit.unit_code}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-navy-50 text-navy-900 border border-navy-200"
                            >
                              {unit.unit_code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#02167f] transition-all"
                          title="Edit student / alumni details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForUnit(u);
                            setUnitForm({ unitCode: 'EB', roleInUnit: 'Member', position: 'Member' });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-amber-700 transition-all"
                          title="Assign to official unit"
                        >
                          <Building className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete user permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER / ALUMNI MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-cinzel text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#02167f]" />
                <span>Register Student or Alumni Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. Hafiz Yaseen Mannarkkad"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Unique @Username *</label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    placeholder="e.g. yaseen11"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="e.g. student@sadq.org"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Batch / Class *</label>
                  <select
                    value={createForm.classCode}
                    onChange={(e) => setCreateForm({ ...createForm, classCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                    <option value="ALUMNI">🎓 Graduated Alumni</option>
                  </select>
                </div>

                {createForm.classCode === 'ALUMNI' && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={createForm.graduationYear}
                      onChange={(e) => setCreateForm({ ...createForm, graduationYear: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">System Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bio / Profile Description</label>
                <textarea
                  rows={2}
                  value={createForm.bio}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                  placeholder="Short description of scholar talents and focus..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] font-black shadow-md hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER / ALUMNI MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-cinzel text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#02167f]" />
                  <span>Edit Scholar / User Details</span>
                </h3>
                <p className="text-xs text-slate-500">@{editingUser.username} • {editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Class / Batch</label>
                  <select
                    value={editForm.classCode}
                    onChange={(e) => setEditForm({ ...editForm, classCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  >
                    {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                    <option value="ALUMNI">🎓 Graduated Alumni</option>
                  </select>
                </div>

                {editForm.classCode === 'ALUMNI' && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">System Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bio / Description</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset Password (leave empty to keep current password)</span>
                </label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#02167f] focus:ring-[#02167f]"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-slate-700">
                  Account Active (Uncheck to temporarily suspend login)
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] font-black shadow-md hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {submitting ? 'Saving Changes...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-rose-200 space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="font-cinzel text-lg font-black text-slate-900">
              Confirm Account Deletion
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the account for <strong>{deleteTarget.full_name}</strong> (@{deleteTarget.username})?
            </p>

            <p className="text-[11px] text-rose-600 font-bold">
              This action cannot be undone. All profile data, projects, and memberships will be deleted.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN UNIT MODAL */}
      {selectedUserForUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignUnitSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up text-xs"
          >
            <div>
              <h3 className="font-cinzel text-lg font-bold text-navy-900">Assign to Official Unit</h3>
              <p className="text-xs text-slate-500">
                Scholar: <strong>{selectedUserForUnit.full_name || selectedUserForUnit.username}</strong>
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Official Unit (10 Wings)</label>
              <select
                value={unitForm.unitCode}
                onChange={(e) => setUnitForm({ ...unitForm, unitCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              >
                {OFFICIAL_UNITS.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Role in Unit</label>
              <select
                value={unitForm.roleInUnit}
                onChange={(e) => setUnitForm({ ...unitForm, roleInUnit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              >
                <option value="Executive">Executive</option>
                <option value="Convener">Convener</option>
                <option value="Editor">Editor</option>
                <option value="Member">General Member</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Specific Position / Title</label>
              <input
                value={unitForm.position}
                onChange={(e) => setUnitForm({ ...unitForm, position: e.target.value })}
                placeholder="e.g. Media Lead, Calligraphy Specialist"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForUnit(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] font-black shadow-md hover:bg-[#0320a6] disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Assign Unit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
