'use client';

import React from 'react';
import { Cpu, Battery, Zap, CheckCircle2 } from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_SPECS } from '../../utils/constants';
import { PanelTech, InverterType } from '../../types/solar';

export const HardwareTab: React.FC = () => {
  const {
    selectedPanelTech,
    inverterType,
    batteryCapacityKwh,
    panels,
    setSelectedPanelTech,
    setInverterType,
    setBatteryCapacity,
  } = useSolarStore();

  const activePanels = panels.filter((p) => p.enabled);
  const activeCount = activePanels.length;
  const currentSpec = PANEL_SPECS[selectedPanelTech];
  const totalKwp = (activeCount * currentSpec.wattage) / 1000;

  // Inverter sizing
  const inverterKw = Math.max(2, Math.ceil(totalKwp * 0.95));
  const dcAcRatio = inverterKw > 0 ? (totalKwp / inverterKw).toFixed(2) : '1.00';

  return (
    <div className="space-y-5 text-sm text-slate-200">
      {/* 1. Solar Module Technology */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Solar PV Module Model</span>
        </label>

        <div className="space-y-2">
          {Object.values(PANEL_SPECS).map((spec) => {
            const isSelected = selectedPanelTech === spec.id;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedPanelTech(spec.id as PanelTech)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                        }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                        {spec.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Efficiency: {spec.efficiency}% | Temp Coeff: {spec.tempCoeff}%/°C
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-amber-400">
                      {spec.wattage} Wp
                    </span>
                    <div className="text-[10px] text-slate-400">{spec.warrantyYears}-Yr Warranty</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Inverter Architecture */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Inverter Technology</span>
        </label>

        <div className="grid grid-cols-1 gap-2">
          {[
            {
              id: 'string',
              title: 'String Inverter (Grid-Tied)',
              desc: 'Dual MPPT, 98.4% peak efficiency. Most cost-effective and robust for residential roofs.',
              tag: 'Standard Recommended',
            },
            {
              id: 'microinverter',
              title: 'Microinverters (Module-Level MPPT)',
              desc: 'Independent panel MPPT. Eliminates string-wide drop from shadow of water tank/mumty.',
              tag: '+4% Yield in Shade',
            },
            {
              id: 'hybrid',
              title: 'Hybrid Energy Inverter',
              desc: 'Integrated bidirectional inverter ready for seamless battery storage & night backup.',
              tag: 'Battery Ready',
            },
          ].map((inv) => {
            const isSelected = inverterType === inv.id;
            return (
              <div
                key={inv.id}
                onClick={() => setInverterType(inv.id as InverterType)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                  ? 'bg-blue-500/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-400 bg-blue-400' : 'border-slate-600'
                        }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <span className={`font-semibold text-xs ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                      {inv.title}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-medium">
                    {inv.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-5">{inv.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Optional Battery Energy Storage (BESS) */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>Battery Storage (LiFePO4)</span>
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {batteryCapacityKwh === 0 ? 'No Battery (On-Grid)' : `${batteryCapacityKwh} kWh Pack`}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Capacity</span>
            <span className="text-white font-mono">{batteryCapacityKwh} kWh</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="5"
            value={batteryCapacityKwh}
            onChange={(e) => setBatteryCapacity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {batteryCapacityKwh > 0 ? (
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-[11px] text-emerald-300 space-y-1">
            <div className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>~{Math.round(batteryCapacityKwh / 1.2)} Hours Critical Home Backup</span>
            </div>
            <div className="text-slate-400">
              Stores excess daytime solar for 100% night self-consumption during power cuts.
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">
            Slide to add energy storage for zero-bill night backup during grid outages.
          </div>
        )}
      </div>

      {/* 4. Electrical Engineering Sizing Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          System Sizing Verification
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 block text-[10px]">Total DC Rating</span>
            <span className="font-bold text-amber-400 font-mono">{totalKwp.toFixed(2)} kWp</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 block text-[10px]">Inverter AC Rating</span>
            <span className="font-bold text-blue-400 font-mono">{inverterKw} kW AC</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 block text-[10px]">DC/AC Loading Ratio</span>
            <span className="font-bold text-emerald-400 font-mono">{dcAcRatio}x (Optimal)</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50">
            <span className="text-slate-400 block text-[10px]">Rooftop Area Used</span>
            <span className="font-bold text-slate-200 font-mono">
              {Math.round(activeCount * currentSpec.width * currentSpec.length)} m² (~{Math.round(activeCount * currentSpec.width * currentSpec.length * 10.764)} sq.ft)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

