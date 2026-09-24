import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import { Award, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export const Certificates: React.FC = () => {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await apiRequest(`/public/certificates/${encodeURIComponent(certId.trim())}`);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'No matching certificate found in official SADQ registry.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
          <span>Credential Registry</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-navy-900">
          Certificate Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Verify authentic certificates, awards, and recognitions issued by Students Association of
          Darul Quran Islamic Academy.
        </p>
      </div>

      {/* Verification Search Form */}
      <form onSubmit={handleVerify} className="max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. SADQ-2026-001)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white shadow-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-300 font-bold text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Now'}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-emerald-300 shadow-lg space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-7 h-7 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-slate-900">Officially Verified Credential</h3>
              <p className="text-xs text-emerald-600">Record found in official SADQ registry</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
            <div>
              <span className="text-slate-400 block mb-0.5">Certificate ID</span>
              <strong className="text-slate-800 font-mono text-sm">{result.certificate_id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Issue Date</span>
              <strong className="text-slate-800">
                {new Date(result.issue_date).toLocaleDateString()}
              </strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block mb-0.5">Recipient</span>
              <strong className="text-slate-900 text-base">{result.recipient_name}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block mb-0.5">Title / Award</span>
              <strong className="text-slate-800 text-sm">{result.title}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block mb-0.5">Issuing Authority</span>
              <span className="text-slate-700">{result.issuer}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto bg-red-50 rounded-2xl p-6 border border-red-200 text-red-800 flex items-start gap-3 text-xs">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-sm">Certificate Not Found</strong>
            <p className="mt-1 text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
