import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Award, ShieldCheck, ExternalLink, Sparkles, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClassUnion {
  class_code: string;
  name: string;
  motto: string;
  description: string;
  logo_url: string;
  chairman_name?: string;
  chairman_username?: string;
  chairman_slug?: string;
  chairman_photo_url?: string;
  convener_name?: string;
  convener_username?: string;
  convener_slug?: string;
  convener_photo_url?: string;
  student_count: number;
  all_time_points: number;
  current_cycle_points: number;
}

export const ClassUnionsDirectory: React.FC = () => {
  const [unions, setUnions] = useState<ClassUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnionCode, setSelectedUnionCode] = useState<string | null>(null);
  const [unionDetail, setUnionDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchUnions = async () => {
      try {
        const res = await apiRequest('/class-unions');
        if (res.success && res.data) {
          setUnions(res.data);
        }
      } catch (err) {
        console.error('Failed to load class unions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnions();
  }, []);

  const handleOpenUnionModal = async (code: string) => {
    setSelectedUnionCode(code);
    setLoadingDetail(true);
    try {
      const res = await apiRequest(`/class-unions/${code}`);
      if (res.success && res.data) {
        setUnionDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load union detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#02167f] text-xs font-bold border border-blue-200 mb-4 shadow-sm">
            <Users className="w-4 h-4 text-[#02167f]" />
            <span>Campus Community Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            The 8 Class Sangadhanakal (Batch Unions)
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Each academic class from Class 01 to Senior Class 08 forms an autonomous batch union with designated student leadership, spearheading campus solidarity, academic drive, and fest competitions.
          </p>
        </div>

        {/* 8 Unions Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading Class Sangadhanakal...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unions.map((u) => (
              <div
                key={u.class_code}
                onClick={() => handleOpenUnionModal(u.class_code)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#02167f]/30 transition-all p-6 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#02167f] to-blue-900 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                      {u.class_code}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
                      {u.student_count} Scholars
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-lg group-hover:text-[#02167f] transition-colors">
                    {u.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                    "{u.motto || 'Distinction & Academic Nobility'}"
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Chairman:</span>
                      <span className="font-bold text-slate-800">
                        {u.chairman_name || <span className="text-slate-400 italic">Not Assigned</span>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Convener:</span>
                      <span className="font-bold text-slate-800">
                        {u.convener_name || <span className="text-slate-400 italic">Not Assigned</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Score: </span>
                    <strong className="text-[#02167f] font-black">{u.all_time_points} pts</strong>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#02167f] group-hover:translate-x-1 transition-transform">
                    View Roster <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: BATCH ROSTER & UNION DETAILS */}
        {selectedUnionCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-[#021359] to-[#02167f] text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Class {selectedUnionCode} Official Sangadhana
                  </div>
                  <h2 className="text-2xl font-black mt-1">
                    {unionDetail?.union?.name || `Class ${selectedUnionCode}`}
                  </h2>
                  <p className="text-xs text-blue-100/90 italic mt-0.5">
                    "{unionDetail?.union?.motto || 'Distinction & Academic Nobility'}"
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUnionCode(null)}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {loadingDetail ? (
                  <div className="py-12 text-center text-slate-400">Loading Batch Details...</div>
                ) : (
                  <>
                    {/* Leadership Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] font-bold uppercase text-slate-400">Class Chairman</div>
                        <div className="text-base font-bold text-slate-900 mt-1">
                          {unionDetail?.union?.chairman_name || 'Not Designated'}
                        </div>
                        {unionDetail?.union?.chairman_slug && (
                          <Link
                            to={`/portfolio/${unionDetail.union.chairman_slug}`}
                            className="text-xs text-[#02167f] font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View Portfolio <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[11px] font-bold uppercase text-slate-400">Class Convener</div>
                        <div className="text-base font-bold text-slate-900 mt-1">
                          {unionDetail?.union?.convener_name || 'Not Designated'}
                        </div>
                        {unionDetail?.union?.convener_slug && (
                          <Link
                            to={`/portfolio/${unionDetail.union.convener_slug}`}
                            className="text-xs text-[#02167f] font-semibold hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            View Portfolio <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Batch Members List */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                        <span>Enrolled Scholars ({unionDetail?.members?.length || 0})</span>
                      </h4>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                        {unionDetail?.members?.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No students registered in this class yet.
                          </div>
                        ) : (
                          unionDetail?.members?.map((st: any) => (
                            <div
                              key={st.user_id}
                              className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-[#02167f] font-bold text-xs flex items-center justify-center">
                                  {st.full_name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{st.full_name}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">@{st.username}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {st.certificates_count > 0 && (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    {st.certificates_count} certs
                                  </span>
                                )}
                                {st.profile_slug && (
                                  <Link
                                    to={`/portfolio/${st.profile_slug}`}
                                    className="text-xs text-[#02167f] hover:underline font-bold"
                                  >
                                    Portfolio
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
