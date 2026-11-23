'use client';

import React from 'react';
import { Obstruction } from '../../types/solar';

interface IrradianceHeatmapProps {
  length: number;
  width: number;
  active: boolean;
  obstructions: Obstruction[];
}

export const IrradianceHeatmap: React.FC<IrradianceHeatmapProps> = ({
  length,
  width,
  active,
  obstructions,
}) => {
  if (!active) return null;

  return (
    <group position={[0, 0.08, 0]}>
      {/* Semi-transparent high-yield solar radiation plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length - 0.5, width - 0.5]} />
        <meshBasicMaterial
          color="#10b981" // high irradiance base (emerald green)
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Shading zones cast around enabled obstructions */}
      {obstructions.map((obs) => {
        if (!obs.enabled) return null;
        // Shadow cone extends toward North (negative Z)
        return (
          <mesh
            key={`heat_shade_${obs.id}`}
            position={[obs.x, 0.082, obs.z - 1.2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[obs.width * 1.8, obs.length * 2.2]} />
            <meshBasicMaterial
              color="#ef4444" // red low yield shade pocket
              transparent
              opacity={0.45}
            />
          </mesh>
        );
      })}
    </group>
  );
};

