'use client';

import React from 'react';
import {
  Layers,
  Maximize2,
  Compass,
  Sliders,
  CheckSquare,
  Square,
  RotateCcw,
  Box,
  Home,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { RoofType } from '../../types/solar';

export const DesignTab: React.FC = () => {
  const {
    roofType,
    roofLength,
    roofWidth,
    parapetHeight,
    tiltAngle,
    azimuthAngle,
    rowSpacing,
    elevatedStructureHeight,
    obstructions,
    panels,
    setRoofType,
    setRoofDimensions,
    setParapetHeight,
    setTiltAngle,
    setAzimuthAngle,
    setRowSpacing,
    setElevatedStructureHeight,
    toggleObstruction,
    enableAllPanels,
    disableAllPanels,
    regeneratePanelLayout,
  } = useSolarStore();

  const activeCount = panels.filter((p) => p.enabled).length;

  return (
    <div className="space-y-5 text-sm text-slate-200">
      {/* 1. Rooftop Structure Archetype */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Roof Structure Type</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'flat_rcc', label: 'Flat RCC Roof', icon: Home, desc: 'Standard terrace' },
            { id: 'tin_shed', label: 'Tin Shed / Pitched', icon: Box, desc: 'Industrial shed' },
            { id: 'elevated_pergola', label: 'Elevated Pergola', icon: Layers, desc: 'Usable 2.4m terrace' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = roofType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setRoofType(item.id as RoofType)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${isSelected
                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </div>
                <div>
                  <div className={`font-semibold text-xs ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Roof Dimensions */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Roof Dimensions</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {roofLength}m × {roofWidth}m ({(roofLength * roofWidth).toFixed(1)} m² / {Math.round(roofLength * roofWidth * 10.764)} sq ft)
          </span>
        </div>

        {/* East-West Length */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>East-West Length (X)</span>
            <span className="text-white font-mono">{roofLength} meters</span>
          </div>
          <input
            type="range"
            min="6"
            max="30"
            step="1"
            value={roofLength}
            onChange={(e) => setRoofDimensions(parseInt(e.target.value), roofWidth)}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* North-South Width */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>North-South Width (Z)</span>
            <span className="text-white font-mono">{roofWidth} meters</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={roofWidth}
            onChange={(e) => setRoofDimensions(roofLength, parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Parapet Height */}
        {roofType === 'flat_rcc' && (
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Parapet Wall Height</span>
              <span className="text-white font-mono">{parapetHeight}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={parapetHeight}
              onChange={(e) => setParapetHeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}

        {/* Elevated Pergola Height */}
        {roofType === 'elevated_pergola' && (
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Pergola Head Clearance</span>
              <span className="text-amber-400 font-mono">{elevatedStructureHeight}m (~{(elevatedStructureHeight * 3.28).toFixed(1)} ft)</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="3.5"
              step="0.1"
              value={elevatedStructureHeight}
              onChange={(e) => setElevatedStructureHeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        )}
      </div>

      {/* 3. Panel Angles & Pitch Spacing */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Array Orientation & Tilt</span>
        </span>

        {/* Tilt Angle */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Module Tilt Angle</span>
            <span className="text-white font-mono">{tiltAngle}° (Optimal: 12°-18°)</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            step="1"
            value={tiltAngle}
            onChange={(e) => setTiltAngle(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Azimuth Angle */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Azimuth Angle</span>
            <span className="text-white font-mono">
              {azimuthAngle === 0 ? '0° (True South)' : azimuthAngle < 0 ? `${Math.abs(azimuthAngle)}° East` : `${azimuthAngle}° West`}
            </span>
          </div>
          <input
            type="range"
            min="-45"
            max="45"
            step="5"
            value={azimuthAngle}
            onChange={(e) => setAzimuthAngle(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Row Pitch Spacing */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Row Spacing (Pitch Distance)</span>
            <span className="text-white font-mono">{rowSpacing.toFixed(1)}m</span>
          </div>
          <input
            type="range"
            min="1.4"
            max="3.0"
            step="0.1"
            value={rowSpacing}
            onChange={(e) => setRowSpacing(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* 4. Rooftop Obstructions */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>Rooftop Obstructions</span>
          </span>
          <span className="text-[11px] text-slate-400">Cast dynamic shadows</span>
        </div>

        <div className="space-y-2">
          {obstructions.map((obs) => {
            const isObsActive = obs.enabled;
            return (
              <div
                key={obs.id}
                onClick={() => toggleObstruction(obs.id)}
                className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${isObsActive
                  ? 'bg-slate-800/80 border-slate-700 text-white'
                  : 'bg-slate-900/40 border-slate-800/50 text-slate-400 opacity-60'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isObsActive}
                    readOnly
                    className="rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-medium">{obs.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {obs.width}m × {obs.length}m, H: {obs.height}m
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isObsActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {isObsActive ? 'Casting Shadows' : 'Hidden'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Panel Array Actions */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Active Panels: <span className="text-amber-400 font-bold">{activeCount}</span> / {panels.length}
          </span>
          <button
            onClick={regeneratePanelLayout}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Grid</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={enableAllPanels}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Enable All</span>
          </button>
          <button
            onClick={disableAllPanels}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Square className="w-3.5 h-3.5 text-rose-400" />
            <span>Disable All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

