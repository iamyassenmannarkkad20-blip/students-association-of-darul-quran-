import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Compass,
  BookOpen,
  Award,
  Video,
  Briefcase,
  Users,
  Shield,
  PlusCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1B3D]/95 backdrop-blur-md border-b border-gold-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 border border-gold-500/40 flex items-center justify-center shadow-lg shadow-black/30 group-hover:border-gold-400 transition-colors">
              <span className="font-cinzel font-bold text-gold-400 text-lg sm:text-xl tracking-wider">
                S
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel font-extrabold text-xl sm:text-2xl text-white tracking-wider">
                  SADQ
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider text-gold-300 bg-gold-500/10 border border-gold-500/30 rounded-full">
                  Official
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 tracking-wide font-medium">
                Beyond The Curriculum
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-200">
            <Link
              to="/about"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              About
            </Link>
            <Link
              to="/organisation"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Units
            </Link>
            <Link
              to="/library"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Library
            </Link>
            <Link
              to="/magazines"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Magazines
            </Link>
            <Link
              to="/media"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Media
            </Link>
            <Link
              to="/opportunities"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Opportunities
            </Link>
            <Link
              to="/community"
              className="px-3 py-2 rounded-lg hover:text-gold-400 hover:bg-white/5 transition-colors"
            >
              Community
            </Link>
          </nav>

          {/* User actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/40 rounded-lg hover:bg-gold-500/30 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                ) : null}

                <Link
                  to="/student/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/10"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                  Create
                </Link>

                <Link
                  to="/student"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-navy-800 text-gold-300 border border-gold-500/30 rounded-lg hover:border-gold-400 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  {user.fullName.split(' ')[0]}
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-navy-950 bg-gradient-to-r from-gold-400 to-gold-500 rounded-lg hover:from-gold-300 hover:to-gold-400 shadow-md shadow-gold-500/20 transition-all"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#071026] border-b border-gold-500/20 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            About SADQ
          </Link>
          <Link
            to="/organisation"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            10 Official Units
          </Link>
          <Link
            to="/library"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Digital Library
          </Link>
          <Link
            to="/magazines"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Magazines
          </Link>
          <Link
            to="/media"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Media & Videos
          </Link>
          <Link
            to="/opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Opportunities & Services
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Community Discourse
          </Link>
          <Link
            to="/certificates"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-white/5"
          >
            Verify Certificate
          </Link>

          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 text-center font-bold text-navy-950 bg-gold-400 rounded-lg"
                >
                  Student Dashboard ({user.fullName.split(' ')[0]})
                </Link>
                {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 text-center font-semibold text-gold-300 bg-gold-500/20 border border-gold-500/40 rounded-lg"
                  >
                    Admin Portal
                  </Link>
                ) : null}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full py-2 text-center text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-semibold border border-slate-700 rounded-lg text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-bold text-navy-950 bg-gold-400 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
