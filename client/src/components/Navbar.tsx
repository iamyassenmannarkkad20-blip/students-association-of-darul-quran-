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
  LayoutGrid,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { SideNavHub } from './SideNavHub';
import { UserProfileDrawer } from './UserProfileDrawer';

export const Navbar: React.FC = () => {
  const { user, profile, assignedSubWings, assignedClassUnion, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Command Palette State (Ctrl + K)
  const [commandOpen, setCommandOpen] = useState(false);

  // Side Drawers State (Full-height organized side menus)
  const [sideNavHubOpen, setSideNavHubOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

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
    <header className="sticky top-0 z-50 bg-[#7A211F]/95 backdrop-blur-xl border-b border-[#D6A64F]/25 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20" ref={dropdownRef}>
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#7A211F] via-blue-900 to-[#4B1718] border-2 border-[#D6A64F]/60 flex items-center justify-center shadow-lg shadow-[#7A211F]/40 group-hover:border-[#D6A64F] group-hover:scale-105 transition-all shrink-0">
              <span className="font-cinzel font-black text-[#D6A64F] text-lg sm:text-xl tracking-wider">
                S
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-cinzel font-black text-lg sm:text-2xl text-white tracking-wider">
                  SADQ
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[9px] uppercase font-black tracking-widest text-[#7A211F] bg-[#D6A64F] rounded-full shadow-sm">
                  Official
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-amber-200/90 tracking-wider font-semibold truncate max-w-[130px] sm:max-w-none">
                Beyond The Curriculum
              </p>
            </div>
          </Link>

          {/* DESKTOP PRIMARY NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-bold text-slate-200">
            {/* 1. HOME */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl transition-all ${
                location.pathname === '/'
                  ? 'text-[#D6A64F] bg-white/10'
                  : 'hover:text-[#D6A64F] hover:bg-white/5'
              }`}
            >
              HOME
            </Link>

            {/* 2. CHAMPIONSHIP LEADERBOARD */}
            <Link
              to="/class-leaderboard"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                location.pathname === '/class-leaderboard'
                  ? 'text-[#D6A64F] bg-white/10'
                  : 'hover:text-[#D6A64F] hover:bg-white/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#D6A64F]" />
              <span>CHAMPIONSHIP</span>
            </Link>

            {/* 3. STUDENTS DIRECTORY & DASHBOARDS */}
            <Link
              to="/students"
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                location.pathname === '/students'
                  ? 'text-[#D6A64F] bg-white/10'
                  : 'hover:text-[#D6A64F] hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#D6A64F]" />
              <span>STUDENTS</span>
            </Link>

            {/* 3. RESULTS */}
            <Link
              to="/results"
              className={`px-3 py-2 rounded-xl transition-all ${
                location.pathname === '/results'
                  ? 'text-[#D6A64F] bg-white/10'
                  : 'hover:text-[#D6A64F] hover:bg-white/5'
              }`}
            >
              RESULTS
            </Link>

            {/* 4. COMMUNITY */}
            <Link
              to="/community"
              className={`px-3 py-2 rounded-xl transition-all ${
                location.pathname.startsWith('/community')
                  ? 'text-[#D6A64F] bg-white/10'
                  : 'hover:text-[#D6A64F] hover:bg-white/5'
              }`}
            >
              COMMUNITY
            </Link>

            {/* 5. SIDE NAVIGATION HUB TRIGGER (All Wings, Library, Talents, Resources) */}
            <button
              onClick={() => setSideNavHubOpen(true)}
              className="px-3.5 py-2 rounded-xl flex items-center gap-2 bg-gradient-to-r from-white/10 to-[#D6A64F]/15 hover:from-[#D6A64F]/25 hover:to-white/20 text-[#D6A64F] border border-[#D6A64F]/30 hover:border-[#D6A64F]/60 transition-all shadow-sm group"
              title="Open Campus Navigation Hub (All 10 Wings, Classes, Library, Talents)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#D6A64F] group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold tracking-wide uppercase text-[11px]">Campus Hub</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-[#D6A64F] text-[#7A211F] font-black rounded-full">
                10 Wings
              </span>
            </button>
          </nav>

          {/* RIGHT SIDE HEADER: COMPACT CONTROLS */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Global Search Spotlight (Ctrl + K) */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/15 text-xs transition-all shadow-inner group"
              title="Search SADQ (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-gold-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 text-[11px] font-medium hidden xl:inline">Search</span>
              <kbd className="text-[10px] font-bold text-gold-300 bg-navy-950/80 px-1.5 py-0.5 rounded border border-gold-400/30">
                Ctrl K
              </kbd>
            </button>

            {/* Live Campus Notifications Center */}
            <NotificationCenter />

            {user ? (
              <div className="flex items-center gap-1.5">
                {/* 1. Direct Student 360 Dashboard Link */}
                <Link
                  to={`/portfolio/${user.username || profile?.profile_slug || 'yasin'}`}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm border ${
                    isAdmin
                      ? 'bg-[#4B1718] text-white border-[#D6A64F]/60 hover:bg-[#7A211F]'
                      : 'bg-[#4B1718] text-white border-slate-700/60 hover:border-[#D6A64F] hover:bg-[#7A211F]'
                  }`}
                  title="Open My 360° Student Dashboard"
                >
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={user.fullName}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-[#D6A64F]/50"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#D6A64F]" />
                  )}
                  <span className="max-w-[90px] truncate text-[#D6A64F]">
                    {user.username ? `@${user.username}` : user.fullName.split(' ')[0]}
                  </span>
                  {isAdmin ? (
                    <span className="px-1.5 py-0.5 text-[9px] bg-[#D6A64F] text-[#7A211F] font-black rounded-md">
                      Admin
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[9px] bg-gold-400/20 text-[#D6A64F] font-black rounded-md border border-[#D6A64F]/40">
                      Dashboard ↗
                    </span>
                  )}
                </Link>

                {/* 2. Menu / Portals Drawer Trigger Button */}
                <button
                  onClick={() => setProfileDrawerOpen(true)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-all"
                  title="Open Workspace Menu & Portals"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-gold-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-[#D6A64F] hover:bg-white/10 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-[#7A211F] bg-gradient-to-r from-[#D6A64F] to-amber-300 rounded-xl hover:from-amber-200 hover:to-[#D6A64F] shadow-md shadow-[#D6A64F]/25 hover:scale-105 active:scale-95 transition-all ml-1"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER & SEARCH BUTTONS */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Campus Hub Button */}
            <button
              onClick={() => setSideNavHubOpen(true)}
              className="p-2 rounded-xl bg-white/10 text-[#D6A64F] hover:bg-white/20 transition-colors"
              title="Campus Hub (10 Wings & Sections)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

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
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl bg-white/10 text-[#D6A64F] text-xs font-bold truncate max-w-[90px]"
                title="My Profile"
              >
                {user.fullName.split(' ')[0]}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#D6A64F]" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
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
          <div className="relative ml-auto w-full max-w-[85vw] sm:max-w-sm bg-[#4B1718] text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#D6A64F]/30 z-10 p-4 sm:p-5 space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#7A211F] border border-[#D6A64F] flex items-center justify-center font-cinzel font-black text-[#D6A64F]">
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
                    <Compass className="w-4 h-4 text-[#D6A64F]" />
                    <span>Explore SADQ</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      mobileAccordion.explore ? 'rotate-180 text-[#D6A64F]' : ''
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
                      className="block p-2 rounded-lg hover:bg-white/10 font-semibold text-[#D6A64F]"
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
                <div className="rounded-2xl bg-[#7A211F]/50 overflow-hidden border border-[#D6A64F]/30">
                  <button
                    onClick={() => toggleMobileSection('mysadq')}
                    className="w-full py-3 px-4 flex items-center justify-between font-bold text-sm text-[#D6A64F]"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D6A64F]" />
                      <span>My SADQ Workspace</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileAccordion.mysadq ? 'rotate-180 text-[#D6A64F]' : ''
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
                          className="block p-2 rounded-lg bg-amber-400/20 text-[#D6A64F] font-bold"
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
                    <Link
                      to={`/portfolio/${user.username || profile?.profile_slug || 'yasin'}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#D6A64F] font-bold hover:underline"
                    >
                      {user.username ? `@${user.username}` : user.fullName} ↗
                    </Link>
                  </div>
                  <Link
                    to={`/portfolio/${user.username || profile?.profile_slug || 'yasin'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D6A64F] to-amber-400 text-[#7A211F] font-black text-xs shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open My 360° Dashboard</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/student"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
                        location.pathname.startsWith('/student')
                          ? 'bg-white/20 text-[#D6A64F] font-black'
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
                            ? 'bg-[#D6A64F] text-[#7A211F] font-black'
                            : 'bg-amber-400/20 text-[#D6A64F] hover:bg-amber-400/30'
                        }`}
                      >
                        🏛️ Wing Portal
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 text-center text-xs font-bold bg-amber-400/20 text-[#D6A64F] rounded-xl border border-amber-400/30 col-span-2"
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
                      className="py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#7A211F] bg-[#D6A64F] rounded-xl shadow-md"
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
          {/* Side Navigation Hub Drawer (Campus Sections, 10 Wings, Championship, Resources) */}
      <SideNavHub isOpen={sideNavHubOpen} onClose={() => setSideNavHubOpen(false)} />

      {/* User Profile & Leadership Workspace Drawer */}
      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        user={user}
        profile={profile}
        assignedSubWings={assignedSubWings || []}
        assignedClassUnion={assignedClassUnion}
        onLogout={handleLogout}
      />
    </header>
  );
};
