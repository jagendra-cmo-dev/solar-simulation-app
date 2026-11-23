'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSolarStore } from '../../store/useSolarStore';
import { ViewportHUD } from './ViewportHUD';
import { PANEL_SPECS } from '../../utils/constants';

// Dynamically import Three.js Scene to prevent any SSR canvas issues
const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium tracking-wide">Initializing 3D Solar Engine...</span>
    </div>
  ),
});

export const SolarViewer: React.FC = () => {
  const {
    timeOfDayHours,
    monthOfYear,
    selectedLocation,
    isPlayingDaySimulation,
    heatmapMode,
    panels,
    selectedPanelTech,
    cameraPreset,
    setTimeOfDay,
    setMonthOfYear,
    setIsPlayingDaySimulation,
    setHeatmapMode,
    setCameraPreset,
  } = useSolarStore();

  const panelSpec = PANEL_SPECS[selectedPanelTech];
  const activePanels = panels.filter((p) => p.enabled);
  const systemKwp = (activePanels.length * panelSpec.wattage) / 1000;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          } else {
            setIsFullscreen(true);
          }
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fallback to CSS overlay fullscreen
      setIsFullscreen((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-slate-950 overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none'
          : 'relative w-full h-full min-h-[420px] md:min-h-[580px] rounded-2xl border border-slate-800'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <Scene />

      {/* Floating HUD Controls */}
      <ViewportHUD
        timeOfDayHours={timeOfDayHours}
        monthOfYear={monthOfYear}
        latitude={selectedLocation.lat}
        isPlaying={isPlayingDaySimulation}
        heatmapMode={heatmapMode}
        activePanelsCount={activePanels.length}
        totalPanelsCount={panels.length}
        systemKwp={systemKwp}
        cameraPreset={cameraPreset}
        setTimeOfDay={setTimeOfDay}
        setMonthOfYear={setMonthOfYear}
        setIsPlaying={setIsPlayingDaySimulation}
        setHeatmapMode={setHeatmapMode}
        setCameraPreset={setCameraPreset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  );
};

