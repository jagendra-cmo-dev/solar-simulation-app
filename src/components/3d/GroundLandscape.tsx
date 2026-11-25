'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface GroundLandscapeProps {
  roofHeight: number;
  buildingLength: number;
  buildingWidth: number;
  isRainy?: boolean;
}

// Generate deterministic procedural grass lawn texture with blade micro-detail
function createGrassTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Rich base turf green
  ctx.fillStyle = '#2d6a4f';
  ctx.fillRect(0, 0, 256, 256);

  // Deterministic LCG for zero render-purity warnings
  let seed = 98765;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Layered natural grass blade shades
  const shades = ['#386641', '#40916c', '#52b788', '#1b4332', '#23533e', '#74c69d', '#2d5a3f'];
  for (let i = 0; i < 9000; i++) {
    const x = lcg() * 256;
    const y = lcg() * 256;
    const w = 1.0 + lcg() * 2.2;
    const h = 2.4 + lcg() * 4.6;
    ctx.fillStyle = shades[i % shades.length];
    ctx.fillRect(x, y, w, h);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Low-Poly Architectural Garden Tree
function GardenTree({
  position,
  scale = 1,
  rotationY = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Tree Trunk */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.35, 3.6, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>

      {/* Main Foliage Canopy (Multi-tiered organic layers) */}
      <group position={[0, 4.2, 0]}>
        {/* Lower tier */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.9, 1]} />
          <meshStandardMaterial color="#2d6a4f" roughness={0.8} />
        </mesh>
        {/* Middle tier */}
        <mesh position={[0.3, 1.1, -0.2]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#40916c" roughness={0.8} />
        </mesh>
        {/* Upper tier */}
        <mesh position={[-0.2, 2.0, 0.1]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color="#52b788" roughness={0.8} />
        </mesh>
      </group>

      {/* Tree base soil mulch ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.9, 12]} />
        <meshStandardMaterial color="#3d2817" roughness={0.95} />
      </mesh>
    </group>
  );
}

// Low Garden Shrub / Flower Bush
function GardenShrub({
  position,
  scale = 1,
  color = '#2d6a4f',
  flowerColor,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  flowerColor?: string;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {flowerColor && (
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshStandardMaterial color={flowerColor} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

export const GroundLandscape: React.FC<GroundLandscapeProps> = ({
  roofHeight,
  buildingLength,
  buildingWidth,
  isRainy = false,
}) => {
  const groundY = -roofHeight - 0.01;
  const grassTexture = useMemo(() => createGrassTexture(), []);

  // Pre-configured decorative tree positions around the property perimeter
  const treePositions = useMemo(
    () => [
      // Rear garden (North side)
      { pos: [-16, 0, -18] as [number, number, number], scale: 1.15, rot: 0.4 },
      { pos: [-5, 0, -21] as [number, number, number], scale: 1.3, rot: 1.2 },
      { pos: [8, 0, -19] as [number, number, number], scale: 1.05, rot: 2.1 },
      { pos: [19, 0, -17] as [number, number, number], scale: 1.2, rot: 0.8 },
      // West side yard
      { pos: [-22, 0, -7] as [number, number, number], scale: 1.1, rot: 1.6 },
      { pos: [-21, 0, 5] as [number, number, number], scale: 1.25, rot: 2.9 },
      { pos: [-19, 0, 16] as [number, number, number], scale: 1.0, rot: 0.2 },
      // East side yard
      { pos: [22, 0, -6] as [number, number, number], scale: 1.2, rot: 1.9 },
      { pos: [21, 0, 6] as [number, number, number], scale: 1.1, rot: 0.7 },
      { pos: [20, 0, 17] as [number, number, number], scale: 1.3, rot: 2.5 },
      // Front boundary corners (South - far enough to never shade solar panels)
      { pos: [-16, 0, 24] as [number, number, number], scale: 1.1, rot: 1.4 },
      { pos: [16, 0, 24] as [number, number, number], scale: 1.15, rot: 3.1 },
    ],
    []
  );

  // Garden shrubs around building perimeter and pathway
  const shrubs = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; scale: number; color: string; flower?: string }> = [];
    const bHalfL = buildingLength / 2 + 1.2;
    const bHalfW = buildingWidth / 2 + 1.2;

    // Shrubs along North foundation wall
    for (let x = -bHalfL + 1.2; x <= bHalfL - 1.2; x += 2.2) {
      list.push({
        pos: [x, 0, -bHalfW - 0.4],
        scale: 0.8 + ((Math.abs(x) * 11) % 5) * 0.08,
        color: (Math.round(x) % 2 === 0) ? '#40916c' : '#2d6a4f',
        flower: (Math.round(x) % 3 === 0) ? '#f59e0b' : undefined,
      });
    }

    // Shrubs along West and East walls
    for (let z = -bHalfW + 1.5; z <= bHalfW - 1.5; z += 2.4) {
      list.push({
        pos: [-bHalfL - 0.4, 0, z],
        scale: 0.75 + ((Math.abs(z) * 7) % 5) * 0.07,
        color: '#386641',
      });
      list.push({
        pos: [bHalfL + 0.4, 0, z],
        scale: 0.8 + ((Math.abs(z) * 13) % 4) * 0.08,
        color: '#40916c',
        flower: (Math.round(z) % 2 === 0) ? '#e11d48' : undefined,
      });
    }

    return list;
  }, [buildingLength, buildingWidth]);

  return (
    <group position={[0, groundY, 0]}>
      {/* 1. Main Lush Green Lawn (Residential yard) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[65, 65]} />
        <meshStandardMaterial
          color={isRainy ? '#1b4332' : '#2d6a4f'}
          roughness={isRainy ? 0.45 : 0.82}
          metalness={isRainy ? 0.15 : 0.02}
          map={grassTexture ?? undefined}
        />
      </mesh>

      {/* 2. Vast Outer Landscape & Meadow (Blends smoothly into horizon fog) */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial
          color={isRainy ? '#20402e' : '#3a5a40'}
          roughness={0.9}
        />
      </mesh>

      {/* 3. Building Foundation Paved Stone Apron Walkway */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[buildingLength + 2.0, 0.04, buildingWidth + 2.0]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* 4. Concrete Driveway & Entrance Way */}
      <mesh
        position={[buildingLength / 3, 0.02, (buildingWidth / 2) + 8.5]}
        receiveShadow
      >
        <boxGeometry args={[4.2, 0.05, 15]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>

      {/* Driveway Paver Kerb Stones (Left & Right borders) */}
      <mesh
        position={[buildingLength / 3 - 2.2, 0.05, (buildingWidth / 2) + 8.5]}
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.08, 15]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
      <mesh
        position={[buildingLength / 3 + 2.2, 0.05, (buildingWidth / 2) + 8.5]}
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.08, 15]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>

      {/* 5. Garden Stepping Stones in the Grass */}
      {[-4, -2, 0, 2, 4].map((stepZ, idx) => (
        <mesh
          key={idx}
          position={[-buildingLength / 2 - 2.8, 0.03, stepZ * 1.5]}
          rotation={[-Math.PI / 2, 0, 0.2 * (idx % 2 === 0 ? 1 : -1)]}
          receiveShadow
        >
          <circleGeometry args={[0.45, 10]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.65} />
        </mesh>
      ))}

      {/* 6. Surrounding Compound Boundary Wall (Low residential perimeter) */}
      <group position={[0, 0, 0]}>
        {/* North Wall */}
        <mesh position={[0, 0.45, -28]} receiveShadow castShadow>
          <boxGeometry args={[56, 0.9, 0.25]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.92, -28]}>
          <boxGeometry args={[56.2, 0.08, 0.35]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        {/* West Wall */}
        <mesh position={[-28, 0.45, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.25, 0.9, 56]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        <mesh position={[-28, 0.92, 0]}>
          <boxGeometry args={[0.35, 0.08, 56.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>

        {/* East Wall */}
        <mesh position={[28, 0.45, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.25, 0.9, 56]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
        </mesh>
        <mesh position={[28, 0.92, 0]}>
          <boxGeometry args={[0.35, 0.08, 56.2]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
      </group>

      {/* 7. Lush Architectural Garden Trees */}
      {treePositions.map((tree, idx) => (
        <GardenTree
          key={idx}
          position={tree.pos}
          scale={tree.scale}
          rotationY={tree.rot}
        />
      ))}

      {/* 8. Garden Shrubbery & Flower Bushes */}
      {shrubs.map((shrub, idx) => (
        <GardenShrub
          key={idx}
          position={shrub.pos}
          scale={shrub.scale}
          color={shrub.color}
          flowerColor={shrub.flower}
        />
      ))}
    </group>
  );
};

