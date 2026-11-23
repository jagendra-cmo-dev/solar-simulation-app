'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Database,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ProposalRecord } from '../../types/database';
import { formatINR } from '../../utils/solarCalculations';

interface SavedProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProposal: (proposal: ProposalRecord) => void;
}

export const SavedProposalsModal: React.FC<SavedProposalsModalProps> = ({
  isOpen,
  onClose,
  onSelectProposal,
}) => {
  const [proposals, setProposals] = useState<ProposalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; tableExists: boolean } | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const [resList, resSetup] = await Promise.all([
        fetch('/api/proposals'),
        fetch('/api/setup'),
      ]);

      const dataList = await resList.json();
      const dataSetup = await resSetup.json();

      if (dataList.success && Array.isArray(dataList.data)) {
        setProposals(dataList.data);
      }

      setDbStatus({
        configured: dataSetup.isSupabaseConfigured,
        tableExists: dataSetup.tableExists,
      });
      setLoading(false);
    } catch (e) {
      console.error('Failed to load proposals:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function loadInitial() {
      try {
        const [resList, resSetup] = await Promise.all([
          fetch('/api/proposals'),
          fetch('/api/setup'),
        ]);

        const dataList = await resList.json();
        const dataSetup = await resSetup.json();

        if (!isCancelled) {
          if (dataList.success && Array.isArray(dataList.data)) {
            setProposals(dataList.data);
          }
          setDbStatus({
            configured: dataSetup.isSupabaseConfigured,
            tableExists: dataSetup.tableExists,
          });
        }
      } catch (e) {
        console.error('Failed to load proposals:', e);
      }
    }

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Failed to delete proposal:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Saved Proposals &amp; Cloud Database</h3>
                {dbStatus && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      dbStatus.tableExists
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {dbStatus.tableExists ? 'Supabase Connected' : 'Local Fallback / Key Pending'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Connected to Supabase PostgreSQL: <code className="text-slate-300 font-mono text-[11px]">gtftxteawgkbtauqmeuz.supabase.co</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProposals}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Refresh proposals list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Proposals */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar text-xs">
          {loading && proposals.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Fetching proposals from database...</span>
            </div>
          ) : proposals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium text-slate-300">No saved proposals yet.</p>
              <p className="text-[11px] max-w-md mx-auto text-slate-500">
                Click &quot;Save to Cloud&quot; in the header to save your active rooftop design, client data, and quotation into Supabase!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {proposals.map((item) => (
                <div
                  key={item.id}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{item.client_name}</span>
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.quotation_number}
                      </span>
                      {item.status === 'approved' ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Signed
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <strong className="text-slate-200">{item.system_kwp} kWp</strong>
                      </span>
                      <span>•</span>
                      <span>{item.active_panels_count} Panels</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400 font-medium">
                        Net: {formatINR(item.net_cost_inr)}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">{new Date(item.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectProposal(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span>Load 3D</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(item.share_slug)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Share Link"
                    >
                      {copiedId === item.share_slug ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={`/share/${item.share_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Open Public Share URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 text-slate-400 flex flex-wrap items-center justify-between text-[11px] gap-2">
          <span>{proposals.length} proposal(s) found in cloud storage</span>
          <span className="text-slate-500">Each proposal gets a shareable link like <code className="text-amber-400/90 font-mono">/share/r5vv4gvm8t</code></span>
        </div>
      </div>
    </div>
  );
};
