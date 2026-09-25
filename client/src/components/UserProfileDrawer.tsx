import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  Crown,
  Award,
  Users,
  Sparkles,
  Layers,
  FolderGit2,
  FileCheck,
  Eye,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { AssignedSubWing } from '../context/AuthContext';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  assignedSubWings: AssignedSubWing[];
  assignedClassUnion: any | null;
  onLogout: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  assignedSubWings,
  assignedClassUnion,
  onLogout,
}) => {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const hasSubWingRole = assignedSubWings && assignedSubWings.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#01092e] text-white shadow-2xl border-l border-[#ffd014]/30 flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#02167f] to-[#01092e]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffd014] via-amber-200 to-[#ffd014] p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-[#02167f] flex items-center justify-center font-cinzel font-black text-[#ffd014]">
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#ffd014]" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white text-base truncate">
                  {user.fullName}
                </h3>
                <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold truncate">
                  <span>@{user.username || 'user'}</span>
                  {profile?.class_code && (
                    <span className="px-2 py-0.2 rounded-md bg-[#ffd014]/20 text-[#ffd014] text-[10px] font-black">
                      Class {profile.class_code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs no-scrollbar scroll-touch">
            {/* 1. LEADERSHIP & PRIVILEGE PORTALS (High-priority action tiles) */}
            {(isAdmin || hasSubWingRole || assignedClassUnion) && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Official Leadership Portals
                </span>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/50 hover:border-amber-400 shadow-md group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
                        <Crown className="w-5 h-5 text-[#02167f]" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                          Central Admin Suite
                        </div>
                        <span className="text-[11px] text-amber-200/80">
                          Cycles, offline competitions, ledger & users
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-300" />
                  </Link>
                )}

                {hasSubWingRole && (
                  <Link
                    to="/subwing"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-transparent border border-blue-400/50 hover:border-blue-400 shadow-md group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#02167f] text-[#ffd014] border border-[#ffd014]/50 flex items-center justify-center font-black shadow">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                          {assignedSubWings[0]?.code} Operations Portal
                        </div>
                        <span className="text-[11px] text-blue-200/80">
                          {assignedSubWings[0]?.leadership_role} • Mark entry & tasks
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-300" />
                  </Link>
                )}

                {assignedClassUnion && (
                  <Link
                    to="/student/class-union"
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600/25 via-purple-600/20 to-transparent border border-indigo-400/50 hover:border-indigo-400 shadow-md group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-black shadow">
                        <Users className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                          Class {assignedClassUnion.class_code} Union Portal
                        </div>
                        <span className="text-[11px] text-indigo-200/80">
                          {assignedClassUnion.leadership_role} • Batch releases & identity
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-300" />
                  </Link>
                )}
              </div>
            )}

            {/* 2. STUDENT GROWTH WORKSPACE */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Growth Workspace
              </span>

              <div className="grid grid-cols-1 gap-1.5">
                <Link
                  to="/student"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-[#ffd014]" />
                  <span className="font-bold">Student Growth Dashboard</span>
                </Link>

                <Link
                  to="/student/create"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold">Create Center</span>
                    <span className="text-[10px] text-slate-400 block">
                      Submit articles, community posts & study notes
                    </span>
                  </div>
                </Link>

                <Link
                  to="/student/results"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
                >
                  <Award className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold">My Honors & Trophies</span>
                    <span className="text-[10px] text-slate-400 block">
                      Individual scores and batch championship contribution
                    </span>
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Link
                    to="/student/talents"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>My Talents</span>
                  </Link>

                  <Link
                    to="/student/skills"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>My Skills</span>
                  </Link>

                  <Link
                    to="/student/achievements"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Achievements</span>
                  </Link>

                  <Link
                    to="/student/projects"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Projects</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. PUBLIC PORTFOLIO PREVIEW */}
            {profile?.profile_slug && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 border border-gold-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gold-400 block">
                    Public Discovery
                  </span>
                  <span className="font-bold text-white text-xs">
                    Your 360° Student Portfolio
                  </span>
                </div>
                <Link
                  to={`/portfolio/${profile.profile_slug}`}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-[#ffd014] text-[#02167f] text-xs font-black hover:bg-amber-300 transition-colors flex items-center gap-1 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>
              </div>
            )}

            {/* 4. SETTINGS & ACCOUNT */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Link
                to="/student/profile"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">Edit Profile, Bio & Privacy</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

          {/* Drawer Footer: Logout */}
          <div className="p-4 sm:p-5 bg-black/40 border-t border-white/10 flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">
              Signed in as <strong className="text-white">@{user.username || 'user'}</strong>
            </span>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all border border-rose-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
