import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Users, GraduationCap, ShieldCheck, Edit3, CheckCircle2, AlertCircle, ArrowUpRight, Search } from 'lucide-react';

interface ClassUnion {
  class_code: string;
  name: string;
  motto: string;
  description: string;
  logo_url: string;
  banner_url: string;
  chairman_id?: string;
  chairman_name?: string;
  chairman_username?: string;
  convener_id?: string;
  convener_name?: string;
  convener_username?: string;
  student_count: number;
  all_time_points: number;
  current_cycle_points: number;
}

export const AdminClassUnions: React.FC = () => {
  const [unions, setUnions] = useState<ClassUnion[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Union Modal
  const [editingUnion, setEditingUnion] = useState<ClassUnion | null>(null);
  const [unionForm, setUnionForm] = useState({
    name: '',
    motto: '',
    description: '',
    logo_url: '',
    banner_url: '',
  });
  const [savingUnion, setSavingUnion] = useState(false);

  // Assign Leadership Modal
  const [assigningUnion, setAssigningUnion] = useState<ClassUnion | null>(null);
  const [leaderForm, setLeaderForm] = useState({
    chairman_id: '',
    convener_id: '',
  });
  const [savingLeadership, setSavingLeadership] = useState(false);

  // Promotion Wizard Modal
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [gradYear, setGradYear] = useState(new Date().getFullYear().toString());
  const [promoting, setPromoting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [unionsRes, usersRes] = await Promise.all([
        apiRequest('/class-unions'),
        apiRequest('/admin/users'),
      ]);

      if (unionsRes.success && unionsRes.data) {
        setUnions(unionsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setStudentsList(usersRes.data);
      }
    } catch (err) {
      console.error('Failed to load class unions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (u: ClassUnion) => {
    setEditingUnion(u);
    setUnionForm({
      name: u.name,
      motto: u.motto || '',
      description: u.description || '',
      logo_url: u.logo_url || '',
      banner_url: u.banner_url || '',
    });
  };

  const handleSaveUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnion) return;

    setSavingUnion(true);
    try {
      const res = await apiRequest(`/class-unions/${editingUnion.class_code}`, {
        method: 'PUT',
        body: JSON.stringify(unionForm),
      });

      if (res.success) {
        setEditingUnion(null);
        setActionNotice(`✅ Updated ${editingUnion.name} successfully!`);
        setTimeout(() => setActionNotice(null), 4000);
        loadData();
      } else {
        alert(res.error || 'Failed to update union.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating class union.');
    } finally {
      setSavingUnion(false);
    }
  };

  const handleOpenLeadership = (u: ClassUnion) => {
    setAssigningUnion(u);
    setLeaderForm({
      chairman_id: u.chairman_id || '',
      convener_id: u.convener_id || '',
    });
  };

  const handleSaveLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUnion) return;

    setSavingLeadership(true);
    try {
      const res = await apiRequest('/class-unions/admin/assign-leadership', {
        method: 'POST',
        body: JSON.stringify({
          class_code: assigningUnion.class_code,
          chairman_id: leaderForm.chairman_id || null,
          convener_id: leaderForm.convener_id || null,
        }),
      });

      if (res.success) {
        setAssigningUnion(null);
        setActionNotice(`✅ Leadership assigned for Class ${assigningUnion.class_code} Sangadhana!`);
        setTimeout(() => setActionNotice(null), 4000);
        loadData();
      } else {
        alert(res.error || 'Failed to assign leadership.');
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning leadership.');
    } finally {
      setSavingLeadership(false);
    }
  };

  const handleBatchPromotion = async () => {
    setPromoting(true);
    try {
      const res = await apiRequest('/admin/students/promote-batch', {
        method: 'POST',
        body: JSON.stringify({ graduating_year: gradYear }),
      });

      if (res.success) {
        setShowPromoModal(false);
        setActionNotice(res.message || '🎓 Batch promotion completed successfully!');
        setTimeout(() => setActionNotice(null), 6000);
        loadData();
      } else {
        alert(res.error || 'Failed to execute batch promotion.');
      }
    } catch (err) {
      console.error(err);
      alert('Error promoting batch.');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Promotion Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#02167f]" />
            8 Class Sangadhanakal & Annual Batch Promotion
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage the 8 official batch unions, assign student Chairman & Convener, and conduct safe year-end student promotions to Alumni.
          </p>
        </div>

        <button
          onClick={() => setShowPromoModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow transition"
        >
          <GraduationCap className="w-4 h-4" />
          Annual Batch Promotion Wizard
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 8 Class Sangadhanakal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {unions.map((u) => (
          <div
            key={u.class_code}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#02167f] text-white font-black text-sm">
                  {u.class_code}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                  {u.student_count} Students
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">{u.name}</h3>
              <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">
                "{u.motto || 'Distinction & Academic Nobility'}"
              </p>

              {/* Leadership info */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Chairman:</span>
                  <span className="font-bold text-slate-800">
                    {u.chairman_name ? (
                      <span>{u.chairman_name}</span>
                    ) : (
                      <span className="text-amber-600 italic">Not Assigned</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Convener:</span>
                  <span className="font-bold text-slate-800">
                    {u.convener_name ? (
                      <span>{u.convener_name}</span>
                    ) : (
                      <span className="text-amber-600 italic">Not Assigned</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 font-medium">All-Time Score:</span>
                  <span className="font-extrabold text-[#02167f]">{u.all_time_points} pts</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleOpenLeadership(u)}
                className="flex-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#02167f] py-2 rounded-xl transition text-center"
              >
                Set Leaders
              </button>
              <button
                onClick={() => handleOpenEdit(u)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                title="Edit Union Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LEADERSHIP ASSIGNMENT MODAL */}
      {assigningUnion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Assign Leadership: Class {assigningUnion.class_code} ({assigningUnion.name})
              </h3>
              <button
                onClick={() => setAssigningUnion(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveLeadership} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Chairman (Student Head)
                </label>
                <select
                  value={leaderForm.chairman_id}
                  onChange={(e) => setLeaderForm({ ...leaderForm, chairman_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  <option value="">-- Select Student from Directory --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name || st.username || st.email} (Class {st.class_code || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Convener / Secretary
                </label>
                <select
                  value={leaderForm.convener_id}
                  onChange={(e) => setLeaderForm({ ...leaderForm, convener_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  <option value="">-- Select Student from Directory --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name || st.username || st.email} (Class {st.class_code || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningUnion(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLeadership}
                  className="px-5 py-2 bg-[#02167f] hover:bg-[#0320b3] text-white rounded-xl text-sm font-bold shadow"
                >
                  {savingLeadership ? 'Saving...' : 'Save Leaders'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNION MODAL */}
      {editingUnion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Class {editingUnion.class_code} Sangadhana Profile
              </h3>
              <button
                onClick={() => setEditingUnion(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUnion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Union Name *</label>
                <input
                  type="text"
                  required
                  value={unionForm.name}
                  onChange={(e) => setUnionForm({ ...unionForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motto / Slogan</label>
                <input
                  type="text"
                  value={unionForm.motto}
                  onChange={(e) => setUnionForm({ ...unionForm, motto: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / History</label>
                <textarea
                  rows={3}
                  value={unionForm.description}
                  onChange={(e) => setUnionForm({ ...unionForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUnion(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUnion}
                  className="px-5 py-2 bg-[#02167f] hover:bg-[#0320b3] text-white rounded-xl text-sm font-bold shadow"
                >
                  {savingUnion ? 'Saving...' : 'Update Union'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNUAL BATCH PROMOTION WIZARD MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
                Annual Batch Promotion & Alumni Archiving
              </h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Permanent Student Record Preservation:
                </div>
                <p>
                  • <strong>Graduating Senior Scholars (Class 08)</strong> are graduated to <strong>ALUMNI</strong> with their graduation year. <em>Their profiles, verified certificates, talents, and public links are never deleted.</em>
                </p>
                <p>
                  • <strong>Junior Batches</strong> advance automatically (Class 07 ➔ 08, Class 06 ➔ 07 ... Class 01 ➔ 02).
                </p>
                <p>
                  • Incoming new students can be registered directly into Class 01.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Graduation Batch Year for Class 08 Scholars
                </label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="2026"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchPromotion}
                  disabled={promoting}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-sm font-black shadow transition"
                >
                  {promoting ? 'Promoting Scholars...' : 'Execute Annual Promotion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
