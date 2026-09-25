import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Trophy, Calendar, Plus, CheckCircle2, Award, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface Cycle {
  id: string;
  name: string;
  academic_year: string;
  start_date: string;
  target_leave_date?: string;
  status: 'ACTIVE' | 'CLOSED';
  best_class_code?: string;
  best_class_points?: number;
  best_class_task_count?: number;
  closed_at?: string;
  notes?: string;
  best_class_union_name?: string;
  best_class_motto?: string;
}

interface Standing {
  class_code: string;
  total_points: number;
  entries_count: number;
  union_name?: string;
  union_motto?: string;
  rank: number;
}

export const AdminCycles: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [history, setHistory] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Start Cycle Modal
  const [showStartModal, setShowStartModal] = useState(false);
  const [newCycleForm, setNewCycleForm] = useState({
    name: '',
    academic_year: '2026-2027',
    start_date: new Date().toISOString().split('T')[0],
    target_leave_date: '',
    notes: '',
  });
  const [startingCycle, setStartingCycle] = useState(false);

  // Close Cycle Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [closingCycle, setClosingCycle] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activeRes, histRes] = await Promise.all([
        apiRequest('/cycles/active'),
        apiRequest('/cycles/history'),
      ]);

      if (activeRes.success && activeRes.data) {
        setActiveCycle(activeRes.data.cycle);
        setStandings(activeRes.data.standings || []);
      } else {
        setActiveCycle(null);
        setStandings([]);
      }

      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err) {
      console.error('Failed to load cycles data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleForm.name.trim()) return alert('Please enter a cycle name.');

    setStartingCycle(true);
    try {
      const res = await apiRequest('/cycles/admin/start', {
        method: 'POST',
        body: JSON.stringify(newCycleForm),
      });

      if (res.success) {
        setShowStartModal(false);
        setNewCycleForm({
          name: '',
          academic_year: '2026-2027',
          start_date: new Date().toISOString().split('T')[0],
          target_leave_date: '',
          notes: '',
        });
        setActionNotice(res.message || '🎉 New Academic Cycle started successfully!');
        setTimeout(() => setActionNotice(null), 5000);
        loadData();
      } else {
        alert(res.error || 'Failed to start cycle.');
      }
    } catch (err) {
      console.error(err);
      alert('Error starting cycle.');
    } finally {
      setStartingCycle(false);
    }
  };

  const handleCloseCycle = async () => {
    if (!activeCycle) return;
    setClosingCycle(true);
    try {
      const res = await apiRequest(`/cycles/admin/${activeCycle.id}/close`, {
        method: 'POST',
        body: JSON.stringify({ notes: closeNotes }),
      });

      if (res.success) {
        setShowCloseModal(false);
        setCloseNotes('');
        setActionNotice(res.message || '🏆 Cycle closed and Best Class Award computed!');
        setTimeout(() => setActionNotice(null), 6000);
        loadData();
      } else {
        alert(res.error || 'Failed to close cycle.');
      }
    } catch (err) {
      console.error(err);
      alert('Error closing cycle.');
    } finally {
      setClosingCycle(false);
    }
  };

  const leadingClass = standings.length > 0 && standings[0].total_points > 0 ? standings[0] : null;

  return (
    <div className="space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#02167f]" />
            Academic Cycles & "Best Class of the Month" Manager
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic cycles based on campus leaves/vacations. When leave arrives, close the cycle to automatically award the Best Class trophy.
          </p>
        </div>

        <button
          onClick={() => setShowStartModal(true)}
          className="inline-flex items-center gap-2 bg-[#02167f] hover:bg-[#0320b3] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow transition"
        >
          <Plus className="w-4 h-4" />
          Start New Academic Cycle
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Active Cycle Control Panel */}
      {activeCycle ? (
        <div className="bg-gradient-to-br from-slate-900 via-[#02167f] to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ACTIVE CYCLE IN PROGRESS
                </span>
                <span className="text-xs text-blue-200">Year: {activeCycle.academic_year}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white">{activeCycle.name}</h3>

              <div className="flex items-center gap-4 mt-2 text-xs md:text-sm text-blue-200">
                <span>Start Date: <strong>{new Date(activeCycle.start_date).toLocaleDateString()}</strong></span>
                {activeCycle.target_leave_date && (
                  <span>• Target Leave: <strong>{new Date(activeCycle.target_leave_date).toLocaleDateString()}</strong></span>
                )}
              </div>

              {activeCycle.notes && (
                <p className="text-xs text-blue-100/80 mt-2 italic bg-white/5 p-2 rounded max-w-xl">
                  Note: {activeCycle.notes}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowCloseModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition"
              >
                <Trophy className="w-5 h-5 text-slate-950" />
                Close Cycle & Award Best Class
              </button>
            </div>
          </div>

          {/* Live Standings within this cycle */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Live Standings for this Cycle
              </h4>
              {leadingClass && (
                <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  Current Leader: Class {leadingClass.class_code} ({leadingClass.total_points} pts)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {standings.map((s) => (
                <div
                  key={s.class_code}
                  className={`p-3 rounded-xl border text-center transition ${
                    s.rank === 1 && s.total_points > 0
                      ? 'bg-amber-400/20 border-amber-400/50 shadow-md shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-[10px] font-bold text-blue-200 uppercase">Rank #{s.rank}</div>
                  <div className="text-lg font-black text-white mt-0.5">Class {s.class_code}</div>
                  <div className="text-sm font-extrabold text-amber-400">{s.total_points} pts</div>
                  <div className="text-[10px] text-blue-200 mt-1 truncate" title={s.union_name || ''}>
                    {s.union_name || `Class ${s.class_code}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Academic Cycle Currently Running</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
            Start a new cycle to begin recording competition and task marks towards the next "Best Class Award".
          </p>
          <button
            onClick={() => setShowStartModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-[#02167f] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow"
          >
            <Plus className="w-4 h-4" />
            Start Academic Cycle Now
          </button>
        </div>
      )}

      {/* Historical Cycles & Defending Champions Archive */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Past Cycles & "Best Class Award" Honor Roll
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical ledger of concluded campus cycles and their awarded Best Classes.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {history.filter((c) => c.status === 'CLOSED').length} Archived Cycles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Cycle Name</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Best Class Winner</th>
                <th className="py-3 px-4">Winning Score</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No academic cycles recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono">{c.academic_year}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(c.start_date).toLocaleDateString()}
                      {c.closed_at ? ` ➔ ${new Date(c.closed_at).toLocaleDateString()}` : ' (Running)'}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.best_class_code ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                            🏆 Class {c.best_class_code}
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {c.best_class_union_name || `Class ${c.best_class_code}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Pending closure</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      {c.best_class_points ? `${c.best_class_points} pts` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* START CYCLE MODAL */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#02167f]" />
                Start New Academic Cycle
              </h3>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleStartCycle} className="space-y-4">
              {activeCycle && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Starting a new cycle will automatically conclude the current active cycle (<strong>{activeCycle.name}</strong>) and award its Best Class trophy!
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cycle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shawwal - Dhul Qa'dah Cycle (Pre-Eid Leave)"
                  value={newCycleForm.name}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newCycleForm.start_date}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, start_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Leave Date (Optional)</label>
                  <input
                    type="date"
                    value={newCycleForm.target_leave_date}
                    onChange={(e) => setNewCycleForm({ ...newCycleForm, target_leave_date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={newCycleForm.academic_year}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, academic_year: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Points reset for this cycle. All tasks and events until Eid leave count towards this month's award."
                  value={newCycleForm.notes}
                  onChange={(e) => setNewCycleForm({ ...newCycleForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={startingCycle}
                  className="px-6 py-2 bg-[#02167f] hover:bg-[#0320b3] text-white rounded-xl text-sm font-bold shadow transition"
                >
                  {startingCycle ? 'Starting...' : 'Launch Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE CYCLE MODAL */}
      {showCloseModal && activeCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Conclude Cycle & Award "Best Class"
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Are you ready to officially close <strong>{activeCycle.name}</strong>? The top scoring class in this cycle will be declared the <strong>Defending Champion</strong> and showcased across the platform.
              </p>

              {leadingClass ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300">
                  <div className="text-xs uppercase font-extrabold text-amber-800 tracking-wider">🏆 Winning Class Identified</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    Class {leadingClass.class_code} — {leadingClass.union_name}
                  </div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">
                    {leadingClass.total_points} Points in this Cycle
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  No points have been recorded in this cycle yet.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Closing Remarks / Citation (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Outstanding performance across Sub-Wing competitions and discipline tasks."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCloseCycle}
                  disabled={closingCycle}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-sm rounded-xl shadow hover:from-amber-400 hover:to-amber-500 transition"
                >
                  {closingCycle ? 'Awarding...' : 'Confirm & Award Best Class'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
