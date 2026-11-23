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
  setTimeOfDay: (hours: number) => void;
}

export const SunController: React.FC<SunControllerProps> = ({
  timeOfDayHours,
  monthOfYear,
  latitude,
  isPlaying,
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
        intensity={sunData.intensity}
        color={sunData.color}
        castShadow
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

      {/* Visual Glowing Sun Disc in the Sky */}
      {!sunData.isNight && (
        <group position={sunData.lightPosition}>
          {/* Inner Core */}
          <mesh>
            <sphereGeometry args={[1.4, 16, 16]} />
            <meshBasicMaterial color={sunData.color} />
          </mesh>
          {/* Outer Corona Glow */}
          <mesh>
            <sphereGeometry args={[2.8, 16, 16]} />
            <meshBasicMaterial
              color={sunData.color}
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Soft Ambient Sky Fill Light */}
      <ambientLight intensity={sunData.isNight ? 0.25 : 0.65} color="#e0f2fe" />

      {/* Ground Bounce / Hemisphere Light */}
      <hemisphereLight
        color={sunData.isNight ? '#1e293b' : '#f8fafc'}
        groundColor="#94a3b8"
        intensity={sunData.isNight ? 0.2 : 0.4}
      />
    </group>
  );
};

