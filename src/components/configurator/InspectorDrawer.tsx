'use client';

import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { DesignTab } from './DesignTab';
import { HardwareTab } from './HardwareTab';
import { FinancialsTab } from './FinancialsTab';
import { BomTab } from './BomTab';

interface InspectorDrawerProps {
  onOpenApproveModal: () => void;
  onOpenShareModal: () => void;
  onDownloadPdf: () => void;
  onOpenAdminModal?: () => void;
}

type TabKey = 'design' | 'hardware' | 'financials' | 'bom';

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  onOpenApproveModal,
  onOpenShareModal,
  onDownloadPdf,
  onOpenAdminModal,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('design');

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'design', label: '3D Design', icon: Layers },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'financials', label: 'Financials & Subsidy', icon: IndianRupee },
    { id: 'bom', label: 'BOM & Quote', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-l border-slate-800/80 shadow-2xl rounded-2xl overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-2 pt-2 gap-1 overflow-x-auto select-none no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'bg-slate-950 text-amber-400 border-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
        {activeTab === 'design' && <DesignTab />}
        {activeTab === 'hardware' && <HardwareTab />}
        {activeTab === 'financials' && <FinancialsTab />}
        {activeTab === 'bom' && (
          <BomTab
            onOpenApproveModal={onOpenApproveModal}
            onOpenShareModal={onOpenShareModal}
            onDownloadPdf={onDownloadPdf}
            onOpenAdminModal={onOpenAdminModal}
          />
        )}
      </div>
    </div>
  );
};
