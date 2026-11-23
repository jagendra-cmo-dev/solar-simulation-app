'use client';

import React from 'react';
import {
  IndianRupee,
  MapPin,
  Building2,
  Home,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { INDIAN_LOCATIONS, PANEL_SPECS } from '../../utils/constants';
import {
  calculateGeneration,
  calculateSubsidy,
  calculateFinancials,
  formatINR,
} from '../../utils/solarCalculations';
import { GenerationChart } from '../dashboard/GenerationChart';
import { CashflowChart } from '../dashboard/CashflowChart';
import { LossBreakdownChart } from '../dashboard/LossBreakdownChart';

export const FinancialsTab: React.FC = () => {
  const {
    selectedLocation,
    monthlyBillInr,
    gridTariffRate,
    customerCategory,
    includeStateSubsidy,
    financingType,
    downPaymentPercent,
    loanInterestRate,
    loanTenureYears,
    panels,
    selectedPanelTech,
    inverterType,
    roofType,
    batteryCapacityKwh,
    setLocation,
    setMonthlyBill,
    setGridTariffRate,
    setCustomerCategory,
    setIncludeStateSubsidy,
    setFinancingType,
    setDownPaymentPercent,
    setLoanInterestRate,
    setLoanTenureYears,
  } = useSolarStore();

  const panelSpec = PANEL_SPECS[selectedPanelTech];
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

  return (
    <div className="space-y-5 text-sm text-slate-200">
      {/* 1. Location & Solar Irradiance Preset */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Location & Solar Irradiance</span>
        </label>

        <select
          value={selectedLocation.id}
          onChange={(e) => {
            const loc = INDIAN_LOCATIONS.find((l) => l.id === e.target.value);
            if (loc) setLocation(loc);
          }}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
        >
          {INDIAN_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id} className="bg-slate-900">
              {loc.name} — {loc.psh} Peak Sun Hours/day ({loc.discom})
            </option>
          ))}
        </select>

        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>DISCOM: <strong className="text-slate-200 font-normal">{selectedLocation.discom}</strong></span>
          <span className="text-amber-400 font-mono font-medium">{selectedLocation.psh} PSH/day</span>
        </div>
      </div>

      {/* 2. Customer Category & Energy Consumption */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          <span>Current Electricity Usage</span>
        </span>

        {/* Residential vs C&I Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCustomerCategory('residential')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${customerCategory === 'residential'
              ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
              : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Residential (Subsidy)</span>
          </button>
          <button
            onClick={() => setCustomerCategory('commercial')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${customerCategory === 'commercial'
              ? 'bg-blue-500/15 border-blue-500 text-blue-300 font-semibold'
              : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial (C&I / AD)</span>
          </button>
        </div>

        {/* Monthly Bill Input */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Average Monthly Bill</span>
            <span className="text-amber-400 font-mono font-bold">{formatINR(monthlyBillInr)} / mo</span>
          </div>
          <input
            type="range"
            min="1000"
            max="40000"
            step="500"
            value={monthlyBillInr}
            onChange={(e) => setMonthlyBill(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Grid Tariff Rate Input */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Grid Tariff Rate</span>
            <span className="text-white font-mono font-bold">₹{gridTariffRate.toFixed(1)} / kWh</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="15.0"
            step="0.5"
            value={gridTariffRate}
            onChange={(e) => setGridTariffRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* 3. PM Surya Ghar Subsidy Card */}
      {customerCategory === 'residential' && (
        <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/60 border border-amber-600/40 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-amber-300 uppercase tracking-wider">
                PM Surya Ghar: Muft Bijli Yojana
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {formatINR(subsidyData.totalSubsidyInr)} Subsidy
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="text-[11px] text-slate-400">Government DBT Direct Bank Transfer:</div>
            <div className="font-medium text-amber-300 text-xs">{subsidyData.subsidyBreakdown}</div>
          </div>

          {/* State Subsidy Toggle */}
          {selectedLocation.stateSubsidyPerKw ? (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="stateSubsidy"
                  checked={includeStateSubsidy}
                  onChange={(e) => setIncludeStateSubsidy(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="stateSubsidy" className="cursor-pointer">
                  Include {selectedLocation.state} State Top-up Subsidy (+{formatINR(subsidyData.stateSubsidyInr)})
                </label>
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* 4. Financing Mode: CAPEX vs Solar Loan */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
          <span>Payment & Financing Method</span>
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFinancingType('capex')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${financingType === 'capex'
              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
              : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>CAPEX (Outright Cash)</span>
          </button>
          <button
            onClick={() => setFinancingType('loan')}
            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${financingType === 'loan'
              ? 'bg-blue-500/15 border-blue-500 text-blue-300 font-semibold'
              : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Solar Bank Loan (EMI)</span>
          </button>
        </div>

        {financingType === 'loan' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Down Payment */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Down Payment (%)</span>
                <span className="text-white font-mono">{downPaymentPercent}% ({formatINR((finMetrics.netCostInr * downPaymentPercent) / 100)})</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Interest Rate */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Annual Interest Rate</span>
                <span className="text-white font-mono">{loanInterestRate}% p.a. (SBI Solar Concessional)</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="12.0"
                step="0.25"
                value={loanInterestRate}
                onChange={(e) => setLoanInterestRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Loan Tenure */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Loan Tenure</span>
                <span className="text-white font-mono">{loanTenureYears} Years ({loanTenureYears * 12} Months)</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Net Monthly Cashflow Box */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Monthly Loan EMI:</span>
                <span className="font-mono font-bold text-blue-400">{formatINR(finMetrics.monthlyEmiInr)} / mo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Monthly Bill Savings:</span>
                <span className="font-mono font-bold text-emerald-400">{formatINR(finMetrics.monthlyBillSavingsInr)} / mo</span>
              </div>
              <div className="h-px bg-blue-800/50 my-1" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Net Monthly Cash Flow:</span>
                <span
                  className={`font-mono font-bold ${finMetrics.netMonthlyGainInr >= 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                >
                  {finMetrics.netMonthlyGainInr >= 0 ? `+${formatINR(finMetrics.netMonthlyGainInr)}` : formatINR(finMetrics.netMonthlyGainInr)} / mo
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {finMetrics.netMonthlyGainInr >= 0
                  ? '✨ Solar pays for itself completely! You save money from Month 1.'
                  : 'Minimal monthly net expense until loan is cleared, then 100% pure profit.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Comprehensive Financial Summary Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Investment & Returns Summary
        </span>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Gross Turnkey Project Cost (Incl. 13.8% GST)</span>
            <span className="text-slate-200 font-mono">{formatINR(finMetrics.grossCostInr)}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Government Direct Subsidy</span>
            <span className="font-mono font-semibold">-{formatINR(subsidyData.totalSubsidyInr)}</span>
          </div>
          <div className="h-px bg-slate-800 my-1" />
          <div className="flex justify-between text-sm font-bold text-white">
            <span>Net Customer Outflow</span>
            <span className="text-amber-400 font-mono">{formatINR(finMetrics.netCostInr)}</span>
          </div>
        </div>
      </div>

      {/* 6. Charts */}
      <div className="space-y-4 pt-2">
        <GenerationChart data={genData.monthlyBreakdown} />
        <CashflowChart cashflows={finMetrics.yearlyCashflows} netCostInr={finMetrics.netCostInr} />
        <LossBreakdownChart />
      </div>
    </div>
  );
};

