'use client';

import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Play,
  Pause,
  Compass,
  Flame,
  Calendar,
  Clock,
  RotateCcw,
  X,
  GripVertical,
  Maximize2,
  Minimize2,
  CloudRain,
} from 'lucide-react';
import { MONTH_NAMES } from '../../utils/constants';
import { calculateSunPosition, getSolarTimes } from '../../utils/solarCalculations';

interface ViewportHUDProps {
  timeOfDayHours: number;
  monthOfYear: number;
  latitude: number;
  isPlaying: boolean;
  heatmapMode: boolean;
  activePanelsCount: number;
  totalPanelsCount: number;
  systemKwp: number;
  cameraPreset: string;
  setTimeOfDay: (hours: number) => void;
  setMonthOfYear: (month: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setHeatmapMode: (active: boolean) => void;
  setCameraPreset: (preset: 'perspective' | 'top_cad' | 'south_elevation' | 'solar_noon') => void;
  showSunPath?: boolean;
  setShowSunPath?: (show: boolean) => void;
  isRainy?: boolean;
  setIsRainy?: (isRainy: boolean) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ViewportHUD: React.FC<ViewportHUDProps> = ({
  timeOfDayHours,
  monthOfYear,
  latitude,
  isPlaying,
  heatmapMode,
  activePanelsCount,
  totalPanelsCount,
  systemKwp,
  cameraPreset,
  setTimeOfDay,
  setMonthOfYear,
  setIsPlaying,
  setHeatmapMode,
  setCameraPreset,
  showSunPath = true,
  setShowSunPath,
  isRainy = false,
  setIsRainy,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hintPos, setHintPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });
  const hintRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking close button, do not drag
    if ((e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    e.preventDefault();

    const el = hintRef.current;
    if (!el) return;

    const parent = el.offsetParent as HTMLElement;
    const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
    const elRect = el.getBoundingClientRect();

    const currentX = elRect.left - parentRect.left;
    const currentY = elRect.top - parentRect.top;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentX,
      initialY: currentY,
    };
    isDraggingRef.current = true;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !hintRef.current) return;
    e.stopPropagation();

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const el = hintRef.current;
    const parent = el.offsetParent as HTMLElement;
    const parentW = parent ? parent.clientWidth : window.innerWidth;
    const parentH = parent ? parent.clientHeight : window.innerHeight;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    const nextX = Math.max(10, Math.min(parentW - elW - 10, dragStartRef.current.initialX + deltaX));
    const nextY = Math.max(10, Math.min(parentH - elH - 10, dragStartRef.current.initialY + deltaY));

    setHintPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        hintRef.current?.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Format decimal hours to 12-hour AM/PM string (e.g., 14.5 -> "02:30 PM")
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  const sunData = calculateSunPosition(timeOfDayHours, monthOfYear, latitude);
  const solarTimes = getSolarTimes(monthOfYear, latitude);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Bar Overlays */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Top-Left: System Badge & Real-Time Sun Altitude/Azimuth */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* System Size Pill */}
          <div className="bg-slate-900/85 backdrop-blur-md text-white border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">System Size</span>
              <span className="text-base font-bold text-amber-400">{systemKwp.toFixed(2)} kWp</span>
            </div>
            <div className="h-6 w-px bg-slate-700/80 mx-1" />
            <div>
              <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Panels</span>
              <span className="text-sm font-semibold text-slate-200">
                {activePanelsCount} <span className="text-xs text-slate-400 font-normal">/ {totalPanelsCount}</span>
              </span>
            </div>
          </div>

          {/* Real-time Sun Angle HUD */}
          <div className="hidden sm:flex bg-slate-900/85 backdrop-blur-md text-slate-200 border border-slate-700/60 rounded-xl px-3 py-2 shadow-lg items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sun className="w-4 h-4 animate-spin-slow" />
              <span className="font-semibold">{formatTime(timeOfDayHours)}</span>
            </div>
            <div className="text-slate-400">
              Alt: <span className="text-slate-200 font-mono font-medium">{sunData.altitudeDeg}°</span>
            </div>
            <div className="text-slate-400">
              Az: <span className="text-slate-200 font-mono font-medium">{sunData.azimuthDeg}°</span>
            </div>
          </div>
        </div>

