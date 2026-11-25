'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { calculateSunPosition } from '../../utils/solarCalculations';

interface SunControllerProps {
  timeOfDayHours: number;
  monthOfYear: number;
  latitude: number;
  isPlaying: boolean;
  isRainy?: boolean;
  setTimeOfDay: (hours: number) => void;
}

export const SunController: React.FC<SunControllerProps> = ({
  timeOfDayHours,
  monthOfYear,
  latitude,
  isPlaying,
  isRainy = false,
  setTimeOfDay,
}) => {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Animation ticker for Day Simulation
  useFrame((_, delta) => {
    if (isPlaying) {
      // Advance by ~1.5 hours per real second
      let nextTime = timeOfDayHours + delta * 1.5;
      if (nextTime > 18.0) {
        nextTime = 6.0; // loop back to sunrise
      }
      setTimeOfDay(Math.round(nextTime * 100) / 100);
    }
  });

  const sunData = calculateSunPosition(timeOfDayHours, monthOfYear, latitude);

  return (
    <group>
      {/* Dynamic Sun Directional Light with Soft Shadows */}
      <directionalLight
        ref={dirLightRef}
        position={sunData.lightPosition}
        intensity={isRainy ? sunData.intensity * 0.25 : sunData.intensity}
        color={isRainy ? '#94a3b8' : sunData.color}
        castShadow={!isRainy}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0005}
      />

      {/* Target for Directional Light (Center of roof) */}
      <object3D position={[0, 0, 0]} />

      {/* Soft Ambient Sky Fill Light (diffuse during rain) */}
      <ambientLight
        intensity={isRainy ? 0.75 : sunData.isNight ? 0.25 : 0.65}
        color={isRainy ? '#94a3b8' : '#e0f2fe'}
      />

      {/* Ground Bounce / Hemisphere Light */}
      <hemisphereLight
        color={isRainy ? '#64748b' : sunData.isNight ? '#1e293b' : '#f8fafc'}
        groundColor={isRainy ? '#475569' : '#94a3b8'}
        intensity={isRainy ? 0.5 : sunData.isNight ? 0.2 : 0.4}
      />
    </group>
  );
};

