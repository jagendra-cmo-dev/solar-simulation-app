'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSolarStore } from '@/store/useSolarStore';
import { ProposalRecord } from '@/types/database';
import { PANEL_SPECS, INDIAN_LOCATIONS } from '@/utils/constants';
import {
  calculateGeneration,
  calculateFinancials,
  calculateSubsidy,
  formatINR,
  formatLakhs,
} from '@/utils/solarCalculations';
import { SolarViewer } from '@/components/3d/SolarViewer';
import { ApproveQuoteModal } from '@/components/modals/ApproveQuoteModal';
import { ProposalPreviewModal } from '@/components/modals/ProposalPreviewModal';
import {
  Sun,
  Download,
  PenTool,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';

function ShareProposalContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalRecord | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const {
    setRoofType,
    setRoofDimensions,
    setParapetHeight,
    setTiltAngle,
    setAzimuthAngle,
    setRowSpacing,
    setElevatedStructureHeight,
    setSelectedPanelTech,
    setInverterType,
    setBatteryCapacity,
    setLocation,
    setMonthlyBill,
    setGridTariffRate,
    setCustomerCategory,
    setFinancingType,
    updateClientDetails,
    setSignature,
    panels,
    selectedPanelTech,
    selectedLocation,
    inverterType,
    roofType,
    monthlyBillInr,
    gridTariffRate,
    customerCategory,
    includeStateSubsidy,
    batteryCapacityKwh,
    financingType,
    downPaymentPercent,
    loanInterestRate,
    loanTenureYears,
    clientDetails,
  } = useSolarStore();

  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    async function fetchProposal() {
      try {
        const res = await fetch(`/api/proposals/${slug}`);
        const data = await res.json();

        if (isCancelled) return;

        if (!res.ok || !data.success || !data.data) {
          setError(data.error || 'Proposal could not be loaded');
          setLoading(false);
          return;
        }

        const p: ProposalRecord = data.data;
        setProposal(p);

        // Load proposal into 3D store
        setRoofType(p.roof_type);
        setRoofDimensions(p.roof_length, p.roof_width);
        setParapetHeight(p.parapet_height);
        setTiltAngle(p.tilt_angle);
        setAzimuthAngle(p.azimuth_angle);
        setRowSpacing(p.row_spacing);
        setElevatedStructureHeight(p.elevated_height);
        setSelectedPanelTech(p.panel_tech);
        setInverterType(p.inverter_type);
        setBatteryCapacity(p.battery_capacity_kwh);

        const loc = INDIAN_LOCATIONS.find((l) => l.id === p.location_id) || INDIAN_LOCATIONS[0];
        setLocation(loc);
        setMonthlyBill(p.monthly_bill_inr);
        setGridTariffRate(p.grid_tariff_rate);
        setCustomerCategory(p.customer_category);
        setFinancingType(p.financing_type);

        updateClientDetails({
          name: p.client_name,
          phone: p.client_phone,
          email: p.client_email,
          address: p.client_address,
          consumerNumber: p.consumer_number,
          sanctionedLoadKw: p.sanctioned_load_kw,
          connectionPhase: (p.connection_phase === 'Single Phase' || p.connection_phase === '1-Phase') ? 'Single Phase' : '3-Phase',
          quotationNumber: p.quotation_number,
          date: new Date(p.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          epcCompanyName: p.epc_company_name,
          salesRepName: p.sales_rep_name,
          salesRepPhone: p.sales_rep_phone,
          customNotes: p.custom_notes,
          specialDiscountInr: p.special_discount_inr,
          signatureDataUrl: p.signature_data_url,
          approvedAt: p.approved_at,
          snapshotDataUrl: p.snapshot_data_url,
        });

        if (p.signature_data_url) {
          setSignature(p.signature_data_url);
        }

        setLoading(false);
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('Failed to fetch shared proposal:', err);
          setError('Network error loading proposal');
          setLoading(false);
        }
      }
    }

    fetchProposal();

    return () => {
      isCancelled = true;
    };
  }, [
    slug,
    setRoofType,
    setRoofDimensions,
    setParapetHeight,
    setTiltAngle,
    setAzimuthAngle,
    setRowSpacing,
    setElevatedStructureHeight,
    setSelectedPanelTech,
    setInverterType,
    setBatteryCapacity,
    setLocation,
    setMonthlyBill,
    setGridTariffRate,
    setCustomerCategory,
    setFinancingType,
    updateClientDetails,
    setSignature,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-base font-bold text-white">Loading Interactive 3D Proposal</h2>
          <p className="text-xs text-slate-400 mt-1">Retrieving system configuration from Supabase...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 max-w-md w-full space-y-3">
          <div className="text-rose-400 font-bold text-lg">Proposal Not Found</div>
          <p className="text-xs text-slate-400">
            {error || 'This proposal link may have expired or is invalid.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Launch 3D Solar Studio
          </button>
        </div>
      </div>
    );
  }

  const panelSpec = PANEL_SPECS[selectedPanelTech];
  const activePanels = panels.filter((p) => p.enabled);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Client Header */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
            <Sun className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white">
              {clientDetails.epcCompanyName}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Proposal for: <strong className="text-slate-200">{clientDetails.name}</strong></span>
              <span>•</span>
              <span className="font-mono">{clientDetails.quotationNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {clientDetails.signatureDataUrl ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Approved &amp; Signed</span>
            </div>
          ) : (
            <button
              onClick={() => setIsApproveOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Approve Proposal</span>
            </button>
          )}

          <button
            onClick={() => setIsPdfOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Presentation Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4">
        {/* Left: 3D Rooftop Simulation Viewport */}
        <div className="flex-[65] flex flex-col gap-3 min-h-[480px] lg:min-h-[640px]">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <SolarViewer />
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Location: {selectedLocation.name} ({selectedLocation.discom})</span>
            </span>
            <span className="text-amber-400 font-mono font-semibold">
              {genData.systemSizeKwp} kWp | {activePanels.length} Panels
            </span>
          </div>
        </div>

        {/* Right: Proposal Summary & Financial Payback */}
        <div className="flex-[35] flex flex-col gap-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">System Size</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{genData.systemSizeKwp} kWp</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{activePanels.length} Tier-1 Panels</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Annual Generation</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {genData.annualGenerationKwh.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">kWh</span>
              </span>
              <span className="text-[11px] text-emerald-400/80 block mt-0.5">~{formatINR(finMetrics.yearOneSavingsInr)}/yr savings</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Simple Payback</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{finMetrics.paybackYears} Years</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Free power for 20+ yrs</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">25-Yr Net Wealth</span>
              <span className="text-xl font-bold text-purple-400 font-mono">
                {formatLakhs(finMetrics.twentyFiveYearSavingsInr)}
              </span>
              <span className="text-[11px] text-purple-300/80 block mt-0.5">Compounding savings</span>
            </div>
          </div>

          {/* Pricing & PM Surya Ghar Subsidy Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <h3 className="font-bold text-sm text-white">Commercial Pricing &amp; Subsidy</h3>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Gross Project Cost</span>
                <span className="font-mono">{formatINR(finMetrics.grossCostInr - finMetrics.gstAmountInr)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Composite Solar GST (13.8%)</span>
                <span className="font-mono">+{formatINR(finMetrics.gstAmountInr)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-200 pt-1 border-t border-slate-800">
                <span>Total Invoice Value</span>
                <span className="font-mono">{formatINR(finMetrics.grossCostInr)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-400">
                <span>PM Surya Ghar Direct Subsidy</span>
                <span className="font-mono">-{formatINR(subsidyData.totalSubsidyInr)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-semibold text-blue-400">
                  <span>Special Promotional Discount</span>
                  <span className="font-mono">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="h-px bg-slate-800 my-1" />
              <div className="flex justify-between text-base font-bold text-amber-400">
                <span>Net Customer Outflow</span>
                <span className="font-mono">{formatINR(netPayable)}</span>
              </div>
            </div>
          </div>

          {/* Signoff CTA */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-600/40 rounded-xl p-4 space-y-3">
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ready to Proceed with Solar?</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Digitally approve this quotation to lock in current equipment pricing and fast-track DISCOM net metering sanction.
              </p>
            </div>

            {clientDetails.signatureDataUrl ? (
              <div className="p-3 bg-emerald-950/50 border border-emerald-600/60 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approved on {new Date(clientDetails.approvedAt || '').toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsApproveOpen(true)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <PenTool className="w-4 h-4" />
                <span>Sign &amp; Approve Quotation</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ApproveQuoteModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        netCostInr={netPayable}
        systemKwp={genData.systemSizeKwp}
      />

      <ProposalPreviewModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
      />
    </div>
  );
}

export default function ShareProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-base font-bold text-white">Loading Interactive 3D Proposal</h2>
            <p className="text-xs text-slate-400 mt-1">Initializing proposal viewer...</p>
          </div>
        </div>
      }
    >
      <ShareProposalContent />
    </Suspense>
  );
}