        {/* Top-Right: Compass Rose & Quick Camera View Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Compass / Orientation Indicator */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-slate-300">
            <Compass className="w-4 h-4 text-rose-500" />
            <div className="flex gap-1.5 font-bold text-[11px]">
              <span className="text-rose-500">N</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400">S (Panels)</span>
            </div>
          </div>

          {/* Camera View Switcher Presets */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-lg flex items-center gap-1">
            <button
              onClick={() => setCameraPreset('perspective')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${cameraPreset === 'perspective'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              title="3D Orbit Perspective"
            >
              3D Orbit
            </button>
            <button
              onClick={() => setCameraPreset('top_cad')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${cameraPreset === 'top_cad'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              title="2D Top-Down CAD View"
            >
              2D CAD
            </button>
            <button
              onClick={() => setCameraPreset('south_elevation')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${cameraPreset === 'south_elevation'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              title="South Facing View"
            >
              South
            </button>
          </div>

          {/* Fullscreen View Toggle */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shadow-lg transition-all ${
                isFullscreen
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-slate-700/60'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'View 3D Model in Fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">Fullscreen</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Draggable Interactive Hint (Bottom-Left by default, movable anywhere) */}
      {!hintDismissed && (
        <div
          ref={hintRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={
            hintPos
              ? { left: `${hintPos.x}px`, top: `${hintPos.y}px` }
              : undefined
          }
          className={`pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/70 hover:border-amber-500/50 rounded-full pl-2.5 pr-2 py-1 text-[11px] sm:text-xs text-slate-300 shadow-xl flex items-center gap-2 cursor-grab active:cursor-grabbing select-none transition-shadow touch-none z-20 ${
            !hintPos ? 'absolute bottom-20 left-4 sm:bottom-20 sm:left-4' : 'absolute'
          }`}
          title="Drag to reposition anywhere on the screen"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400 shrink-0" />
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <span className="whitespace-nowrap font-medium">Click any panel in 3D to toggle ON/OFF (avoid shaded zones)</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHintDismissed(true);
            }}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-0.5 cursor-pointer"
            title="Dismiss hint"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Bottom Floating Sun-Path & Simulation HUD */}
      <div className="pointer-events-auto max-w-4xl w-full mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Play/Pause Day Simulation + Digital Clock */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              title={isPlaying ? 'Pause Simulation' : 'Play Day Shadow Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Day' : 'Play Day'}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">{formatTime(timeOfDayHours)}</span>
            </div>

            {/* Heatmap Toggle Button */}
            <button
              onClick={() => setHeatmapMode(!heatmapMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${heatmapMode
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              title="Toggle Solar Radiation & Shading Heatmap"
            >
              <Flame className={`w-3.5 h-3.5 ${heatmapMode ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Heatmap</span>
            </button>
          </div>

          {/* Center: Sun-Path Time of Day Slider (6 AM to 6 PM) */}
          <div className="flex-1 w-full px-2 flex items-center gap-3">
            <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
              <Sun className="w-3 h-3" /> 6 AM
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="6.0"
                max="18.0"
                step="0.1"
                value={timeOfDayHours}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-amber-600 via-amber-300 to-indigo-600 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
              6 PM <Moon className="w-3 h-3" />
            </span>
          </div>

          {/* Right: Month Selector Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={monthOfYear}
                onChange={(e) => setMonthOfYear(parseInt(e.target.value))}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Sun to Noon Button */}
            <button
              onClick={() => setTimeOfDay(12.0)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset Sun to Solar Noon (12:00 PM)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-Bar: Seasonal Presets (Winter/Summer/Monsoon/Equinox/Today) & Sunrise/Sunset Ephemeris */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          {/* Seasonal Solstice, Monsoon & Equinox Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mr-0.5">Season:</span>
            <button
              type="button"
              onClick={() => {
                setMonthOfYear(11); // Dec 21 Winter Solstice
                setIsRainy?.(false);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                monthOfYear === 11 && !isRainy
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
              }`}
              title="Winter Solstice (Lowest Sun trajectory - Dec 21)"
            >
              Winter
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthOfYear(5); // June 21 Summer Solstice
                setIsRainy?.(false);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                monthOfYear === 5 && !isRainy
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
              }`}
              title="Summer Solstice (Highest Sun trajectory - Jun 21)"
            >
              Summer
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthOfYear(6); // July Monsoon
                setIsRainy?.(true);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                isRainy
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm ring-1 ring-cyan-300'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
              }`}
              title="Monsoon Rainy Season (Overcast Storm Clouds & Falling Rain - July/August)"
            >
              <CloudRain className={`w-3 h-3 ${isRainy ? 'text-slate-950' : 'text-cyan-400'}`} />
              <span>Monsoon</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthOfYear(2); // March 21 Equinox
                setIsRainy?.(false);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                monthOfYear === 2 && !isRainy
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
              }`}
              title="Spring Equinox (Equal Day & Night - Mar 21)"
            >
              Equinox
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthOfYear(new Date().getMonth());
                setIsRainy?.(false);
              }}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
                monthOfYear === new Date().getMonth() && monthOfYear !== 5 && monthOfYear !== 11 && monthOfYear !== 2 && !isRainy
                  ? 'bg-purple-500 text-white font-bold shadow-sm'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
              }`}
              title="Current Calendar Month"
            >
              Today
            </button>
          </div>

          {/* Ephemeris Sunrise & Sunset times */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-amber-400">
              <Sun className="w-3.5 h-3.5" />
              <span>Sunrise: <strong>{solarTimes.sunriseStr}</strong></span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-indigo-300">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sunset: <strong>{solarTimes.sunsetStr}</strong></span>
            </span>
          </div>

          {/* Sun Path 3D Toggle & Weather Rain Toggle */}
          <div className="flex items-center gap-1.5">
            {setIsRainy && (
              <button
                type="button"
                onClick={() => setIsRainy(!isRainy)}
                className={`px-2.5 py-0.5 rounded-lg font-medium text-[11px] border flex items-center gap-1.5 transition-all ${
                  isRainy
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-semibold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle 3D Falling Rain & Overcast Monsoon Sky"
              >
                <CloudRain className={`w-3 h-3 ${isRainy ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
                <span>Rain: {isRainy ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {setShowSunPath && (
              <button
                type="button"
                onClick={() => setShowSunPath(!showSunPath)}
                className={`px-2.5 py-0.5 rounded-lg font-medium text-[11px] border flex items-center gap-1.5 transition-all ${
                  showSunPath
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle 3D Sun Path Arc & Hourly Time Markers"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Sun Path: {showSunPath ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

