'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_SPECS } from '../../utils/constants';
import { BuildingRooftop } from './BuildingRooftop';
import { Obstructions } from './Obstructions';
import { SolarArray } from './SolarArray';
import { SunController } from './SunController';
import { SunPathArc } from './SunPathArc';
import { IrradianceHeatmap } from './IrradianceHeatmap';
import { SkyEnvironment } from './SkyEnvironment';

function CameraPresetController({ cameraPreset }: { cameraPreset: string }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraPreset === 'perspective') {
      controls.object.position.set(13, 11, 14);
      controls.target.set(0, 1, 0);
    } else if (cameraPreset === 'top_cad') {
      controls.object.position.set(0, 24, 0.001);
      controls.target.set(0, 0, 0);
    } else if (cameraPreset === 'south_elevation') {
      controls.object.position.set(0, 3.5, 15);
      controls.target.set(0, 1.2, 0);
    } else if (cameraPreset === 'solar_noon') {
      controls.object.position.set(10, 16, 10);
      controls.target.set(0, 0.5, 0);
    }

    controls.update();
  }, [cameraPreset]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={4}
      maxDistance={65} // Allow full sky orbit to view the entire sun path arc
      maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground horizon
    />
  );
}

export const Scene: React.FC = () => {
  const {
    roofType,
    roofLength,
    roofWidth,
    roofHeight,
    parapetHeight,
    elevatedStructureHeight,
    obstructions,
    panels,
    selectedPanelTech,
    timeOfDayHours,
    monthOfYear,
    isPlayingDaySimulation,
    heatmapMode,
    showSunPath,
    isRainy,
    cameraPreset,
    selectedLocation,
    setTimeOfDay,
    togglePanel,
  } = useSolarStore();

  const panelSpec = PANEL_SPECS[selectedPanelTech];

  return (
    <Canvas
      shadows
      camera={{ position: [13, 11, 14], fov: 45 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
    >
      {/* Dynamic Sky, Clouds, Fog, Stars & Rain */}
      <SkyEnvironment
        timeOfDayHours={timeOfDayHours}
        isRainy={isRainy}
      />

      {/* Sun & Dynamic Lighting Controller */}
      <SunController
        timeOfDayHours={timeOfDayHours}
        monthOfYear={monthOfYear}
        latitude={selectedLocation.lat}
        isPlaying={isPlayingDaySimulation}
        isRainy={isRainy}
        setTimeOfDay={setTimeOfDay}
      />

      {/* 3D Sun Path Arc & Hourly Time Markers */}
      <SunPathArc
        timeOfDayHours={timeOfDayHours}
        monthOfYear={monthOfYear}
        latitude={selectedLocation.lat}
        setTimeOfDay={setTimeOfDay}
        visible={showSunPath}
      />

      {/* Camera & Controls */}
      <CameraPresetController cameraPreset={cameraPreset} />

      {/* Building Structure & Rooftop */}
      <BuildingRooftop
        roofType={roofType}
        length={roofLength}
        width={roofWidth}
        buildingHeight={roofHeight}
        parapetHeight={parapetHeight}
        elevatedHeight={elevatedStructureHeight}
      />

      {/* Rooftop Obstructions (Water Tank, Mumty, AC Outdoor) */}
      <Obstructions obstructions={obstructions} />

      {/* Solar Irradiance Heatmap Overlay */}
      <IrradianceHeatmap
        length={roofLength}
        width={roofWidth}
        active={heatmapMode}
        obstructions={obstructions}
      />

      {/* Solar Panel Array with Individual Toggle & Racking */}
      <SolarArray
        panels={panels}
        panelSpec={panelSpec}
        heatmapMode={heatmapMode}
        onTogglePanel={togglePanel}
      />

      {/* Ground Surrounding (Lawn & Driveway Context) */}
      <group position={[0, -roofHeight - 0.01, 0]}>
        {/* Grass / Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        
        {/* Suburban Pavement / Grid Accent */}
        <gridHelper args={[80, 40, '#64748b', '#334155']} position={[0, 0.02, 0]} />
      </group>
    </Canvas>
  );
};
