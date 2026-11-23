'use client';

import React from 'react';
import {
  Download,
  CheckCircle2,
  FileSpreadsheet,
  MessageCircle,
  PenTool,
  UserCheck,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_SPECS } from '../../utils/constants';
import { generateBom, exportBomToCsv, downloadCsv } from '../../utils/bomGenerator';
import {
  calculateGeneration,
  calculateSubsidy,
  calculateFinancials,
  formatINR,
} from '../../utils/solarCalculations';

interface BomTabProps {
  onOpenApproveModal: () => void;
  onOpenShareModal: () => void;
  onDownloadPdf: () => void;
  onOpenAdminModal?: () => void;
}

export const BomTab: React.FC<BomTabProps> = ({
  onOpenApproveModal,
  onDownloadPdf,
  onOpenAdminModal,
}) => {
  const {
    panels,
    selectedPanelTech,
    inverterType,
    roofType,
    batteryCapacityKwh,
    selectedLocation,
    monthlyBillInr,
    gridTariffRate,
    customerCategory,
    includeStateSubsidy,
    financingType,
    downPaymentPercent,
    loanInterestRate,
    loanTenureYears,
    clientDetails,
  } = useSolarStore();

  const panelSpec = PANEL_SPECS[selectedPanelTech];
  const activePanels = panels.filter((p) => p.enabled);
  const activeCount = activePanels.length;

  const bomItems = generateBom(
    activeCount,
    panelSpec,
    inverterType,
    roofType,
    batteryCapacityKwh
  );

  const genData = calculateGeneration(
    panels,
    panelSpec,
    selectedLocation,
    inverterType,
    roofType,
    monthlyBillInr,
    gridTariffRate
  );

  const subsidyData = calculateSubsidy(
    genData.systemSizeKwp,
    customerCategory,
    includeStateSubsidy,
    selectedLocation
  );

  const finMetrics = calculateFinancials(
    genData.systemSizeKwp,
    genData.annualGenerationKwh,
    gridTariffRate,
    customerCategory,
    includeStateSubsidy,
    selectedLocation,
    panelSpec,
    inverterType,
    roofType,
    batteryCapacityKwh,
    financingType,
    downPaymentPercent,
    loanInterestRate,
    loanTenureYears
  );

  const discount = clientDetails.specialDiscountInr || 0;
  const netPayable = Math.max(0, finMetrics.netCostInr - discount);

  const electricalItems = bomItems.filter((i) => i.category === 'Electrical');
  const structuralItems = bomItems.filter((i) => i.category === 'Structural');
  const bosItems = bomItems.filter((i) => i.category === 'Balance of System' || i.category === 'Services');

  const handleExportCsv = () => {
    const csvContent = exportBomToCsv(
      bomItems,
      clientDetails.name,
      genData.systemSizeKwp
    );
    downloadCsv(`Solar_BOM_${genData.systemSizeKwp}kWp_${clientDetails.name.replace(/\s+/g, '_')}.csv`, csvContent);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `☀️ *Solar Proposal for ${clientDetails.name}*\n` +
      `⚡ *System Capacity:* ${genData.systemSizeKwp} kWp (${activeCount} Solar Panels)\n` +
      `📍 *Location:* ${selectedLocation.name}\n` +
      `🌱 *Est. Annual Generation:* ${genData.annualGenerationKwh.toLocaleString('en-IN')} kWh/yr\n` +
      `💰 *Year 1 Electricity Savings:* ${formatINR(finMetrics.yearOneSavingsInr)}/yr\n` +
      `🏛️ *PM Surya Ghar Subsidy:* ${formatINR(subsidyData.totalSubsidyInr)}\n` +
      `📉 *Net Outflow:* ${formatINR(netPayable)}\n` +
      `⏱️ *Payback Period:* ~${finMetrics.paybackYears} Years\n\n` +
      `View your interactive 3D solar design & proposal online:\n${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5 text-sm text-slate-200">
      {/* Admin Customer Setup Shortcut Box */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-white">Client: {clientDetails.name}</div>
            <div className="text-[11px] text-slate-400">{clientDetails.phone} | {clientDetails.consumerNumber}</div>
          </div>
        </div>
        {onOpenAdminModal && (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-medium text-xs border border-slate-700 transition-colors whitespace-nowrap"
          >
            Edit Client Info
          </button>
        )}
      </div>

      {/* 1. Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={onDownloadPdf}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={handleExportCsv}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={onOpenApproveModal}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Sign & Approve</span>
        </button>
      </div>

      {/* Signature Status Banner if signed */}
      {clientDetails.signatureDataUrl && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/50 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-semibold">Quotation Digitally Approved</span>
              <span className="text-[10px] text-slate-400 block">
                Signed by {clientDetails.name} on {new Date(clientDetails.approvedAt || '').toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-900/60 font-mono text-[11px] text-emerald-300">
            {clientDetails.quotationNumber}
          </span>
        </div>
      )}

      {/* 2. BOM Category: Electrical Package */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="bg-slate-800/60 px-3.5 py-2 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            1. Electrical Equipment & Balance of System
          </span>
          <span className="text-xs text-slate-400">{electricalItems.length} Items</span>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {electricalItems.map((item) => (
            <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-slate-800/30">
              <div className="space-y-0.5 flex-1 min-w-[180px]">
                <div className="font-medium text-slate-200">{item.name}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{item.specification}</div>
                <div className="text-[10px] text-slate-500">HSN: {item.hsnCode}</div>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="font-bold text-slate-200 font-mono">{formatINR(item.totalPrice)}</div>
                <div className="text-[11px] text-slate-400">
                  {item.quantity} {item.unit} @ {formatINR(item.unitRate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BOM Category: Structural Package */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="bg-slate-800/60 px-3.5 py-2 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            2. Module Mounting Structure (MMS)
          </span>
          <span className="text-xs text-slate-400">{structuralItems.length} Items</span>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {structuralItems.map((item) => (
            <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-slate-800/30">
              <div className="space-y-0.5 flex-1 min-w-[180px]">
                <div className="font-medium text-slate-200">{item.name}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{item.specification}</div>
                <div className="text-[10px] text-slate-500">HSN: {item.hsnCode}</div>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="font-bold text-slate-200 font-mono">{formatINR(item.totalPrice)}</div>
                <div className="text-[11px] text-slate-400">
                  {item.quantity} {item.unit} @ {formatINR(item.unitRate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BOM Category: Installation & Liaison */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="bg-slate-800/60 px-3.5 py-2 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            3. Turnkey Services & DISCOM Liaison
          </span>
          <span className="text-xs text-slate-400">{bosItems.length} Items</span>
        </div>

        <div className="divide-y divide-slate-800/60 overflow-x-auto">
          {bosItems.map((item) => (
            <div key={item.id} className="p-3 text-xs flex items-start justify-between gap-3 hover:bg-slate-800/30">
              <div className="space-y-0.5 flex-1 min-w-[180px]">
                <div className="font-medium text-slate-200">{item.name}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{item.specification}</div>
                <div className="text-[10px] text-slate-500">SAC: {item.hsnCode}</div>
              </div>
              <div className="text-right whitespace-nowrap">
                <div className="font-bold text-slate-200 font-mono">{formatINR(item.totalPrice)}</div>
                <div className="text-[11px] text-slate-400">
                  {item.quantity} {item.unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Costing Totals & Subsidy Ledger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-300">
          <span>Equipment & Installation Subtotal</span>
          <span className="font-mono">{formatINR(finMetrics.grossCostInr - finMetrics.gstAmountInr)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Composite Solar GST (13.8%)</span>
          <span className="font-mono">+{formatINR(finMetrics.gstAmountInr)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-200 pt-1 border-t border-slate-800">
          <span>Gross Invoice Amount</span>
          <span className="font-mono">{formatINR(finMetrics.grossCostInr)}</span>
        </div>
        <div className="flex justify-between font-semibold text-emerald-400">
          <span>PM Surya Ghar Central & State Subsidy (DBT)</span>
          <span className="font-mono">-{formatINR(subsidyData.totalSubsidyInr)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between font-semibold text-blue-400">
            <span>Special Admin Promotional Discount</span>
            <span className="font-mono">-{formatINR(discount)}</span>
          </div>
        )}

        <div className="h-px bg-slate-700/60 my-1" />
        <div className="flex justify-between text-base font-bold text-amber-400">
          <span>Net Final Payable by Client</span>
          <span className="font-mono">{formatINR(netPayable)}</span>
        </div>
      </div>
    </div>
  );
};
