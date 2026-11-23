'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Mail, Share2, QrCode } from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { encodeStateToQuery } from '../../utils/urlState';
import { formatINR } from '../../utils/solarCalculations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemKwp: number;
  netCostInr: number;
  annualSavingsInr: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  systemKwp,
  netCostInr,
  annualSavingsInr,
}) => {
  const state = useSolarStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const queryString = encodeStateToQuery(state);
  const shareableUrl = `${baseUrl}?proposal=${queryString}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `☀️ *Solar Proposal for ${state.clientDetails.name}*\n` +
      `⚡ System Capacity: ${systemKwp} kWp\n` +
      `💰 Annual Electricity Savings: ${formatINR(annualSavingsInr)}\n` +
      `📉 Net Investment (after PM Surya Ghar subsidy): ${formatINR(netCostInr)}\n\n` +
      `Open your 3D Interactive Rooftop Design & Proposal:\n${shareableUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Solar PV Rooftop Proposal: ${systemKwp} kWp for ${state.clientDetails.name}`);
    const body = encodeURIComponent(
      `Dear ${state.clientDetails.name},\n\nPlease review your interactive 3D solar proposal designed for your property:\n\n${shareableUrl}\n\nKey Highlights:\n- System Size: ${systemKwp} kWp\n- Estimated Annual Savings: ${formatINR(annualSavingsInr)}\n- Net Cost (after subsidy): ${formatINR(netCostInr)}\n\nBest regards,\n${state.clientDetails.epcCompanyName}`
    );
    window.open(`mailto:${state.clientDetails.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Interactive 3D Proposal</h3>
              <p className="text-xs text-slate-400">Clients can inspect 3D shadows, financial ROI & sign online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-medium">Unique Shareable Proposal Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md whitespace-nowrap transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            This link encapsulates your complete 3D layout, enabled panels, tariffs, and BOM calculations.
          </p>
        </div>

        {/* Share Channels */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={handleWhatsApp}
            className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Send on WhatsApp</span>
          </button>

          <button
            onClick={handleEmail}
            className="p-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Send Email</span>
          </button>
        </div>

        {/* Mobile QR Scan Prompt */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-200 block">Mobile Responsive 3D Viewer</span>
            <span className="text-slate-400 text-[11px]">
              Clients can open this link directly on Android or iPhone to explore the 3D model with touch controls.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

