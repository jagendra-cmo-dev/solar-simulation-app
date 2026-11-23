'use client';

import React from 'react';
import {
  Sun,
  Share2,
  Download,
  PenTool,
  CheckCircle2,
  Sparkles,
  Zap,
  UserCheck,
  CloudUpload,
  Database,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_SPECS } from '../../utils/constants';

interface HeaderProps {
  onOpenApproveModal: () => void;
  onOpenShareModal: () => void;
  onOpenPdfModal: () => void;
  onOpenAdminModal: () => void;
  onOpenSavedProposalsModal: () => void;
  onSaveToCloud: () => void;
  isSavingToCloud?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApproveModal,
  onOpenShareModal,
  onOpenPdfModal,
  onOpenAdminModal,
  onOpenSavedProposalsModal,
  onSaveToCloud,
  isSavingToCloud = false,
}) => {
  const { panels, selectedPanelTech, clientDetails } = useSolarStore();

  const panelSpec = PANEL_SPECS[selectedPanelTech];
  const activePanels = panels.filter((p) => p.enabled);
  const systemKwp = (activePanels.length * panelSpec.wattage) / 1000;

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Brand & Client Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
          <Sun className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-tight">
              SolarCraft <span className="text-amber-400 font-normal">3D Studio</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Interactive Design
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Client: <strong className="text-slate-200 font-medium">{clientDetails.name}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-400">{clientDetails.quotationNumber}</span>
            </p>
            <button
              onClick={onOpenAdminModal}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
              title="Click to edit customer details, utility info & notes"
            >
              (Edit Details)
            </button>
          </div>
        </div>
      </div>

      {/* Middle Quick Stat Pills (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Capacity:</span>
          <span className="font-bold font-mono text-amber-400">{systemKwp.toFixed(2)} kWp</span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Modules:</span>
          <span className="font-bold font-mono text-emerald-400">{activePanels.length} Active</span>
        </div>

        {clientDetails.signatureDataUrl && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 flex items-center gap-1.5 text-emerald-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Database Proposals List */}
        <button
          onClick={onOpenSavedProposalsModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
          title="View all saved proposals stored in Supabase database"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Saved Quotes</span>
        </button>

        {/* Save to Cloud Button */}
        <button
          onClick={onSaveToCloud}
          disabled={isSavingToCloud}
          className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 transition-colors shadow-sm disabled:opacity-50"
          title="Save this 3D design and client proposal to Supabase database"
        >
          <CloudUpload className={`w-3.5 h-3.5 text-emerald-400 ${isSavingToCloud ? 'animate-bounce' : ''}`} />
          <span>{isSavingToCloud ? 'Saving...' : 'Save to DB'}</span>
        </button>

        {/* Admin Proposal Setup Trigger */}
        <button
          onClick={onOpenAdminModal}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/40 transition-colors shadow-sm"
          title="Admin: Fill client contact, utility info & custom terms"
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Customer Setup</span>
        </button>

        <button
          onClick={onOpenShareModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={onOpenPdfModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">PDF</span>
        </button>

        <button
          onClick={onOpenApproveModal}
          className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>
      </div>
    </header>
  );
};
