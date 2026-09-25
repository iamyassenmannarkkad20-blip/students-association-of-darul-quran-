import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  BookOpen,
  Award,
  Video,
  Briefcase,
  Users,
  Shield,
  PlusCircle,
  Trophy,
  Medal,
  Calendar,
  Compass,
  FileText,
  CheckCircle,
  FolderPlus,
  ExternalLink,
  Layers,
  Crown,
  Search,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';

export const Navbar: React.FC = () => {
  const { user, profile, assignedSubWings, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Command Palette State (Ctrl + K)
  const [commandOpen, setCommandOpen] = useState(false);

  // Desktop Dropdown State ('explore' | 'results' | 'opportunities' | 'mysadq' | 'admin' | null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<{ [key: string]: boolean }>({
    explore: false,
    results: false,
    opportunities: false,
    mysadq: true,
    admin: false,
  });

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sub-Wing Leader status
  const [hasSubWingAccess, setHasSubWingAccess] = useState(false);

  useEffect(() => {
    // Check if user is a designated Sub-Wing leader or admin
    async function checkSubWingAccess() {
      if (!user) {
        setHasSubWingAccess(false);
        return;
      }
      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        setHasSubWingAccess(true);
        return;
      }
      if (assignedSubWings && assignedSubWings.length > 0) {
        setHasSubWingAccess(true);
        return;
      }
      try {
        const res = await apiRequest<any[]>('/subwings/my');
        if (res.success && res.data && res.data.length > 0) {
          setHasSubWingAccess(true);
        } else {
          setHasSubWingAccess(false);
        }
      } catch {
        setHasSubWingAccess(false);
      }
    }
    checkSubWingAccess();
  }, [user, assignedSubWings]);

  // Close dropdown on outside click or route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileSection = (key: string) => {
    setMobileAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');

  return (
    <header className="sticky top-0 z-50 bg-[#02167f]/95 backdrop-blur-xl border-b border-[#ffd014]/25 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20" ref={dropdownRef}>
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#02167f] via-blue-900 to-[#010a38] border-2 border-[#ffd014]/60 flex items-center justify-center shadow-lg shadow-[#02167f]/40 group-hover:border-[#ffd014] group-hover:scale-105 transition-all">
              <span className="font-cinzel font-black text-[#ffd014] text-xl tracking-wider">
                S
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-black text-xl sm:text-2xl text-white tracking-wider">
                  SADQ
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest text-[#02167f] bg-[#ffd014] rounded-full shadow-sm">
                  Official
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-200/90 tracking-wider font-semibold">
                Beyond The Curriculum
              </p>
            </div>
          </Link>

          {/* DESKTOP PRIMARY NAVIGATION (5-7 Items Only) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-200">
            {/* 1. HOME */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl transition-all ${
                location.pathname === '/'
                  ? 'text-[#ffd014] bg-white/10'
                  : 'hover:text-[#ffd014] hover:bg-white/5'
              }`}
            >
              HOME
            </Link>

            {/* 2. EXPLORE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('explore')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeDropdown === 'explore' ||
                  ['/about', '/organisation', '/explore', '/events', '/library', '/magazines', '/media'].includes(
                    location.pathname
                  )
                    ? 'text-[#ffd014] bg-white/10'
                    : 'hover:text-[#ffd014] hover:bg-white/5'
                }`}
              >
                <span>EXPLORE</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'explore' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'explore' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#01092e] border border-[#ffd014]/30 shadow-2xl p-2 z-50 text-xs space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/about"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#ffd014]" />
                    <div>
                      <div className="font-bold">About SADQ</div>
                      <span className="text-[10px] text-slate-400">History & Leadership</span>
                    </div>
                  </Link>

                  <Link
                    to="/organisation"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">10 Official Units</div>
                      <span className="text-[10px] text-slate-400">CS, DW, EB, IA, LB, etc.</span>
                    </div>
                  </Link>

                  <Link
                    to="/explore"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#ffd014]" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Talents & Peer Connect</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-[#ffd014] text-[#02167f] rounded">New</span>
                      </div>
                      <span className="text-[10px] text-slate-400">All Student Profiles, Skills & WhatsApp</span>
                    </div>
                  </Link>

                  <Link
                    to="/events"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Events & Fest</div>
                      <span className="text-[10px] text-slate-400">Programs & Calendar</span>
                    </div>
                  </Link>

                  <div className="h-px bg-white/10 my-1" />

                  <Link
                    to="/library"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold">Digital Library</div>
                      <span className="text-[10px] text-slate-400">Academic & Islamic Texts</span>
                    </div>
                  </Link>

                  <Link
                    to="/magazines"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="font-bold">Magazines & Releases</div>
                      <span className="text-[10px] text-slate-400">Publications & Periodicals</span>
                    </div>
                  </Link>

                  <Link
                    to="/media"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Video className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="font-bold">Media & Broadcasts</div>
                      <span className="text-[10px] text-slate-400">Official YouTube Streams</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. RESULTS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('results')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeDropdown === 'results' ||
                  ['/results', '/class-leaderboard', '/certificates'].includes(location.pathname) ||
                  location.pathname.startsWith('/class/')
                    ? 'text-[#ffd014] bg-white/10'
                    : 'hover:text-[#ffd014] hover:bg-white/5'
                }`}
              >
                <span>RESULTS</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'results' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'results' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#01092e] border border-[#ffd014]/30 shadow-2xl p-2 z-50 text-xs space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/results"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Award className="w-4 h-4 text-[#ffd014]" />
                    <div>
                      <div className="font-bold">Competition Results</div>
                      <span className="text-[10px] text-slate-400">Published program honors</span>
                    </div>
                  </Link>

                  <Link
                    to="/class-leaderboard"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold">Class Championship Leaderboard</div>
                      <span className="text-[10px] text-slate-400">Live rankings (Classes 01-08)</span>
                    </div>
                  </Link>

                  <div className="h-px bg-white/10 my-1" />

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Class Portfolios (01 - 08)
                  </div>
                  <div className="grid grid-cols-4 gap-1 px-2 pb-1">
                    {(['01', '02', '03', '04', '05', '06', '07', '08'] as const).map((c) => (
                      <Link
                        key={c}
                        to={`/class/${c}`}
                        className="py-1 text-center font-bold text-[11px] rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors"
                      >
                        Cl. {c}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-white/10 my-1" />

                  <Link
                    to="/class-unions"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">8 Class Sangadhanakal</div>
                      <span className="text-[10px] text-slate-400">Batch unions & student leaders</span>
                    </div>
                  </Link>

                  <Link
                    to="/alumni"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Alumni Directory</div>
                      <span className="text-[10px] text-slate-400">Distinguished graduates</span>
                    </div>
                  </Link>

                  <Link
                    to="/certificates"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold">Verify Certificate</div>
                      <span className="text-[10px] text-slate-400">Official authentications</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 4. COMMUNITY (Direct link) */}
            <Link
              to="/community"
              className={`px-3 py-2 rounded-xl transition-all ${
                location.pathname === '/community'
                  ? 'text-[#ffd014] bg-white/10'
                  : 'hover:text-[#ffd014] hover:bg-white/5'
              }`}
            >
              COMMUNITY
            </Link>

            {/* 5. OPPORTUNITIES DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('opportunities')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeDropdown === 'opportunities' ||
                  ['/opportunities', '/services'].includes(location.pathname)
                    ? 'text-[#ffd014] bg-white/10'
                    : 'hover:text-[#ffd014] hover:bg-white/5'
                }`}
              >
                <span>OPPORTUNITIES</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'opportunities' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'opportunities' && (
                <div className="absolute top-full left-0 mt-2 w-60 rounded-2xl bg-[#01092e] border border-[#ffd014]/30 shadow-2xl p-2 z-50 text-xs space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    to="/opportunities"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold">Jobs & Opportunities</div>
                      <span className="text-[10px] text-slate-400">Internships & Listings</span>
                    </div>
                  </Link>

                  <Link
                    to="/services"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold">Services & Marketplace</div>
                      <span className="text-[10px] text-slate-400">Student Talents & Projects</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 6. MY SADQ DROPDOWN (Authenticated Users Only) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('mysadq')}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all font-bold ${
                    activeDropdown === 'mysadq' || location.pathname.startsWith('/student')
                      ? 'text-[#ffd014] bg-white/10'
                      : 'hover:text-[#ffd014] hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd014]" />
                  <span>MY SADQ</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'mysadq' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'mysadq' && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#01092e] border border-[#ffd014]/30 shadow-2xl p-2 z-50 text-xs space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      to="/student"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#ffd014]" />
                      <div className="font-bold">Student Dashboard</div>
                    </Link>

                    <Link
                      to="/student/profile"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FolderPlus className="w-4 h-4 text-slate-400" />
                      <div>Edit Profile & Privacy</div>
                    </Link>

                    <Link
                      to="/student/results"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold">My Honors & Class Points</div>
                        <span className="text-[10px] text-slate-400">Competition records</span>
                      </div>
                    </Link>

                    <Link
                      to="/student/create"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <div>Create Center (Posts & Notes)</div>
                    </Link>

                    <div className="h-px bg-white/10 my-1" />

                    <div className="grid grid-cols-2 gap-1 px-1">
                      <Link
                        to="/student/talents"
                        className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 text-[11px]"
                      >
                        • My Talents
                      </Link>
                      <Link
                        to="/student/skills"
                        className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 text-[11px]"
                      >
                        • My Skills
                      </Link>
                      <Link
                        to="/student/achievements"
                        className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 text-[11px]"
                      >
                        • Achievements
                      </Link>
                      <Link
                        to="/student/projects"
                        className="px-2 py-1.5 rounded-lg text-slate-300 hover:bg-white/10 text-[11px]"
                      >
                        • Projects
                      </Link>
                    </div>

                    {profile?.profile_slug && (
                      <>
                        <div className="h-px bg-white/10 my-1" />
                        <Link
                          to={`/portfolio/${profile.profile_slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#ffd014]/15 text-[#ffd014] font-bold"
                        >
                          <span>Public Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 7. ADMIN DROPDOWN (Authorized Admins Only) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('admin')}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all font-bold ${
                    activeDropdown === 'admin' || location.pathname === '/admin'
                      ? 'text-[#ffd014] bg-[#ffd014]/20 border border-[#ffd014]/50'
                      : 'hover:text-[#ffd014] hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#ffd014]" />
                  <span>ADMIN</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'admin' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'admin' && (
                  <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#01092e] border border-[#ffd014]/40 shadow-2xl p-2 z-50 text-xs space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-bold">Admin Suite Dashboard</div>
                        <span className="text-[10px] text-slate-400">Central controls</span>
                      </div>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-[#ffd014]" />
                      <div>Class Tasks & Scores</div>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Award className="w-4 h-4 text-blue-400" />
                      <div>10 Sub-Wings Leadership</div>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Video className="w-4 h-4 text-red-500" />
                      <div>Media & Broadcasts</div>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Users className="w-4 h-4 text-slate-300" />
                      <div>Students, Roles & Moderation</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* RIGHT SIDE HEADER: COMPACT CONTROLS */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Live Campus Notifications Center */}
                <NotificationCenter />

                {/* Admin Quick Suite Pill (For Admin users) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#ffd014]/20 text-[#ffd014] border border-[#ffd014]/40 rounded-xl hover:bg-[#ffd014]/30 transition-all shadow-sm"
                    title="Admin Control Suite"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#ffd014]" />
                    <span>Admin Suite</span>
                  </Link>
                )}

                {/* Dual Profile: Wing Leadership Portal Pill */}
                {hasSubWingAccess && (
                  <Link
                    to="/subwing"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                      location.pathname.startsWith('/subwing')
                        ? 'bg-[#ffd014] text-[#02167f] ring-2 ring-[#ffd014]/60 font-black shadow-md'
                        : 'bg-amber-400/20 text-[#ffd014] border border-[#ffd014]/40 hover:bg-amber-400/30'
                    }`}
                    title="Sub-Wing Operations Portal"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {assignedSubWings && assignedSubWings[0]
                        ? `${assignedSubWings[0].code} Portal`
                        : 'Wing Portal'}
                    </span>
                  </Link>
                )}

                {/* Dual Profile: Student Workspace Profile Pill */}
                <Link
                  to="/student"
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                    location.pathname.startsWith('/student')
                      ? 'bg-[#02167f] text-[#ffd014] border-2 border-[#ffd014]/80 ring-1 ring-[#ffd014]/40'
                      : 'bg-[#010a38] text-white border border-slate-700/60 hover:border-[#ffd014]'
                  }`}
                  title="My Student Growth Dashboard"
                >
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={user.fullName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#ffd014]" />
                  )}
                  <span>{user.username ? `@${user.username}` : user.fullName.split(' ')[0]}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-[#ffd014] hover:bg-white/10 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-[#02167f] bg-gradient-to-r from-[#ffd014] to-amber-300 rounded-xl hover:from-amber-200 hover:to-[#ffd014] shadow-md shadow-[#ffd014]/25 hover:scale-105 active:scale-95 transition-all ml-1"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Desktop Search Spotlight Trigger Button (Ctrl + K) */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/15 text-xs transition-all shadow-inner group ml-1"
              title="Search SADQ (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 text-[11px] font-medium hidden xl:inline">Search</span>
              <kbd className="text-[10px] font-bold text-gold-300 bg-navy-950/80 px-1.5 py-0.5 rounded border border-gold-400/30">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* MOBILE HAMBURGER & SEARCH BUTTONS */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="p-2 rounded-xl bg-white/10 text-gold-400 hover:bg-white/20 transition-colors"
              title="Search SADQ"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Live Campus Notifications Center */}
            {user && <NotificationCenter />}

            {user && (
              <Link
                to="/student"
                className="p-2 rounded-xl bg-white/10 text-[#ffd014] text-xs font-bold"
              >
                {user.fullName.split(' ')[0]}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#ffd014]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE-OVER FULL HEIGHT DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-sm bg-[#01092e] text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#ffd014]/30 z-10 p-5 space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#02167f] border border-[#ffd014] flex items-center justify-center font-cinzel font-black text-[#ffd014]">
                  S
                </div>
                <span className="font-cinzel font-black text-lg text-white">SADQ Navigation</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10"
              >
                🏠 Home
              </Link>

              {/* SECTION: EXPLORE */}
              <div className="rounded-2xl bg-white/5 overflow-hidden border border-white/5">
                <button
                  onClick={() => toggleMobileSection('explore')}
                  className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#ffd014]" />
                    <span>Explore SADQ</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileAccordion.explore ? 'rotate-180 text-[#ffd014]' : ''
                    }`}
                  />
                </button>
                {mobileAccordion.explore && (
                  <div className="p-2 pt-0 space-y-1 text-xs text-slate-300 border-t border-white/5">
                    <Link
                      to="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • About & Leadership
                    </Link>
                    <Link
                      to="/organisation"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • 10 Official Units
                    </Link>
                    <Link
                      to="/explore"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Talents Showcase
                    </Link>
                    <Link
                      to="/events"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Events & Fest
                    </Link>
                    <Link
                      to="/library"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Digital Library
                    </Link>
                    <Link
                      to="/magazines"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Magazines
                    </Link>
                    <Link
                      to="/media"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Media & Broadcasts
                    </Link>
                  </div>
                )}
              </div>

              {/* SECTION: RESULTS */}
              <div className="rounded-2xl bg-white/5 overflow-hidden border border-white/5">
                <button
                  onClick={() => toggleMobileSection('results')}
                  className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Results & Leaderboard</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileAccordion.results ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {mobileAccordion.results && (
                  <div className="p-2 pt-0 space-y-1 text-xs text-slate-300 border-t border-white/5">
                    <Link
                      to="/results"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10 font-semibold"
                    >
                      🏆 Competition Results
                    </Link>
                    <Link
                      to="/class-leaderboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10 font-semibold text-[#ffd014]"
                    >
                      🥇 Class Championship Leaderboard
                    </Link>
                    <Link
                      to="/class-unions"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      👥 8 Class Sangadhanakal
                    </Link>
                    <Link
                      to="/alumni"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      🎓 Alumni Directory
                    </Link>
                    <Link
                      to="/certificates"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      ✓ Verify Certificate
                    </Link>
                  </div>
                )}
              </div>

              {/* DIRECT: COMMUNITY */}
              <Link
                to="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10"
              >
                💬 Community Discourse
              </Link>

              {/* SECTION: OPPORTUNITIES */}
              <div className="rounded-2xl bg-white/5 overflow-hidden border border-white/5">
                <button
                  onClick={() => toggleMobileSection('opportunities')}
                  className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span>Opportunities & Services</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileAccordion.opportunities ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {mobileAccordion.opportunities && (
                  <div className="p-2 pt-0 space-y-1 text-xs text-slate-300 border-t border-white/5">
                    <Link
                      to="/opportunities"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Opportunities & Jobs
                    </Link>
                    <Link
                      to="/services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-lg hover:bg-white/10"
                    >
                      • Creative Services Marketplace
                    </Link>
                  </div>
                )}
              </div>

              {/* SECTION: MY SADQ (If Logged In) */}
              {user && (
                <div className="rounded-2xl bg-[#02167f]/50 overflow-hidden border border-[#ffd014]/30">
                  <button
                    onClick={() => toggleMobileSection('mysadq')}
                    className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-[#ffd014]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#ffd014]" />
                      <span>My SADQ Workspace</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion.mysadq ? 'rotate-180 text-[#ffd014]' : ''
                      }`}
                    />
                  </button>
                  {mobileAccordion.mysadq && (
                    <div className="p-2 pt-0 space-y-1 text-xs text-slate-200 border-t border-white/10">
                      <Link
                        to="/student"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2 rounded-lg hover:bg-white/10 font-bold"
                      >
                        • Student Dashboard
                      </Link>
                      <Link
                        to="/student/results"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2 rounded-lg hover:bg-white/10 font-bold text-emerald-300"
                      >
                        • My Honors & Class Points
                      </Link>
                      <Link
                        to="/student/create"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2 rounded-lg hover:bg-white/10"
                      >
                        • Create Center
                      </Link>
                      <Link
                        to="/student/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2 rounded-lg hover:bg-white/10"
                      >
                        • Edit Profile & Privacy
                      </Link>
                      {hasSubWingAccess && (
                        <Link
                          to="/subwing"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block p-2 rounded-lg bg-amber-400/20 text-[#ffd014] font-bold"
                        >
                          🎯 My Sub-Wing Operations Portal
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: ADMIN (If Admin) */}
              {isAdmin && (
                <div className="rounded-2xl bg-amber-950/40 overflow-hidden border border-amber-500/40">
                  <button
                    onClick={() => toggleMobileSection('admin')}
                    className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-amber-300"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Management</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion.admin ? 'rotate-180 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  {mobileAccordion.admin && (
                    <div className="p-2 pt-0 space-y-1 text-xs text-slate-300 border-t border-white/10">
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block p-2 rounded-lg hover:bg-white/10 font-bold text-white"
                      >
                        🛡️ Admin Suite Portal
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Bottom Auth Section */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Signed in as</span>
                    <strong className="text-white font-bold">
                      {user.username ? `@${user.username}` : user.fullName}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/student"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
                        location.pathname.startsWith('/student')
                          ? 'bg-[#ffd014] text-[#02167f] font-black'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      🎓 Student Mode
                    </Link>
                    {hasSubWingAccess && (
                      <Link
                        to="/subwing"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-2 text-center text-xs font-bold rounded-xl border border-amber-400/40 transition-all ${
                          location.pathname.startsWith('/subwing')
                            ? 'bg-[#ffd014] text-[#02167f] font-black'
                            : 'bg-amber-400/20 text-[#ffd014] hover:bg-amber-400/30'
                        }`}
                      >
                        🏛️ Wing Portal
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 text-center text-xs font-bold bg-amber-400/20 text-[#ffd014] rounded-xl border border-amber-400/30 col-span-2"
                      >
                        ⚡ Admin Suite Portal
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 font-bold text-xs hover:bg-red-600/30 transition-colors mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-bold border border-slate-700 rounded-xl text-slate-200 hover:bg-white/5"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#02167f] bg-[#ffd014] rounded-xl shadow-md"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette Modal (Ctrl + K) */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  );
};
