'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle,
  Sun,
  Shield,
  Award,
  Camera,
  Edit3,
  Check,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_SPECS } from '../../utils/constants';
import { generateBom } from '../../utils/bomGenerator';
import {
  calculateGeneration,
  calculateSubsidy,
  calculateFinancials,
  formatINR,
  formatLakhs,
} from '../../utils/solarCalculations';
import { exportProposalPdf } from '../../utils/pdfExport';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminModal?: () => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  isOpen,
  onClose,
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
    updateClientDetails,
    tiltAngle,
  } = useSolarStore();

  const [isExporting, setIsExporting] = useState(false);
  const [snapshotCaptured, setSnapshotCaptured] = useState(false);

  if (!isOpen) return null;

  const panelSpec = PANEL_SPECS[selectedPanelTech];
  const activePanels = panels.filter((p) => p.enabled);
  const activeCount = activePanels.length;

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
  const finalPayableAfterDiscount = Math.max(0, finMetrics.netCostInr - discount);

  const bomItems = generateBom(
    activeCount,
    panelSpec,
    inverterType,
    roofType,
    batteryCapacityKwh
  );

  const handleCapture3D = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        updateClientDetails({ snapshotDataUrl: dataUrl });
        setSnapshotCaptured(true);
        setTimeout(() => setSnapshotCaptured(false), 2000);
      }
    } catch (e) {
      console.error('Failed to capture 3D view:', e);
    }
  };

  const handleDownload = async () => {
    // If no snapshot yet, auto capture canvas before download
    if (!clientDetails.snapshotDataUrl) {
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          updateClientDetails({ snapshotDataUrl: dataUrl });
        }
      } catch (e) {
        console.error(e);
      }
    }

    setIsExporting(true);
    const filename = `Solar_Proposal_${clientDetails.name.replace(/\s+/g, '_')}_${genData.systemSizeKwp}kWp.pdf`;
    await exportProposalPdf('proposal-document-content', filename);
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Client Proposal Document Preview</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
              {clientDetails.quotationNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick 3D Snapshot Button */}
            <button
              onClick={handleCapture3D}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
              title="Capture 3D Rooftop view and embed into document"
            >
              {snapshotCaptured ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">3D Captured</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{clientDetails.snapshotDataUrl ? 'Retake 3D' : 'Embed 3D Snapshot'}</span>
                </>
              )}
            </button>

            {/* Edit Customer Data Trigger */}
            {onOpenAdminModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Client Details</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40">
          <div
            id="proposal-document-content"
            className="bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-lg mx-auto max-w-3xl space-y-6"
            style={{ minHeight: '1000px', fontFamily: 'Arial, sans-serif' }}
          >
            {/* 1. Proposal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xl">
                  <Sun className="w-6 h-6 text-amber-500" />
                  <span>{clientDetails.epcCompanyName}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Solar EPC & Clean Energy Solutions Provider<br />
                  Email: {clientDetails.epcEmail} | Phone: {clientDetails.epcPhone}
                  {clientDetails.salesRepName && (
                    <div className="mt-0.5 text-slate-700 font-medium">
                      Representative: {clientDetails.salesRepName} ({clientDetails.salesRepPhone || clientDetails.epcPhone})
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right sm:text-right text-xs space-y-0.5">
                <div className="font-mono text-sm font-bold text-slate-800">Proposal #{clientDetails.quotationNumber}</div>
                <div className="text-slate-500">Date: {clientDetails.date}</div>
                <div className="text-slate-500">Valid Till: {clientDetails.validityDays || 30} Days from issue</div>
              </div>
            </div>

            {/* 2. Client Details Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold tracking-wider">
                  Client & Installation Address
                </span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{clientDetails.name}</span>
                <span className="text-slate-600 block mt-0.5 leading-relaxed">{clientDetails.address}</span>
                <span className="text-slate-600 block mt-0.5">Phone: {clientDetails.phone}</span>
                {clientDetails.email && <span className="text-slate-600 block">Email: {clientDetails.email}</span>}
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold tracking-wider">
                  Utility Connection & Technical Load
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">DISCOM: {selectedLocation.discom}</span>
                <span className="text-slate-600 block font-mono">Consumer ID: {clientDetails.consumerNumber}</span>
                <span className="text-slate-600 block">
                  Sanctioned Load: {clientDetails.sanctionedLoadKw || 5.0} kW | {clientDetails.connectionPhase || '3-Phase'}
                </span>
                <span className="text-slate-600 block">Location: {selectedLocation.name}</span>
                <span className="text-slate-600 block">Solar Insolation: {selectedLocation.psh} Peak Sun Hours/day</span>
              </div>
            </div>

            {/* 3. 3D Rooftop Simulation Snapshot (Embedded 3D View!) */}
            {clientDetails.snapshotDataUrl && (
              <div className="space-y-1.5 border border-slate-200 rounded-lg p-3 bg-slate-50/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                    3D Rooftop Solar Layout & Shadow Simulation
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Tilt: {tiltAngle}° South | {activeCount} Modules Active
                  </span>
                </div>
                <div className="w-full h-48 sm:h-56 rounded-md overflow-hidden bg-slate-900 border border-slate-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={clientDetails.snapshotDataUrl}
                    alt="3D Solar Design Snapshot"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* 4. Executive Technical Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Executive System Sizing & Technical Specification
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] text-amber-700 block uppercase font-semibold">System Capacity</span>
                  <span className="font-bold text-base text-amber-900 font-mono">{genData.systemSizeKwp} kWp</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-[10px] text-blue-700 block uppercase font-semibold">PV Modules</span>
                  <span className="font-bold text-base text-blue-900 font-mono">{activeCount} Panels</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] text-emerald-700 block uppercase font-semibold">Annual Generation</span>
                  <span className="font-bold text-base text-emerald-900 font-mono">
                    {genData.annualGenerationKwh.toLocaleString('en-IN')} kWh
                  </span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-[10px] text-purple-700 block uppercase font-semibold">CO2 Offset</span>
                  <span className="font-bold text-base text-purple-900 font-mono">{finMetrics.co2OffsetTons} Tons</span>
                </div>
              </div>
            </div>

            {/* 5. Financial & PM Surya Ghar Subsidy Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Commercial Pricing & Subsidy Ledger
              </h4>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-700">Gross Turnkey Project Cost (Module, Inverter, Structure, Installation)</td>
                    <td className="p-2.5 text-right font-mono text-slate-800">
                      {formatINR(finMetrics.grossCostInr - finMetrics.gstAmountInr)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-700">Composite Solar GST @ 13.8% (70% goods @ 12% + 30% services @ 18%)</td>
                    <td className="p-2.5 text-right font-mono text-slate-800">+{formatINR(finMetrics.gstAmountInr)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="p-2.5 text-slate-900">Total Invoice Amount</td>
                    <td className="p-2.5 text-right font-mono text-slate-900">{formatINR(finMetrics.grossCostInr)}</td>
                  </tr>
                  <tr className="text-emerald-700 bg-emerald-50 font-semibold">
                    <td className="p-2.5">
                      PM Surya Ghar: Muft Bijli Yojana Central & State Subsidy (Direct Bank Transfer)
                    </td>
                    <td className="p-2.5 text-right font-mono">-{formatINR(subsidyData.totalSubsidyInr)}</td>
                  </tr>

                  {discount > 0 && (
                    <tr className="text-blue-700 bg-blue-50 font-semibold">
                      <td className="p-2.5">Special EPC Promotional Discount</td>
                      <td className="p-2.5 text-right font-mono">-{formatINR(discount)}</td>
                    </tr>
                  )}

                  <tr className="bg-amber-100 text-slate-950 font-bold text-sm">
                    <td className="p-3">Net Outflow Payable by Client</td>
                    <td className="p-3 text-right font-mono">{formatINR(finalPayableAfterDiscount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. 25-Year ROI & Lifetime Savings */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                25-Year Financial Return & Payback
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">Year 1 Electricity Savings</span>
                  <span className="font-bold text-sm text-emerald-700 font-mono">
                    {formatINR(finMetrics.yearOneSavingsInr)} / yr
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Simple Payback Period</span>
                  <span className="font-bold text-sm text-blue-700 font-mono">
                    {finMetrics.paybackYears} Years {finMetrics.paybackMonths > 0 && `${finMetrics.paybackMonths} Months`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">25-Year Cumulative Net Profit</span>
                  <span className="font-bold text-sm text-purple-700 font-mono">
                    {formatLakhs(finMetrics.twentyFiveYearSavingsInr)}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Key Bill of Materials Highlights */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                Major Bill of Materials (BOM) Components
              </h4>
              <table className="w-full text-[11px] border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2 text-left">Item Name</th>
                    <th className="p-2 text-left">Specification</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Rate</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bomItems.slice(0, 6).map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 font-medium text-slate-900">{item.name}</td>
                      <td className="p-2 text-slate-600 text-[10px]">{item.specification}</td>
                      <td className="p-2 text-center text-slate-700">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2 text-right font-mono text-slate-700">{formatINR(item.unitRate)}</td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-900">
                        {formatINR(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 8. Custom Scope of Work & Terms */}
            {clientDetails.customNotes && (
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                  Scope of Supply & Execution Terms
                </span>
                <p className="text-slate-600 leading-relaxed">{clientDetails.customNotes}</p>
              </div>
            )}

            {/* 9. Warranties & Guarantee */}
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="p-2 border border-slate-200 rounded flex items-center gap-1.5 text-slate-700">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>25-30 Year Module Warranty</span>
              </div>
              <div className="p-2 border border-slate-200 rounded flex items-center gap-1.5 text-slate-700">
                <Award className="w-4 h-4 text-blue-600" />
                <span>5-10 Year Inverter Warranty</span>
              </div>
              <div className="p-2 border border-slate-200 rounded flex items-center gap-1.5 text-slate-700">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span>5-Year EPC Installation SLA</span>
              </div>
            </div>

            {/* 10. Sign-off / Signature Stamp Section */}
            <div className="border-t border-slate-300 pt-4 flex justify-between items-end text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Authorized EPC Representative</span>
                <div className="font-bold text-slate-800">{clientDetails.epcCompanyName}</div>
                {clientDetails.salesRepName && (
                  <div className="text-slate-600 text-[11px]">{clientDetails.salesRepName}</div>
                )}
                <div className="text-slate-500 text-[10px]">Authorized Signatory & Seal</div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-slate-500 text-[10px] block uppercase font-semibold">Client Acceptance</span>
                {clientDetails.signatureDataUrl ? (
                  <div className="inline-block border border-slate-300 rounded p-1 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={clientDetails.signatureDataUrl}
                      alt="Client Signature"
                      className="h-10 w-28 object-contain"
                    />
                    <span className="text-[9px] text-emerald-700 block font-mono">
                      Signed: {new Date(clientDetails.approvedAt || '').toLocaleDateString('en-IN')}
                    </span>
                  </div>
                ) : (
                  <div className="w-36 h-12 border-b border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-[10px]">
                    Signature Stamp
                  </div>
                )}
                <div className="font-semibold text-slate-800">{clientDetails.name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
