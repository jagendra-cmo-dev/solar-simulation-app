'use client';

import React from 'react';
import { Zap, IndianRupee, Clock, Leaf, SunMedium, TrendingUp } from 'lucide-react';
import { formatINR, formatLakhs } from '../../utils/solarCalculations';

interface KpiGridProps {
  systemSizeKwp: number;
  annualGenKwh: number;
  annualSavingsInr: number;
  paybackYears: number;
  paybackMonths: number;
  twentyFiveYearSavingsInr: number;
  co2OffsetTons: number;
  treesEquivalent: number;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  systemSizeKwp,
  annualGenKwh,
  annualSavingsInr,
  paybackYears,
  paybackMonths,
  twentyFiveYearSavingsInr,
  co2OffsetTons,
  treesEquivalent,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {/* 1. System Capacity */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">System Size</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white font-mono">{systemSizeKwp.toFixed(2)} kWp</div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <SunMedium className="w-3 h-3 text-amber-500" />
          <span>~{Math.round((annualGenKwh / 365) * 10) / 10} kWh / day</span>
        </div>
      </div>

      {/* 2. Annual Generation */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Annual Yield</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-400 font-mono">
          {annualGenKwh.toLocaleString('en-IN')} <span className="text-xs text-slate-400 font-normal">kWh/yr</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          CUF ~19.5% (High efficiency)
        </div>
      </div>

      {/* 3. Year 1 Savings */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Year 1 Savings</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-amber-300 font-mono">{formatINR(annualSavingsInr)}</div>
        <div className="text-[11px] text-emerald-400 mt-1">
          ~{formatINR(Math.round(annualSavingsInr / 12))} / month off bill
        </div>
      </div>

      {/* 4. Payback Period */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Payback Period</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-blue-400 font-mono">
          {paybackYears} <span className="text-sm font-sans font-normal text-slate-300">yrs</span>{' '}
          {paybackMonths > 0 && <span className="text-sm font-sans font-normal text-slate-400">{paybackMonths} mos</span>}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Free electricity for remaining 21+ yrs
        </div>
      </div>

      {/* 5. 25-Year Net ROI */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">25-Yr Net Gain</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-purple-300 font-mono">{formatLakhs(twentyFiveYearSavingsInr)}</div>
        <div className="text-[11px] text-slate-400 mt-1">
          Incl. 4% inflation & 0.5% degradation
        </div>
      </div>

      {/* 6. CO2 Offset */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="text-xs font-medium uppercase tracking-wider">Green Impact</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-400 font-mono">{co2OffsetTons} Tons</div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span>🌳 Equiv. to {treesEquivalent.toLocaleString('en-IN')} trees</span>
        </div>
      </div>
    </div>
  );
};

