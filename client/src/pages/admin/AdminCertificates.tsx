import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  Award, Plus, Search, ExternalLink, Trash2, CheckCircle, RefreshCw,
  FileCheck, Shield, Sparkles, Check, QrCode
} from 'lucide-react';

interface CertificateRecord {
  certificate_id: string;
  recipient_name: string;
  recipient_user_id?: string;
  title: string;
  issue_date: string;
  issuer: string;
  verification_status: string;
  external_reference_url: string;
  username?: string;
  student_class?: string;
}

export const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Issue Certificate Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [certForm, setCertForm] = useState({
    certificate_id: `SADQ-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
    recipient_name: '',
    title: '',
    issuer: 'SADQ Central Executive Committee',
    issue_date: new Date().toISOString().split('T')[0],
    external_reference_url: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const url = search ? `/admin/certificates?search=${encodeURIComponent(search)}` : '/admin/certificates';
      const res = await apiRequest<CertificateRecord[]>(url);
      if (res.success && res.data) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCertificates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest('/admin/certificates', {
        method: 'POST',
        body: JSON.stringify(certForm),
      });

      if (res.success) {
        setShowIssueModal(false);
        setNotice('✅ Certificate issued & registered successfully!');
        setTimeout(() => setNotice(null), 3500);
        setCertForm({
          certificate_id: `SADQ-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
          recipient_name: '',
          title: '',
          issuer: 'SADQ Central Executive Committee',
          issue_date: new Date().toISOString().split('T')[0],
          external_reference_url: '',
        });
        fetchCertificates();
      } else {
        alert(res.error || 'Failed to issue certificate');
      }
    } catch (err) {
      console.error('Issue certificate error', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Revoke and delete certificate ${id} for ${name}?`)) return;
    try {
      const res = await apiRequest(`/admin/certificates/${id}`, { method: 'DELETE' });
      if (res.success) {
        setNotice('Certificate revoked.');
        setTimeout(() => setNotice(null), 3000);
        fetchCertificates();
      }
    } catch (err) {
      console.error('Revoke error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#02167f] text-[#ffd014] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 text-[#ffd014]" />
            <span>Official Certificates Registry</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-cinzel">
            Digital Certificate Verification & Credentials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue, manage, and verify official credentials and awards. Students can download them directly from their profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] hover:bg-[#0320a6] text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, certificate ID (e.g. SADQ-2026-CERT-...), or title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#02167f]"
          />
        </div>
        <div className="text-xs font-bold text-slate-500 whitespace-nowrap">
          {certificates.length} verified credentials registered
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#02167f]" />
            <span>Loading certificate records...</span>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Award className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No certificates registered yet.</p>
            <p className="text-xs text-slate-400">
              Certificates can be issued when publishing competition results, or standalone using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Recipient Student</th>
                  <th className="py-3 px-4">Award Title</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.certificate_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#02167f] bg-navy-50 px-2 py-0.5 rounded-md border border-navy-200">
                        {cert.certificate_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cert.recipient_name}</div>
                      {cert.username && (
                        <div className="text-[10px] text-slate-500">@{cert.username}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {cert.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cert.issuer}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(cert.issue_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {cert.external_reference_url && (
                        <a
                          href={cert.external_reference_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px]"
                          title="View / Download Certificate File"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Link</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleRevoke(cert.certificate_id, cert.recipient_name)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Revoke / Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#02167f]" />
                <span>Issue Verified Certificate</span>
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate ID *</label>
                <input
                  type="text"
                  required
                  value={certForm.certificate_id}
                  onChange={(e) => setCertForm((p) => ({ ...p, certificate_id: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Student Name *</label>
                <input
                  type="text"
                  required
                  value={certForm.recipient_name}
                  onChange={(e) => setCertForm((p) => ({ ...p, recipient_name: e.target.value }))}
                  placeholder="e.g. Hafiz Yaseen Mannarkkad"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Award Title *</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. 1st Prize — Central Hifz & Tajweed Championship"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuer Authority</label>
                  <input
                    type="text"
                    required
                    value={certForm.issuer}
                    onChange={(e) => setCertForm((p) => ({ ...p, issuer: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={certForm.issue_date}
                    onChange={(e) => setCertForm((p) => ({ ...p, issue_date: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate File / Download URL *</label>
                <input
                  type="url"
                  required
                  value={certForm.external_reference_url}
                  onChange={(e) => setCertForm((p) => ({ ...p, external_reference_url: e.target.value }))}
                  placeholder="https://drive.google.com/... or public PDF/image link"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#02167f] text-[#ffd014] text-xs font-bold hover:bg-[#0320a6] shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
