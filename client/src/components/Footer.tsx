import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Instagram"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="YouTube"
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#071026] text-slate-400 border-t border-gold-500/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Identity Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-800 border border-gold-500/40 flex items-center justify-center">
                <span className="font-cinzel font-bold text-gold-400 text-lg">S</span>
              </div>
              <div>
                <span className="font-cinzel font-bold text-white text-lg tracking-wider">
                  SADQ
                </span>
                <p className="text-xs text-gold-400/90 font-medium">Beyond The Curriculum</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students Association of Darul Quran Islamic Academy. A dedicated ecosystem for
              student growth, leadership, creativity, community, and opportunity discovery.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/sadq__official/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-gold-500/20 border border-slate-700 hover:border-gold-500/50 flex items-center justify-center text-slate-300 hover:text-gold-400 transition-all"
                title="SADQ Official Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@sadqofficialmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-gold-500/20 border border-slate-700 hover:border-gold-500/50 flex items-center justify-center text-slate-300 hover:text-gold-400 transition-all"
                title="SADQ Official YouTube Media"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="mailto:sadqofficial@gmail.com"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-gold-500/20 border border-slate-700 hover:border-gold-500/50 flex items-center justify-center text-slate-300 hover:text-gold-400 transition-all"
                title="Email SADQ"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 font-cinzel">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About & History
                </Link>
              </li>
              <li>
                <Link to="/organisation" className="hover:text-gold-400 transition-colors">
                  10 Official Units
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-gold-400 transition-colors">
                  Digital Library
                </Link>
              </li>
              <li>
                <Link to="/magazines" className="hover:text-gold-400 transition-colors">
                  Magazines & Publications
                </Link>
              </li>
              <li>
                <Link to="/media" className="hover:text-gold-400 transition-colors">
                  Official Media & Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Opportunities */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 font-cinzel">
              Discovery & Growth
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/opportunities" className="hover:text-gold-400 transition-colors">
                  Jobs & Opportunities
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-gold-400 transition-colors">
                  Community Services
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-gold-400 transition-colors">
                  Discourse Community
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="hover:text-gold-400 transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gold-400 transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional Compliance & Integrity */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 font-cinzel">
              Platform Integrity
            </h4>
            <div className="p-3 bg-navy-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-gold-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Fake Data Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All records represent verified student work and official activities. Academic ERP,
                marks, and payment processing are permanently excluded.
              </p>
            </div>
            <p className="text-[10px] text-slate-400">
              * Social channel metrics are snapshot data and marked pending live sync.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SADQ — Students Association of Darul Quran Islamic Academy.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed for Student Growth & Community Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
