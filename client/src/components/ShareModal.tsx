import React, { useState } from 'react';
import {
  X,
  Share2,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  QrCode,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Assalamu Alaikum! Check out this student profile on the SADQ Platform:\n\n${title}\n${url}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  // QR Code URL via safe image service
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    url
  )}&color=02-16-7f&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 border border-gold-400/40 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-navy-900 border border-gold-400/40 flex items-center justify-center mx-auto text-gold-400 shadow">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-cinzel text-lg font-extrabold text-navy-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
          <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src={qrImageUrl}
              alt="Scan QR Code"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <p className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1">
            <QrCode className="w-3 h-3 text-gold-600" />
            Scan with phone camera to view profile
          </p>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-transparent px-2 text-slate-700 font-mono text-[11px] focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 transition-all flex items-center gap-1 shadow-sm shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title, text: subtitle, url }).catch(() => {});
              } else {
                handleCopy();
              }
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-navy-900 text-gold-300 font-bold text-xs hover:bg-navy-800 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-gold-400" />
            <span>System Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
