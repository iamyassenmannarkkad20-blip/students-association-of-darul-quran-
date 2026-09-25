import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Trophy,
  Users,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  Save,
  Send,
  AlertCircle,
  Award,
} from 'lucide-react';

interface SubWing {
  id: string;
  code: string;
  name: string;
  description: string;
  chairman_name?: string;
  convener_name?: string;
}

interface ScoringRule {
  id: string;
  name: string;
  first_points: number;
  second_points: number;
  third_points: number;
  participation_points: number;
}

interface Program {
  id: string;
  sub_wing_id: string;
  title: string;
  description: string;
  program_date: string;
  maximum_mark: number;
  score_rule_id: string;
  winner_poster_url?: string;
  status: 'DRAFT' | 'PUBLISHED';
  score_rule_name?: string;
  first_points?: number;
  second_points?: number;
  third_points?: number;
  participants_count: number;
}

interface Participant {
  student_name: string;
  class_code: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
  mark: number;
  position?: number;
  class_points?: number;
  winner_poster_url?: string;
}

export const SubWingDashboard: React.FC = () => {
  const [subWings, setSubWings] = useState<SubWing[]>([]);
  const [selectedSubWing, setSelectedSubWing] = useState<SubWing | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Program Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMaxMark, setNewMaxMark] = useState(20);
  const [newRuleId, setNewRuleId] = useState('');
  const [newPosterUrl, setNewPosterUrl] = useState('');
  const [savingProgram, setSavingProgram] = useState(false);

  // Enter Marks Modal State
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [progPosterUrl, setProgPosterUrl] = useState('');
  const [savingMarks, setSavingMarks] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user's sub-wings and rules
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [swRes, rulesRes] = await Promise.all([
        apiRequest<SubWing[]>('/subwings/my'),
        apiRequest<ScoringRule[]>('/subwings/rules'),
      ]);

      if (swRes.success && swRes.data) {
        setSubWings(swRes.data);
        if (swRes.data.length > 0) {
          setSelectedSubWing(swRes.data[0]);
        }
      }

      if (rulesRes.success && rulesRes.data) {
        setScoringRules(rulesRes.data);
        if (rulesRes.data.length > 0) {
          setNewRuleId(rulesRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load subwing initial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Load programs whenever selectedSubWing changes
  const fetchPrograms = async (subWingId: string) => {
    try {
      const res = await apiRequest<Program[]>(`/subwings/${subWingId}/programs`);
      if (res.success && res.data) {
        setPrograms(res.data);
      }
    } catch (err) {
      console.error('Failed to load programs', err);
    }
  };

  useEffect(() => {
    if (selectedSubWing) {
      fetchPrograms(selectedSubWing.id);
    }
  }, [selectedSubWing]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubWing) return;
    setSavingProgram(true);
    try {
      const res = await apiRequest(`/subwings/${selectedSubWing.id}/programs`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          program_date: newDate,
          maximum_mark: Number(newMaxMark),
          score_rule_id: newRuleId,
          winner_poster_url: newPosterUrl,
        }),
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewPosterUrl('');
        fetchPrograms(selectedSubWing.id);
      } else {
        alert(res.error || 'Failed to create program');
      }
    } catch (err) {
      console.error('Create program error', err);
    } finally {
      setSavingProgram(false);
    }
  };

  const openMarksModal = async (program: Program) => {
    setActiveProgram(program);
    setFeedbackMsg(null);
    setProgPosterUrl(program.winner_poster_url || '');
    try {
      const res = await apiRequest<{ program: Program; results: any[] }>(`/subwings/programs/${program.id}`);
      if (res.success && res.data && res.data.results && res.data.results.length > 0) {
        setParticipants(
          res.data.results.map((r) => ({
            student_name: r.student_name,
            class_code: r.class_code,
            mark: Number(r.mark),
            position: r.position,
            class_points: r.class_points,
            winner_poster_url: r.winner_poster_url || '',
          }))
        );
      } else {
        // Start with 3 empty participant rows
        setParticipants([
          { student_name: '', class_code: '01', mark: 0 },
          { student_name: '', class_code: '02', mark: 0 },
          { student_name: '', class_code: '03', mark: 0 },
        ]);
      }
    } catch (err) {
      console.error('Failed to load program results', err);
    }
  };

  const addParticipantRow = () => {
    setParticipants((prev) => [...prev, { student_name: '', class_code: '01', mark: 0 }]);
  };

  const removeParticipantRow = (index: number) => {
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: any) => {
    setParticipants((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveMarks = async () => {
    if (!activeProgram) return;
    setSavingMarks(true);
    setFeedbackMsg(null);
    try {
      const validParticipants = participants.filter((p) => p.student_name.trim() !== '');
      if (validParticipants.length === 0) {
        setFeedbackMsg({ type: 'error', text: 'Please add at least one participant with a name.' });
        setSavingMarks(false);
        return;
      }

      const res = await apiRequest<Participant[]>(`/subwings/programs/${activeProgram.id}/results`, {
        method: 'POST',
        body: JSON.stringify({
          participants: validParticipants,
          winner_poster_url: progPosterUrl,
        }),
      });

      if (res.success && res.data) {
        setParticipants(res.data);
        setFeedbackMsg({ type: 'success', text: 'Marks saved! Ranks and class points auto-calculated.' });
        if (selectedSubWing) fetchPrograms(selectedSubWing.id);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to save marks.' });
      }
    } catch (err) {
      console.error('Save marks error', err);
      setFeedbackMsg({ type: 'error', text: 'Error saving marks.' });
    } finally {
      setSavingMarks(false);
    }
  };

  const handlePublishResults = async () => {
    if (!activeProgram) return;
    const confirm = window.confirm(
      'Are you sure you want to publish these results? This will officially calculate honors, update class scores on the live leaderboard, and make the results public.'
    );
    if (!confirm) return;

    setPublishing(true);
    setFeedbackMsg(null);
    try {
      // First save current state
      await handleSaveMarks();

      // Now publish
      const res = await apiRequest(`/subwings/programs/${activeProgram.id}/publish`, {
        method: 'POST',
      });

      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: '🎉 Results published successfully! Class scores updated on the Leaderboard.',
        });
        if (selectedSubWing) fetchPrograms(selectedSubWing.id);
        setActiveProgram((prev) => (prev ? { ...prev, status: 'PUBLISHED' } : null));
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to publish results.' });
      }
    } catch (err) {
      console.error('Publish error', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to publish results.' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#02167f]"></div>
      </div>
    );
  }

  if (subWings.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h1 className="font-cinzel text-2xl font-black text-slate-800">
          Sub-Wing Leadership Access Required
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md">
          You are currently not designated as Chairman or Convener for any Sub-Wing. Please contact the SADQ Main Committee Admin to assign leadership roles.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Sub-Wing Selector & Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#02167f] text-[#ffd014] text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#ffd014]" />
              <span>Sub-Wing Operations Portal</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-[#02167f]">
              {selectedSubWing?.name} ({selectedSubWing?.code})
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span>
                Chairman: <strong className="text-slate-800">{selectedSubWing?.chairman_name || 'Unassigned'}</strong>
              </span>
              <span>•</span>
              <span>
                Convener: <strong className="text-slate-800">{selectedSubWing?.convener_name || 'Unassigned'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {subWings.length > 1 && (
              <select
                aria-label="Switch Sub-Wing"
                value={selectedSubWing?.id}
                onChange={(e) => {
                  const sw = subWings.find((s) => s.id === e.target.value);
                  if (sw) setSelectedSubWing(sw);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {subWings.map((sw) => (
                  <option key={sw.id} value={sw.id}>
                    {sw.code} — {sw.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] hover:bg-[#0320a6] text-white text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Offline Program</span>
            </button>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-cinzel text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#02167f]" />
              <span>Conducted Programs ({programs.length})</span>
            </h2>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-cinzel text-lg font-bold text-slate-800">No Programs Conducted Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Click "+ New Offline Program" to schedule your offline event, record student marks, and publish class points.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:border-[#02167f] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          prog.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {prog.status === 'PUBLISHED' ? 'Published' : 'Draft Entry'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(prog.program_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-cinzel font-black text-slate-900 text-base">
                        {prog.title}
                      </h3>
                      {prog.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prog.description}</p>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Max Mark:</span>
                        <strong className="text-slate-900">{prog.maximum_mark}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Score Rule:</span>
                        <strong className="text-slate-900">{prog.score_rule_name || 'Standard (10-7-5)'}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Participants:</span>
                        <strong className="text-slate-900">{prog.participants_count}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => openMarksModal(prog)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold hover:bg-[#0320a6] transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{prog.status === 'PUBLISHED' ? 'View / Edit Marks' : 'Enter Marks'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE PROGRAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="font-cinzel text-xl font-black text-[#02167f] mb-4">
              Create Offline Program
            </h2>
            <form onSubmit={handleCreateProgram} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elocution Competition (Offline)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief notes or venue details"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Conducted Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Maximum Mark
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxMark}
                    onChange={(e) => setNewMaxMark(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Class Score Rule *
                </label>
                <select
                  value={newRuleId}
                  onChange={(e) => setNewRuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                >
                  {scoringRules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name} (1st: +{rule.first_points}, 2nd: +{rule.second_points}, 3rd: +{rule.third_points})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Winner Poster URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPosterUrl}
                  onChange={(e) => setNewPosterUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProgram}
                  className="px-5 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {savingProgram ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER MARKS MODAL */}
      {activeProgram && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div className="overflow-y-auto space-y-5 pr-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#02167f] uppercase tracking-wider">
                    Mark Entry & Rank Calculation
                  </span>
                  <h2 className="font-cinzel text-xl font-black text-slate-900">
                    {activeProgram.title}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveProgram(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {feedbackMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    feedbackMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}

              {/* Poster URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Winner Poster URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... (Leave empty if no poster published yet)"
                  value={progPosterUrl}
                  onChange={(e) => setProgPosterUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              {/* Participants Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    Participants & Marks (Max: {activeProgram.maximum_mark})
                  </span>
                  <button
                    type="button"
                    onClick={addParticipantRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#02167f] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Participant</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Student Name"
                          value={p.student_name}
                          onChange={(e) => updateParticipant(idx, 'student_name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#02167f]"
                        />
                      </div>

                      <div className="w-28">
                        <select
                          aria-label="Class Code"
                          value={p.class_code}
                          onChange={(e) => updateParticipant(idx, 'class_code', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none"
                        >
                          {(['01', '02', '03', '04', '05', '06', '07', '08'] as const).map((c) => (
                            <option key={c} value={c}>
                              Class {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <input
                          type="number"
                          min="0"
                          max={activeProgram.maximum_mark}
                          placeholder="Mark"
                          value={p.mark}
                          onChange={(e) => updateParticipant(idx, 'mark', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-center focus:outline-none focus:border-[#02167f]"
                        />
                      </div>

                      {p.position !== undefined && p.position > 0 && (
                        <div className="shrink-0 text-center w-20">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider block ${
                              p.position === 1
                                ? 'bg-amber-100 text-amber-900'
                                : p.position === 2
                                ? 'bg-slate-200 text-slate-800'
                                : p.position === 3
                                ? 'bg-amber-900/10 text-amber-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.position === 1 ? '1st' : p.position === 2 ? '2nd' : p.position === 3 ? '3rd' : 'Part.'}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            +{p.class_points} pts
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeParticipantRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white transition-all"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={savingMarks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingMarks ? 'Calculating...' : 'Calculate & Save Draft'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveProgram(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePublishResults}
                  disabled={publishing}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{publishing ? 'Publishing...' : 'Publish & Update Leaderboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
