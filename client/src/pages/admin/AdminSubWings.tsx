import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Award, Users, Edit2, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface SubWing {
  id: string;
  code: string;
  name: string;
  description: string;
  chairman_id?: string;
  convener_id?: string;
  chairman_name?: string;
  convener_name?: string;
  programs_count: number;
}

interface StudentUser {
  id: string;
  fullName: string;
  class?: string;
  role: string;
}

export const AdminSubWings: React.FC = () => {
  const [subWings, setSubWings] = useState<SubWing[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Leadership Modal
  const [activeSubWing, setActiveSubWing] = useState<SubWing | null>(null);
  const [selectedChairman, setSelectedChairman] = useState<string>('');
  const [selectedConvener, setSelectedConvener] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [swRes, usersRes] = await Promise.all([
        apiRequest<SubWing[]>('/admin/subwings'),
        apiRequest<any[]>('/admin/users'),
      ]);

      if (swRes.success && swRes.data) {
        setSubWings(swRes.data);
      }

      if (usersRes.success && usersRes.data) {
        setStudents(
          usersRes.data.map((u) => ({
            id: u.id,
            fullName: u.fullName || u.email,
            class: u.class,
            role: u.role,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load subwings data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (sw: SubWing) => {
    setActiveSubWing(sw);
    setSelectedChairman(sw.chairman_id || '');
    setSelectedConvener(sw.convener_id || '');
    setNotice(null);
  };

  const handleSaveLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubWing) return;
    setSaving(true);
    setNotice(null);

    try {
      const res = await apiRequest(`/admin/subwings/${activeSubWing.id}/leadership`, {
        method: 'PATCH',
        body: JSON.stringify({
          chairman_id: selectedChairman || null,
          convener_id: selectedConvener || null,
        }),
      });

      if (res.success) {
        setNotice('✅ Sub-Wing leadership updated successfully!');
        setTimeout(() => {
          setActiveSubWing(null);
          loadData();
        }, 1200);
      } else {
        setNotice(res.error || 'Failed to update leadership');
      }
    } catch (err) {
      console.error('Update leadership error', err);
      setNotice('Error updating leadership');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <span className="text-[10px] font-bold text-[#02167f] uppercase tracking-wider">
          SADQ Official Structure
        </span>
        <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-1">
          13 Sub-Wings Leadership Directory
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Designate Chairman and Convener for each of the 13 official Sub-Wings. Designated leaders gain permissions to create offline programs and record competition marks in their Sub-Wing portal.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02167f] mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subWings.map((sw) => (
            <div
              key={sw.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-[#02167f] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#02167f] border border-blue-200">
                    {sw.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {sw.programs_count} program{sw.programs_count === 1 ? '' : 's'}
                  </span>
                </div>

                <div>
                  <h3 className="font-cinzel font-black text-slate-900 text-lg">
                    {sw.name}
                  </h3>
                  {sw.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{sw.description}</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Chairman:</span>
                    <strong className="text-slate-800">
                      {sw.chairman_name || <span className="text-amber-600 font-normal italic">Unassigned</span>}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Convener:</span>
                    <strong className="text-slate-800">
                      {sw.convener_name || <span className="text-amber-600 font-normal italic">Unassigned</span>}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(sw)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#02167f] hover:text-white text-slate-800 text-xs font-bold transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Assign / Change Leaders</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT LEADERSHIP MODAL */}
      {activeSubWing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="font-cinzel text-xl font-black text-[#02167f] mb-1">
              Assign Leadership
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              {activeSubWing.code} — {activeSubWing.name}
            </p>

            {notice && (
              <div className="p-3 mb-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {notice}
              </div>
            )}

            <form onSubmit={handleSaveLeadership} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Designated Chairman
                </label>
                <select
                  value={selectedChairman}
                  onChange={(e) => setSelectedChairman(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  <option value="">-- No Chairman (Unassigned) --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} {st.class ? `(Class ${st.class})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Designated Convener
                </label>
                <select
                  value={selectedConvener}
                  onChange={(e) => setSelectedConvener(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  <option value="">-- No Convener (Unassigned) --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} {st.class ? `(Class ${st.class})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubWing(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Leadership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
