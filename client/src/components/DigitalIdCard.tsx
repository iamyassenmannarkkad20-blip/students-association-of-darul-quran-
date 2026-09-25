import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Award, QrCode, Share2, Download, CheckCircle, ExternalLink } from 'lucide-react';

interface DigitalIdCardProps {
  student: {
    fullName: string;
    username?: string;
    classCode?: string | null;
    graduationYear?: string | null;
    profileSlug?: string;
    profilePhotoUrl?: string | null;
    userId?: string;
  };
  onClose?: () => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ student, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isAlumni = student.classCode === 'ALUMNI' || !!student.graduationYear;
  
  // URL to student portfolio
  const portfolioUrl = student.profileSlug
    ? `${window.location.origin}/portfolio/${student.profileSlug}`
    : window.location.href;

  const idNumber = `SADQ-${isAlumni ? 'ALU' : 'STU'}-${student.userId ? student.userId.slice(0, 8).toUpperCase() : '2026-HQ'}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${student.fullName} - Official SADQ Digital ID & Portfolio`,
        text: `Check out ${student.fullName}'s official student profile on Darul Quran Students' Association (SADQ) platform.`,
        url: portfolioUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(portfolioUrl);
      alert('Portfolio link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-slate-800 space-y-5">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        )}

        <div className="text-center">
          <span className="text-[10px] font-black tracking-widest uppercase bg-gold-400/20 text-[#02167f] px-3 py-1 rounded-full border border-gold-400/40">
            OFFICIAL DIGITAL CREDENTIAL
          </span>
          <h3 className="font-cinzel text-lg font-black text-[#02167f] mt-2">
            SADQ DIGITAL STUDENT ID
          </h3>
          <p className="text-[11px] text-slate-500">
            Students' Association of Darul Quran
          </p>
        </div>

        {/* The Card Printable Canvas */}
        <div
          ref={cardRef}
          className="rounded-2xl bg-gradient-to-br from-[#01092e] via-[#02167f] to-[#0424b5] p-5 text-white shadow-xl relative overflow-hidden border border-[#ffd014]/40"
        >
          {/* Background Decorative Rings */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#ffd014]/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Card Top Brand */}
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffd014] text-[#02167f] flex items-center justify-center font-black text-xs shadow-md">
                DQ
              </div>
              <div>
                <div className="font-cinzel font-black text-xs text-[#ffd014] tracking-wide leading-none">
                  DARUL QURAN
                </div>
                <div className="text-[9px] text-slate-300 font-medium tracking-tight">
                  Students' Association (SADQ)
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                isAlumni ? 'bg-amber-400 text-slate-900' : 'bg-emerald-400 text-slate-900'
              }`}>
                {isAlumni ? 'ALUMNI' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="flex items-center gap-3.5 my-4">
            <div className="relative">
              {student.profilePhotoUrl ? (
                <img
                  src={student.profilePhotoUrl}
                  alt={student.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#ffd014] shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#ffd014] flex items-center justify-center text-xl font-black text-[#ffd014] shadow-md">
                  {student.fullName ? student.fullName[0].toUpperCase() : 'S'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-[#02167f]">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-white truncate leading-tight">
                {student.fullName}
              </h4>
              <div className="text-xs text-[#ffd014] font-medium truncate">
                {student.username ? `@${student.username}` : ''}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
                  {isAlumni ? `Batch of ${student.graduationYear || 'Alumni'}` : `Class ${student.classCode || '01'}`}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code and Verification Row */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">
                Digital SADQ ID
              </div>
              <div className="text-xs font-mono font-bold text-white tracking-wider truncate">
                {idNumber}
              </div>
              <div className="text-[9px] text-[#ffd014] mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#ffd014]" />
                <span>Verified Digital Pass</span>
              </div>
            </div>

            {/* Live QR Code */}
            <div className="p-1.5 bg-white rounded-xl shadow-lg shrink-0">
              <QRCodeSVG
                value={portfolioUrl}
                size={64}
                level="M"
                bgColor="#ffffff"
                fgColor="#02167f"
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-3 text-center">
            <span className="text-[9px] text-slate-300/80">
              Scan QR to view live 360° student portfolio & achievements
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Profile</span>
          </button>

          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#02167f] hover:bg-[#010e52] text-[#ffd014] text-xs font-bold transition-all shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};
