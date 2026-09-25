import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Trophy,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Filter,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldAlert,
} from 'lucide-react';

interface ScoreEntry {
  id: string;
  class_code: string;
  source_type: 'SUB_WING_RESULT' | 'MAIN_COMMITTEE_TASK' | 'MAIN_COMMITTEE_PROGRAM' | 'MANUAL_ADJUSTMENT';
  points: number;
  description: string;
  cycle_id: string | null;
  cycle_name: string | null;
  cycle_status: string | null;
  created_at: string;
}

export const AdminScoreLedger: React.FC = () => {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScoreEntry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [adjustForm, setAdjustForm] = useState({
    class_code: '01',
    points: 5,
    description: '',
  });

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterClass) params.append('class_code', filterClass);

      const res = await apiRequest<ScoreEntry[]>(`/admin/scores/ledger?${params.toString()}`);
      if (res.success && res.data) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [filterClass]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.description.trim()) {
      setMessage({ text: 'Please enter a description/reason for the point adjustment.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiRequest<any>('/admin/scores/adjust', {
        method: 'POST',
        body: JSON.stringify({
          class_code: adjustForm.class_code,
          points: Number(adjustForm.points),
          description: adjustForm.description.trim(),
        }),
      });

      if (res.success) {
        setMessage({ text: res.message || 'Score adjustment successfully recorded!', type: 'success' });
        setShowAdjustModal(false);
        setAdjustForm({ class_code: '01', points: 5, description: '' });
        fetchLedger();
      } else {
        setMessage({ text: res.error || 'Failed to adjust score.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to adjust score.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await apiRequest<any>(`/admin/scores/ledger/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        setMessage({ text: res.message || 'Point entry deleted successfully.', type: 'success' });
        setDeleteTarget(null);
        fetchLedger();
      } else {
        setMessage({ text: res.error || 'Failed to delete score entry.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete score entry.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const totalPoints = entries.reduce((acc, curr) => acc + curr.points, 0);
  const manualCount = entries.filter((e) => e.source_type === 'MANUAL_ADJUSTMENT').length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#02167f] uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Master Score Control</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Class Score Ledger & Corrections
          </h2>
          <p className="text-xs text-slate-500">
            View every point awarded to classes. Manually add bonuses, deduct penalty points, or delete any mistake entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLedger}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] hover:bg-[#0320a6] text-[#ffd014] text-xs font-black shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Adjust Points</span>
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged Points</span>
          <span className="text-2xl font-black text-[#02167f]">{totalPoints} PTS</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ledger Records</span>
          <span className="text-2xl font-black text-slate-900">{entries.length} Entries</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manual Adjustments</span>
          <span className="text-2xl font-black text-amber-600">{manualCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter by Class</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full mt-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#02167f]"
          >
            <option value="">All 8 Classes</option>
            {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Points Ledger Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-cinzel text-lg font-black text-slate-900">
            Recorded Point Transactions ({entries.length})
          </h3>
          <span className="text-xs text-slate-400">Click 🗑️ on any row to delete mistake points</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading score entries...</div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Trophy className="w-10 h-10 text-slate-200 mx-auto" />
            <p>No score transactions found matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 rounded-l-xl">Class</th>
                  <th className="py-3 px-3">Points</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-4">Description / Reason</th>
                  <th className="py-3 px-3">Cycle</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#02167f] bg-navy-50 px-2 py-0.5 rounded border border-navy-200">
                        Class {entry.class_code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded ${
                          entry.points > 0
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-rose-700 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        {entry.points > 0 ? `+${entry.points}` : entry.points} PTS
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          entry.source_type === 'MANUAL_ADJUSTMENT'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : entry.source_type === 'SUB_WING_RESULT'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {entry.source_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-semibold max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {entry.cycle_name ? (
                        <span className="text-[11px] truncate max-w-[120px] block" title={entry.cycle_name}>
                          {entry.cycle_name}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(entry)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all font-bold text-xs"
                        title="Delete this point entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add / Adjust Points Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-cinzel text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#02167f]" />
                <span>Add / Adjust Class Points</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class</label>
                <select
                  value={adjustForm.class_code}
                  onChange={(e) => setAdjustForm({ ...adjustForm, class_code: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Points (+ to award, - to deduct)
                </label>
                <input
                  type="number"
                  value={adjustForm.points}
                  onChange={(e) => setAdjustForm({ ...adjustForm, points: Number(e.target.value) })}
                  placeholder="e.g. 10 or -5"
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enter positive points to add bonus (e.g. 10) or negative to deduct penalty (e.g. -5).
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Description</label>
                <textarea
                  value={adjustForm.description}
                  onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                  rows={3}
                  placeholder="e.g. Special Campus Presentation Bonus, or Score Correction"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#02167f]"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] text-xs font-black shadow-md hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Record Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-rose-200 space-y-4 animate-scale-up text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="font-cinzel text-lg font-black text-slate-900">
              Confirm Score Deletion
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this score entry for <strong>Class {deleteTarget.class_code}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 text-left">
              <div><strong>Points:</strong> {deleteTarget.points > 0 ? `+${deleteTarget.points}` : deleteTarget.points} PTS</div>
              <div className="truncate"><strong>Reason:</strong> {deleteTarget.description}</div>
            </div>

            <p className="text-[11px] text-rose-600 font-bold">
              The class championship standing and leaderboard will immediately recalculate!
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
                onClick={handleDeleteEntry}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Point'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
