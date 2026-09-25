import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { History, Shield, RefreshCw, Search, ArrowRight, UserCheck, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  old_score: number | null;
  new_score: number | null;
  reason: string;
  changed_by_name: string | null;
  admin_username: string | null;
  action_type: string;
  created_at: string;
}

interface ResultAuditModalProps {
  onClose: () => void;
}

export const ResultAuditModal: React.FC<ResultAuditModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<AuditLog[]>('/admin/results/audit-history');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.admin_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.changed_by_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'REOPEN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">REOPENED</span>;
      case 'CORRECTION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">CORRECTED</span>;
      case 'MANUAL_OVERRIDE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">ADJUSTMENT</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#02167f] text-[#ffd014] flex items-center justify-center shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                Result Correction & Audit History Log
              </h3>
              <p className="text-xs text-slate-500">
                Complete forensic trail: Old Score ➔ New Score ➔ Reason ➔ Admin ➔ Date
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reason, admin username, or event..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#02167f]"
            />
          </div>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#02167f]' : ''}`} />
          </button>
        </div>

        {/* Logs Table / List */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No audit logs recorded yet. Any score changes will be recorded here automatically.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((l) => (
                <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getActionBadge(l.action_type)}
                      <span className="text-[10px] font-mono text-slate-400">
                        {l.entity_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(l.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Score Change Diff */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {l.old_score !== null ? `${l.old_score} pts` : '—'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      {l.new_score !== null ? `${l.new_score} pts` : '—'}
                    </span>
                  </div>

                  {/* Reason & Admin */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-0.5">Reason:</span>
                    <p className="italic text-slate-600">"{l.reason}"</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#02167f]" />
                      <span>Modified by: <strong>@{l.admin_username || l.changed_by_name || 'Admin'}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
