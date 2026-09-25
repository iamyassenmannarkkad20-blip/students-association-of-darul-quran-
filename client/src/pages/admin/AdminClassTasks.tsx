import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Trophy, Plus, Calendar, ExternalLink, Sparkles, Send, Save, Trash2, CheckCircle } from 'lucide-react';

interface ClassTask {
  id: string;
  title: string;
  description: string;
  maximum_mark: number;
  task_date: string;
  task_category: string;
  winner_poster_url?: string;
  status: 'DRAFT' | 'PUBLISHED';
  classes_marked_count: number;
}

interface ClassResultInput {
  class_code: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
  mark: number;
  winner_poster_url?: string;
}

export const AdminClassTasks: React.FC = () => {
  const [tasks, setTasks] = useState<ClassTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Task Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskMaxMark, setTaskMaxMark] = useState(20);
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPosterUrl, setTaskPosterUrl] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Mark Entry Modal
  const [activeTask, setActiveTask] = useState<ClassTask | null>(null);
  const [classMarks, setClassMarks] = useState<ClassResultInput[]>([
    { class_code: '01', mark: 0 },
    { class_code: '02', mark: 0 },
    { class_code: '03', mark: 0 },
    { class_code: '04', mark: 0 },
    { class_code: '05', mark: 0 },
    { class_code: '06', mark: 0 },
    { class_code: '07', mark: 0 },
    { class_code: '08', mark: 0 },
  ]);
  const [modalPosterUrl, setModalPosterUrl] = useState('');
  const [savingMarks, setSavingMarks] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<ClassTask[]>('/admin/class-tasks');
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load class tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTask(true);
    try {
      const res = await apiRequest('/admin/class-tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          maximum_mark: Number(taskMaxMark),
          task_date: taskDate,
          winner_poster_url: taskPosterUrl,
        }),
      });

      if (res.success) {
        setShowCreateModal(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskPosterUrl('');
        fetchTasks();
      } else {
        alert(res.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Create task error', err);
    } finally {
      setSavingTask(false);
    }
  };

  const openMarkModal = async (task: ClassTask) => {
    setActiveTask(task);
    setModalPosterUrl(task.winner_poster_url || '');
    setNotice(null);

    try {
      const res = await apiRequest<{ task: ClassTask; results: any[] }>(`/admin/class-tasks/${task.id}`);
      if (res.success && res.data && res.data.results && res.data.results.length > 0) {
        // Map existing results to 01-08 classes
        const existingMap = new Map<string, number>();
        res.data.results.forEach((r) => existingMap.set(r.class_code, Number(r.mark)));

        const populated = (['01', '02', '03', '04', '05', '06', '07', '08'] as const).map((code) => ({
          class_code: code,
          mark: existingMap.get(code) || 0,
        }));
        setClassMarks(populated);
      } else {
        setClassMarks((['01', '02', '03', '04', '05', '06', '07', '08'] as const).map((code) => ({
          class_code: code,
          mark: 0,
        })));
      }
    } catch (err) {
      console.error('Failed to load task results', err);
    }
  };

  const handleSaveAndPublish = async (publishNow: boolean) => {
    if (!activeTask) return;
    setSavingMarks(true);
    setNotice(null);

    try {
      const res = await apiRequest(`/admin/class-tasks/${activeTask.id}/results`, {
        method: 'POST',
        body: JSON.stringify({
          class_results: classMarks,
          winner_poster_url: modalPosterUrl,
          publish_now: publishNow,
        }),
      });

      if (res.success) {
        setNotice(
          publishNow
            ? '🎉 Task results published! Class scores and Leaderboard updated live.'
            : 'Marks saved as draft.'
        );
        fetchTasks();
        if (publishNow) {
          setActiveTask((prev) => (prev ? { ...prev, status: 'PUBLISHED' } : null));
        }
      } else {
        setNotice(res.error || 'Failed to save marks');
      }
    } catch (err) {
      console.error('Save marks error', err);
      setNotice('Error saving task marks.');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? Any points credited to classes will be rolled back.`)) {
      return;
    }

    try {
      const res = await apiRequest(`/admin/class-tasks/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchTasks();
      } else {
        alert(res.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Delete task error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-[#02167f] uppercase tracking-wider">
            Main Committee Offline Tasks
          </span>
          <h2 className="font-cinzel text-xl sm:text-2xl font-black text-slate-900">
            Class Performance Tasks (Classes 01 - 08)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Offline tasks organized directly by the SADQ Main Committee. Marks scored by classes directly credit their live championship standing.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] text-white text-xs font-bold shadow-md hover:bg-[#0320a6] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Committee Task</span>
        </button>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02167f] mx-auto" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-cinzel text-lg font-bold text-slate-800">No Main Committee Tasks Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "+ New Committee Task" to add an offline college task, grade classes 01 through 08, and publish the results.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-[#02167f] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      task.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {task.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(task.task_date).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-cinzel font-black text-slate-900 text-base">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Max Mark:</span>
                    <strong className="text-slate-900">{task.maximum_mark}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Classes Marked:</span>
                    <strong className="text-slate-900">{task.classes_marked_count} / 8</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openMarkModal(task)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold hover:bg-[#0320a6] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{task.status === 'PUBLISHED' ? 'View / Edit Marks' : 'Enter Class Marks'}</span>
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 transition-all"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="font-cinzel text-xl font-black text-[#02167f] mb-4">
              Create Main Committee Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campus Cleanliness Drive / Independence Day Tableau"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Task details and evaluation criteria"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Task Date
                  </label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
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
                    value={taskMaxMark}
                    onChange={(e) => setTaskMaxMark(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Winner Poster URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={taskPosterUrl}
                  onChange={(e) => setTaskPosterUrl(e.target.value)}
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
                  disabled={savingTask}
                  className="px-5 py-2 rounded-xl bg-[#02167f] text-white text-xs font-bold hover:bg-[#0320a6] disabled:opacity-50"
                >
                  {savingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER MARKS MODAL */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
            <div className="overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#02167f] uppercase tracking-wider">
                    Grade Classes (01 to 08)
                  </span>
                  <h3 className="font-cinzel text-xl font-black text-slate-900">
                    {activeTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {notice && (
                <div className="p-3 rounded-xl text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                  {notice}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Winner Poster URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={modalPosterUrl}
                  onChange={(e) => setModalPosterUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#02167f] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase block">
                  Class Marks (Out of {activeTask.maximum_mark})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classMarks.map((cm, idx) => (
                    <div
                      key={cm.class_code}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <span className="font-cinzel font-black text-slate-900 text-sm">
                        Class {cm.class_code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max={activeTask.maximum_mark}
                          value={cm.mark}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setClassMarks((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, mark: val } : c))
                            );
                          }}
                          className="w-20 px-2 py-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-center focus:outline-none focus:border-[#02167f]"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSaveAndPublish(false)}
                disabled={savingMarks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAndPublish(true)}
                  disabled={savingMarks}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{savingMarks ? 'Publishing...' : 'Publish & Credit Class Scores'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
