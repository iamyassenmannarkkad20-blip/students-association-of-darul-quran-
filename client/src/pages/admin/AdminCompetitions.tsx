import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Trophy, Plus, Calendar, ExternalLink, Sparkles, Send, Save, Trash2,
  CheckCircle, Award, Users, Search, RefreshCw, FileText, Check, AlertCircle,
  History, Lock, Unlock
} from 'lucide-react';
import { ResultAuditModal } from '../../components/ResultAuditModal';

interface Competition {
  id: string;
  title: string;
  description: string;
  program_date: string;
  maximum_mark: number;
  score_rule_name?: string;
  winner_poster_url?: string;
  status: 'DRAFT' | 'PUBLISHED';
  participants_count: number;
}

interface StudentOption {
  user_id: string;
  full_name: string;
  class_code: string;
  profile_slug: string;
  username: string;
}

interface ParticipantResult {
  student_name: string;
  student_id: string | null;
  class_code: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
  mark: number;
  position?: number;
  class_points?: number;
  winner_poster_url?: string;
  certificate_url?: string;
  certificate_id?: string;
}

export const AdminCompetitions: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [directory, setDirectory] = useState<StudentOption[]>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [compTitle, setCompTitle] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compMaxMark, setCompMaxMark] = useState(20);
  const [compDate, setCompDate] = useState(new Date().toISOString().split('T')[0]);
  const [compPosterUrl, setCompPosterUrl] = useState('');
  const [savingComp, setSavingComp] = useState(false);

  // Mark & Results Modal State
  const [activeComp, setActiveComp] = useState<Competition | null>(null);
  const [participants, setParticipants] = useState<ParticipantResult[]>([]);
  const [modalPosterUrl, setModalPosterUrl] = useState('');
  const [savingResults, setSavingResults] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const [compRes, dirRes] = await Promise.all([
        apiRequest<Competition[]>('/admin/competitions'),
        apiRequest<StudentOption[]>('/subwings/students-directory'),
      ]);
      if (compRes.success && compRes.data) {
        setCompetitions(compRes.data);
      }
      if (dirRes.success && dirRes.data) {
        setDirectory(dirRes.data);
      }
    } catch (err) {
      console.error('Failed to load competitions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingComp(true);
    try {
      const res = await apiRequest('/admin/competitions', {
        method: 'POST',
        body: JSON.stringify({
          title: compTitle,
          description: compDesc,
          maximum_mark: Number(compMaxMark),
          program_date: compDate,
          winner_poster_url: compPosterUrl,
        }),
      });

      if (res.success) {
        setShowCreateModal(false);
        setCompTitle('');
        setCompDesc('');
        setCompPosterUrl('');
        setNotice('✅ Main Committee competition created successfully!');
        setTimeout(() => setNotice(null), 3500);
        fetchCompetitions();
      } else {
        alert(res.error || 'Failed to create competition');
      }
    } catch (err) {
      console.error('Create competition error', err);
    } finally {
      setSavingComp(false);
    }
  };

  const handleOpenMarksModal = async (comp: Competition) => {
    setActiveComp(comp);
    setModalPosterUrl(comp.winner_poster_url || '');
    try {
      const res = await apiRequest<{ competition: Competition; results: any[] }>(`/admin/competitions/${comp.id}`);
      if (res.success && res.data && res.data.results.length > 0) {
        setParticipants(
          res.data.results.map((r) => ({
            student_name: r.student_name,
            student_id: r.student_id || null,
            class_code: r.class_code,
            mark: Number(r.mark),
            position: r.position,
            class_points: r.class_points,
            winner_poster_url: r.winner_poster_url || '',
            certificate_url: r.certificate_url || '',
            certificate_id: r.certificate_id || '',
          }))
        );
      } else {
        // Initialize with 3 rows
        setParticipants([
          { student_name: '', student_id: null, class_code: '08', mark: 0, certificate_url: '' },
          { student_name: '', student_id: null, class_code: '08', mark: 0, certificate_url: '' },
          { student_name: '', student_id: null, class_code: '08', mark: 0, certificate_url: '' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching competition details', err);
    }
  };

  const handleAddParticipantRow = () => {
    setParticipants((prev) => [
      ...prev,
      { student_name: '', student_id: null, class_code: '08', mark: 0, certificate_url: '' },
    ]);
  };

  const handleRemoveParticipantRow = (index: number) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSelectStudent = (index: number, studentId: string) => {
    const student = directory.find((s) => s.user_id === studentId);
    if (!student) return;

    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        student_id: student.user_id,
        student_name: student.full_name,
        class_code: student.class_code as any,
      };
      return updated;
    });
  };

  const handleSaveMarks = async () => {
    if (!activeComp) return;
    const valid = participants.filter((p) => p.student_name.trim().length > 0);
    if (valid.length === 0) {
      alert('Please add at least one participant with a name.');
      return;
    }

    setSavingResults(true);
    try {
      const res = await apiRequest(`/admin/competitions/${activeComp.id}/results`, {
        method: 'POST',
        body: JSON.stringify({
          participants: valid,
          winner_poster_url: modalPosterUrl,
        }),
      });

      if (res.success) {
        setNotice('✅ Marks & certificates recorded! Positions and points calculated.');
        setTimeout(() => setNotice(null), 3500);
        handleOpenMarksModal(activeComp);
        fetchCompetitions();
      } else {
        alert(res.error || 'Failed to save marks');
      }
    } catch (err) {
      console.error('Save marks error', err);
    } finally {
      setSavingResults(false);
    }
  };

  const handlePublishResults = async () => {
    if (!activeComp) return;
    if (!confirm('Are you sure you want to publish these competition results? Points will update student scores, class scores, and issue verified certificates immediately.')) {
      return;
    }

    setPublishing(true);
    try {
      const res = await apiRequest(`/admin/competitions/${activeComp.id}/publish`, {
        method: 'POST',
      });

      if (res.success) {
        setActiveComp(null);
        setNotice('🏆 Results published live! Student individual points, class points, and certificates updated!');
        setTimeout(() => setNotice(null), 4000);
        fetchCompetitions();
      } else {
        alert(res.error || 'Failed to publish results');
      }
    } catch (err) {
      console.error('Publish error', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteComp = async (id: string, title: string) => {
    if (!confirm(`Delete competition "${title}"? This will also remove any score ledger entries and certificate records.`)) return;
    try {
      const res = await apiRequest(`/admin/competitions/${id}`, { method: 'DELETE' });
      if (res.success) {
        setNotice('Competition deleted.');
        setTimeout(() => setNotice(null), 3000);
        fetchCompetitions();
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleReopenResult = async () => {
    if (!activeComp) return;
    const reason = prompt('Please enter the justification reason for reopening this published competition result:');
    if (!reason || reason.trim().length < 3) {
      alert('A valid reason is required for reopening published results for audit tracking.');
      return;
    }

    try {
      const res = await apiRequest(`/admin/competitions/${activeComp.id}/reopen`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: reason.trim() }),
      });
      if (res.success) {
        alert('Results unlocked for correction! Remember to click "Publish to Live Leaderboard" once corrected.');
        handleOpenMarksModal({ ...activeComp, status: 'DRAFT' });
        fetchCompetitions();
      } else {
        alert(res.error || 'Failed to reopen results');
      }
    } catch (err) {
      console.error('Reopen error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#02167f] text-[#ffd014] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Main Committee Competitions & Awards</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-cinzel">
            Central Offline Competitions, Dual Scoring & Certificates
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct central competitions. Entering results increases both individual student scores and Class Championship points, plus issues verified award certificates!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Correction Audit History</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] hover:bg-[#0320a6] text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Central Competition</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Competitions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#02167f]" />
            <span>Loading competitions...</span>
          </div>
        ) : competitions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Trophy className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No Main Committee competitions created yet.</p>
            <p className="text-xs text-slate-400">Click &quot;Create Central Competition&quot; to begin conducting central campus events.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100">
              {competitions.map((c) => (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                      {c.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</div>
                      )}
                    </div>
                    {c.status === 'PUBLISHED' ? (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>PUBLISHED</span>
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                        <span>DRAFT</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(c.program_date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-slate-700">{c.maximum_mark} Marks</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      <Users className="w-3 h-3 text-[#02167f]" />
                      <span>{c.participants_count} entered</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenMarksModal(c)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-50 hover:bg-[#02167f] text-[#02167f] hover:text-[#ffd014] text-xs font-bold transition-all shadow-sm"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Enter Marks & Certificates</span>
                    </button>
                    <button
                      onClick={() => handleDeleteComp(c.id, c.title)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Competition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= 768px) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar scroll-touch">
              <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Max Mark</th>
                  <th className="py-3 px-4">Participants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competitions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                      {c.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(c.program_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{c.maximum_mark} Marks</td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                        <Users className="w-3 h-3 text-[#02167f]" />
                        <span>{c.participants_count} entered</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>PUBLISHED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px]">
                          <span>DRAFT</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenMarksModal(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-navy-50 hover:bg-[#02167f] text-[#02167f] hover:text-[#ffd014] text-xs font-bold transition-all shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Enter Marks & Certificates</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComp(c.id, c.title)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Competition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Create Competition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#02167f]" />
                <span>Create Central Competition</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Competition Title *</label>
                <input
                  type="text"
                  required
                  value={compTitle}
                  onChange={(e) => setCompTitle(e.target.value)}
                  placeholder="e.g. Central Quran Recitation & Tajweed Award"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Category</label>
                <textarea
                  rows={2}
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="Details of the event, venue, or evaluation criteria..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={compDate}
                    onChange={(e) => setCompDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={compMaxMark}
                    onChange={(e) => setCompMaxMark(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Winner Poster URL (Optional)</label>
                <input
                  type="url"
                  value={compPosterUrl}
                  onChange={(e) => setCompPosterUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or image link"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingComp}
                  className="px-5 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] text-xs font-bold hover:bg-[#0320a6] shadow transition-all disabled:opacity-50"
                >
                  {savingComp ? 'Creating...' : 'Create Competition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Entry & Certificates Modal */}
      {activeComp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 sm:space-y-6 my-auto max-h-[90dvh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 text-[#02167f] text-[10px] font-black uppercase mb-1">
                  <span>Mark Entry & Certificates</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{activeComp.title}</h3>
                <p className="text-xs text-slate-500">
                  Select student, enter mark out of {activeComp.maximum_mark}, and paste optional certificate download link.
                </p>
              </div>
              <button
                onClick={() => setActiveComp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base"
              >
                ✕
              </button>
            </div>

            {/* Lock & Reopen Banner */}
            {activeComp.status === 'PUBLISHED' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Results are Officially Published & Locked
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Scores are synced to live leaderboards. To make corrections, unlock this competition with justification.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReopenResult}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Reopen for Correction</span>
                </button>
              </div>
            )}

            {/* Participants Table */}
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Students ({participants.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddParticipantRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student Row</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto no-scrollbar scroll-touch">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Student Name / Directory Search</th>
                      <th className="py-2.5 px-3 w-28">Class</th>
                      <th className="py-2.5 px-3 w-24">Mark</th>
                      <th className="py-2.5 px-3 w-48">Award Certificate Link</th>
                      <th className="py-2.5 px-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participants.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3">
                          <div className="space-y-1">
                            <input
                              type="text"
                              required
                              value={p.student_name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setParticipants((prev) => {
                                  const copy = [...prev];
                                  copy[idx].student_name = val;
                                  return copy;
                                });
                              }}
                              placeholder="Full Student Name..."
                              list={`dir-${idx}`}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-1 focus:ring-[#02167f]"
                            />
                            <datalist id={`dir-${idx}`}>
                              {directory.map((s) => (
                                <option key={s.user_id} value={s.full_name}>
                                  Class {s.class_code} — @{s.username}
                                </option>
                              ))}
                            </datalist>

                            {/* Direct Match Linker */}
                            {directory.length > 0 && (
                              <select
                                value={p.student_id || ''}
                                onChange={(e) => handleSelectStudent(idx, e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-500 bg-slate-50 cursor-pointer"
                              >
                                <option value="">Link account from directory (Optional)...</option>
                                {directory.map((s) => (
                                  <option key={s.user_id} value={s.user_id}>
                                    {s.full_name} (Class {s.class_code}) — @{s.username}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={p.class_code}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setParticipants((prev) => {
                                const copy = [...prev];
                                copy[idx].class_code = val;
                                return copy;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08'].map((c) => (
                              <option key={c} value={c}>
                                Class {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min={0}
                            max={activeComp.maximum_mark}
                            step={0.5}
                            value={p.mark}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setParticipants((prev) => {
                                const copy = [...prev];
                                copy[idx].mark = val;
                                return copy;
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="url"
                            value={p.certificate_url || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setParticipants((prev) => {
                                const copy = [...prev];
                                copy[idx].certificate_url = val;
                                return copy;
                              });
                            }}
                            placeholder="https://drive.google.com/..."
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-[11px] focus:ring-1 focus:ring-[#02167f]"
                            title="Paste external PDF or image download link for this student"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipantRow(idx)}
                            className="text-slate-300 hover:text-rose-500 font-bold"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Poster Link */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Winner Poster / Gallery URL (Optional)
                </label>
                <input
                  type="url"
                  value={modalPosterUrl}
                  onChange={(e) => setModalPosterUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or public poster link"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#02167f]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500">
                1st = 10 pts, 2nd = 7 pts, 3rd = 5 pts, Participant = 1 pt. Points add to both student profile and class championship!
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={savingResults || publishing}
                  onClick={handleSaveMarks}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingResults ? 'Saving...' : 'Save Draft'}</span>
                </button>

                <button
                  type="button"
                  disabled={savingResults || publishing}
                  onClick={handlePublishResults}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publishing ? 'Publishing...' : 'Publish to Live Leaderboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Result Correction & Audit History Modal */}
      {showAuditModal && <ResultAuditModal onClose={() => setShowAuditModal(false)} />}
    </div>
  );
};
