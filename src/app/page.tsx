'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSolarStore } from '../store/useSolarStore';
import { decodeQueryToState } from '../utils/urlState';
import { PANEL_SPECS, INDIAN_LOCATIONS } from '../utils/constants';
import {
  calculateGeneration,
  calculateFinancials,
  calculateSubsidy,
} from '../utils/solarCalculations';
import { ProposalRecord, ProposalPayload } from '../types/database';
import { Header } from '../components/ui/Header';
import { SolarViewer } from '../components/3d/SolarViewer';
import { InspectorDrawer } from '../components/configurator/InspectorDrawer';
import { KpiGrid } from '../components/dashboard/KpiGrid';
import { ApproveQuoteModal } from '../components/modals/ApproveQuoteModal';
import { ShareModal } from '../components/modals/ShareModal';
import { ProposalPreviewModal } from '../components/modals/ProposalPreviewModal';
import { AdminCustomerModal } from '../components/modals/AdminCustomerModal';
import { SavedProposalsModal } from '../components/modals/SavedProposalsModal';

function SolarAppMain() {
  const searchParams = useSearchParams();
  const {
    roofType,
    roofLength,
    roofWidth,
    roofHeight,
    parapetHeight,
    tiltAngle,
    azimuthAngle,
    rowSpacing,
    elevatedStructureHeight,
    obstructions,
    panels,
    selectedPanelTech,
    inverterType,
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
    loadShareData,
  } = useSolarStore();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Restore state from share link if provided in URL (?proposal=...)
  useEffect(() => {
    const proposalParam = searchParams.get('proposal');
    if (proposalParam) {
      const decoded = decodeQueryToState(proposalParam);
      if (decoded) {
        loadShareData(decoded);
      }
    }
  }, [searchParams, loadShareData]);

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

  // Save full design to Supabase database
  const handleSaveToCloud = async () => {
    try {
      setIsSavingToCloud(true);

      // Auto capture 3D snapshot if canvas is available
      let snapshotUrl = clientDetails.snapshotDataUrl || '';
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          snapshotUrl = canvas.toDataURL('image/png');
          updateClientDetails({ snapshotDataUrl: snapshotUrl });
        }
      } catch (err) {
        console.error('Failed to capture snapshot on save:', err);
      }

      const payload: ProposalPayload = {
        client_name: clientDetails.name,
        client_phone: clientDetails.phone,
        client_email: clientDetails.email,
        client_address: clientDetails.address,
        consumer_number: clientDetails.consumerNumber,
        sanctioned_load_kw: clientDetails.sanctionedLoadKw || 5.0,
        connection_phase: clientDetails.connectionPhase || '3-Phase',
        location_id: selectedLocation.id,
        discom_name: selectedLocation.discom,
        quotation_number: clientDetails.quotationNumber,

        roof_type: roofType,
        roof_length: roofLength,
        roof_width: roofWidth,
        roof_height: roofHeight,
        parapet_height: parapetHeight,
        tilt_angle: tiltAngle,
        azimuth_angle: azimuthAngle,
        row_spacing: rowSpacing,
        elevated_height: elevatedStructureHeight,

        panel_tech: selectedPanelTech,
        inverter_type: inverterType,
        battery_capacity_kwh: batteryCapacityKwh,
        system_kwp: genData.systemSizeKwp,
        active_panels_count: activePanels.length,
        total_panels_count: panels.length,

        annual_generation_kwh: genData.annualGenerationKwh,
        monthly_bill_inr: monthlyBillInr,
        grid_tariff_rate: gridTariffRate,
        customer_category: customerCategory,
        financing_type: financingType,
        gross_cost_inr: finMetrics.grossCostInr,
        subsidy_inr: subsidyData.totalSubsidyInr,
        net_cost_inr: finMetrics.netCostInr,
        payback_years: finMetrics.paybackYears,
        twenty_five_year_savings_inr: finMetrics.twentyFiveYearSavingsInr,
        special_discount_inr: clientDetails.specialDiscountInr || 0,

        design_state: {
          panels,
          obstructions,
        },

        epc_company_name: clientDetails.epcCompanyName,
        sales_rep_name: clientDetails.salesRepName,
        sales_rep_phone: clientDetails.salesRepPhone,
        custom_notes: clientDetails.customNotes,
        snapshot_data_url: snapshotUrl,
      };

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSavingToCloud(false);

      if (data.success && data.data) {
        setSaveToast(`Saved to database! Share Slug: ${data.data.share_slug}`);
        setTimeout(() => setSaveToast(null), 4000);
      } else {
        alert(data.error || 'Failed to save to database');
      }
    } catch (err: unknown) {
      setIsSavingToCloud(false);
      console.error('Error saving to cloud:', err);
      alert('Network error while saving to database');
    }
  };

  // Load a proposal from database into active 3D designer
  const handleSelectProposal = (p: ProposalRecord) => {
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Top Header */}
      <Header
        onOpenApproveModal={() => setIsApproveOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        onOpenPdfModal={() => setIsPdfOpen(true)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
        onOpenSavedProposalsModal={() => setIsSavedModalOpen(true)}
        onSaveToCloud={handleSaveToCloud}
        isSavingToCloud={isSavingToCloud}
      />

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span>✨</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Split-Screen Workspace (65% 3D Viewport / 35% Configurator Drawer) */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-4 max-w-[1720px] w-full mx-auto">
        {/* Left: 3D Interactive Rooftop Viewport + Bottom KPI Ribbon */}
        <section className="flex-[65] flex flex-col gap-3 min-w-0">
          <div className="flex-1 min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] relative">
            <SolarViewer />
          </div>

          {/* KPI Summary Ribbon */}
          <div className="w-full">
            <KpiGrid
              systemSizeKwp={genData.systemSizeKwp}
              annualGenKwh={genData.annualGenerationKwh}
              annualSavingsInr={finMetrics.yearOneSavingsInr}
              paybackYears={finMetrics.paybackYears}
              paybackMonths={finMetrics.paybackMonths}
              twentyFiveYearSavingsInr={finMetrics.twentyFiveYearSavingsInr}
              co2OffsetTons={finMetrics.co2OffsetTons}
              treesEquivalent={finMetrics.treesPlantedEquivalent}
            />
          </div>
        </section>

        {/* Right: Tabbed Configurator Inspector Panel */}
        <section className="flex-[35] flex flex-col min-w-0 lg:max-w-[540px] h-[720px] lg:h-[calc(100vh-5.5rem)] sticky top-4">
          <InspectorDrawer
            onOpenApproveModal={() => setIsApproveOpen(true)}
            onOpenShareModal={() => setIsShareOpen(true)}
            onDownloadPdf={() => setIsPdfOpen(true)}
            onOpenAdminModal={() => setIsAdminOpen(true)}
          />
        </section>
      </main>

      {/* Modals */}
      <SavedProposalsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onSelectProposal={handleSelectProposal}
      />

      {isAdminOpen && (
        <AdminCustomerModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onOpenPreview={() => setIsPdfOpen(true)}
        />
      )}

      <ApproveQuoteModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        netCostInr={finMetrics.netCostInr}
        systemKwp={genData.systemSizeKwp}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        systemKwp={genData.systemSizeKwp}
        netCostInr={finMetrics.netCostInr}
        annualSavingsInr={finMetrics.yearOneSavingsInr}
      />

      <ProposalPreviewModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading Solar Simulation App...
        </div>
      }
    >
      <SolarAppMain />
    </Suspense>
  );
}
