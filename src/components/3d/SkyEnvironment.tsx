'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SkyEnvironmentProps {
  timeOfDayHours: number;
  isRainy: boolean;
}

// Atmosphere Color Keyframes
interface AtmospherePalette {
  zenith: string;
  horizon: string;
  fog: string;
  cloud: string;
  cloudOpacity: number;
  starsOpacity: number;
}

function getAtmosphere(time: number, isRainy: boolean): AtmospherePalette {
  if (isRainy) {
    return {
      zenith: '#334155',       // slate-700 overcast
      horizon: '#64748b',      // slate-500 misty horizon
      fog: '#64748b',          // dense misty fog
      cloud: '#1e293b',        // dark storm rainclouds
      cloudOpacity: 0.94,
      starsOpacity: 0.0,
    };
  }

  // Clear / Sunny sky transitions according to time of day
  if (time < 5.0 || time > 19.5) {
    // Night
    return {
      zenith: '#020617',       // deep space black/indigo
      horizon: '#090d16',      // faint ground horizon
      fog: '#090d16',
      cloud: '#0f172a',
      cloudOpacity: 0.4,
      starsOpacity: 1.0,
    };
  } else if (time >= 5.0 && time < 6.2) {
    // Dawn / Early Sunrise
    const t = (time - 5.0) / 1.2;
    return {
      zenith: lerpColor('#020617', '#1e1b4b', t),
      horizon: lerpColor('#0f172a', '#f97316', t),
      fog: lerpColor('#090d16', '#ea580c', t),
      cloud: lerpColor('#1e293b', '#fed7aa', t),
      cloudOpacity: 0.75,
      starsOpacity: 1.0 - t,
    };
  } else if (time >= 6.2 && time < 7.5) {
    // Sunrise to Morning
    const t = (time - 6.2) / 1.3;
    return {
      zenith: lerpColor('#1e1b4b', '#0284c7', t),
      horizon: lerpColor('#f97316', '#bae6fd', t),
      fog: lerpColor('#ea580c', '#bae6fd', t),
      cloud: lerpColor('#fed7aa', '#ffffff', t),
      cloudOpacity: 0.8,
      starsOpacity: 0.0,
    };
  } else if (time >= 7.5 && time < 16.0) {
    // Broad Daylight (Morning to Midday to early Afternoon)
    return {
      zenith: '#0284c7',       // vivid rich azure sky
      horizon: '#7dd3fc',      // bright soft sky horizon
      fog: '#bae6fd',          // natural horizon haze
      cloud: '#ffffff',        // brilliant white cumulus clouds
      cloudOpacity: 0.82,
      starsOpacity: 0.0,
    };
  } else if (time >= 16.0 && time < 17.5) {
    // Late Afternoon / Golden Hour Start
    const t = (time - 16.0) / 1.5;
    return {
      zenith: lerpColor('#0284c7', '#1e3a8a', t),
      horizon: lerpColor('#7dd3fc', '#fbbf24', t),
      fog: lerpColor('#bae6fd', '#f59e0b', t),
      cloud: lerpColor('#ffffff', '#fef08a', t),
      cloudOpacity: 0.85,
      starsOpacity: 0.0,
    };
  } else if (time >= 17.5 && time < 18.8) {
    // Golden Sunset / Dusk
    const t = (time - 17.5) / 1.3;
    return {
      zenith: lerpColor('#1e3a8a', '#312e81', t),
      horizon: lerpColor('#fbbf24', '#ea580c', t),
      fog: lerpColor('#f59e0b', '#dc2626', t),
      cloud: lerpColor('#fef08a', '#fb923c', t),
      cloudOpacity: 0.88,
      starsOpacity: 0.0,
    };
  } else {
    // Twilight into Night (18.8 to 19.5)
    const t = (time - 18.8) / 0.7;
    return {
      zenith: lerpColor('#312e81', '#020617', t),
      horizon: lerpColor('#ea580c', '#090d16', t),
      fog: lerpColor('#dc2626', '#090d16', t),
      cloud: lerpColor('#fb923c', '#0f172a', t),
      cloudOpacity: 0.6,
      starsOpacity: t,
    };
  }
}

// Helper to interpolate between two hex colors
function lerpColor(c1: string, c2: string, factor: number): string {
  const col1 = new THREE.Color(c1);
  const col2 = new THREE.Color(c2);
  col1.lerp(col2, Math.min(Math.max(factor, 0), 1));
  return `#${col1.getHexString()}`;
}

// Deterministic pseudo-random rain positions generated once outside render to adhere to React purity rules
function generateRainPositions(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  let seed = 42;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (lcg() - 0.5) * 60; // X spread (-30 to 30)
    pos[i * 3 + 1] = lcg() * 40 - 2;     // Y height (-2 to 38)
    pos[i * 3 + 2] = (lcg() - 0.5) * 60; // Z spread (-30 to 30)
  }
  return pos;
}

const INITIAL_RAIN_POSITIONS = generateRainPositions(1800);

// 3D Animated Rain Droplets Particle System
function RainParticles({ isRainy }: { isRainy: boolean }) {
  const count = 1800;
  const pointsRef = useRef<THREE.Points>(null);

  // Clone initial array for local mutation in animation
  const positions = useMemo(() => new Float32Array(INITIAL_RAIN_POSITIONS), []);

  useFrame((_, delta) => {
    if (!pointsRef.current || !isRainy) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const fallSpeed = delta * 24; // fast falling raindrops
    const windTilt = delta * 2.5;

    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= fallSpeed; // Y drop
      posArray[i * 3 + 0] += windTilt;  // slight slant in X

      // Recycle raindrop to top when it hits ground
      if (posArray[i * 3 + 1] < -3) {
        posArray[i * 3 + 1] = 36 + ((i * 17) % 5);
        posArray[i * 3 + 0] = (((i * 31) % 60) - 30);
        posArray[i * 3 + 2] = (((i * 47) % 60) - 30);
      }
    }

    posAttr.needsUpdate = true;
  });

  if (!isRainy) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#93c5fd"
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

// Procedural Fluffy Cloud Cluster
function CloudCluster({
  position,
  scale = 1,
  color,
  opacity,
}: {
  position: [number, number, number];
  scale?: number;
  color: string;
  opacity: number;
}) {
  return (
    <group position={position} scale={[scale, scale * 0.55, scale]}>
      {/* Central main puff */}
      <mesh position={[0, 0, 0]} castShadow={false}>
        <sphereGeometry args={[3.2, 12, 10]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.95}
          depthWrite={false}
        />
      </mesh>
      {/* Surrounding cloud puffs for natural cumulus shape */}
      <mesh position={[-2.4, -0.4, 0.4]} castShadow={false}>
        <sphereGeometry args={[2.4, 10, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity * 0.95}
          roughness={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[2.3, -0.3, -0.3]} castShadow={false}>
        <sphereGeometry args={[2.5, 10, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity * 0.95}
          roughness={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.4, 0.9, -0.5]} castShadow={false}>
        <sphereGeometry args={[2.2, 10, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity * 0.92}
          roughness={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-1.2, 0.6, 0.8]} castShadow={false}>
        <sphereGeometry args={[2.0, 10, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity * 0.9}
          roughness={0.95}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Drifting Cloudscape
function DriftingClouds({
  cloudColor,
  cloudOpacity,
  isRainy,
}: {
  cloudColor: string;
  cloudOpacity: number;
  isRainy: boolean;
}) {
  const cloudsGroupRef = useRef<THREE.Group>(null);

  // Cloud placements across the sky dome
  const clouds = useMemo(
    () => [
      { pos: [-28, 22, -22] as [number, number, number], scale: 1.3 },
      { pos: [18, 25, -30] as [number, number, number], scale: 1.6 },
      { pos: [-12, 27, 24] as [number, number, number], scale: 1.4 },
      { pos: [26, 23, 20] as [number, number, number], scale: 1.5 },
      { pos: [-36, 26, 5] as [number, number, number], scale: 1.8 },
      { pos: [34, 28, -8] as [number, number, number], scale: 1.7 },
      { pos: [2, 31, -12] as [number, number, number], scale: 2.1 },
      { pos: [-18, 29, -38] as [number, number, number], scale: 1.9 },
    ],
    []
  );

  // Gentle sky drift motion
  useFrame((_, delta) => {
    if (!cloudsGroupRef.current) return;
    cloudsGroupRef.current.position.x += delta * (isRainy ? 0.75 : 0.35);
    // Wrap around smoothly
    if (cloudsGroupRef.current.position.x > 35) {
      cloudsGroupRef.current.position.x = -35;
    }
  });

  return (
    <group ref={cloudsGroupRef}>
      {clouds.map((c, idx) => (
        <CloudCluster
          key={idx}
          position={c.pos}
          scale={c.scale * (isRainy ? 1.4 : 1.0)}
          color={cloudColor}
          opacity={cloudOpacity}
        />
      ))}
    </group>
  );
}

// Smooth Gradient Sky Dome
function SkyDome({
  zenithColor,
  horizonColor,
}: {
  zenithColor: string;
  horizonColor: string;
}) {
  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color() },
      bottomColor: { value: new THREE.Color() },
      offset: { value: 15 },
      exponent: { value: 0.65 },
    }),
    []
  );

  // Update uniforms when colors transition
  useFrame(() => {
    uniforms.topColor.value.set(zenithColor);
    uniforms.bottomColor.value.set(horizonColor);
  });

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
      float factor = max(pow(max(h, 0.0), exponent), 0.0);
      gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);
    }
  `;

  return (
    <mesh>
      <sphereGeometry args={[140, 32, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export const SkyEnvironment: React.FC<SkyEnvironmentProps> = ({
  timeOfDayHours,
  isRainy,
}) => {
  const palette = useMemo(
    () => getAtmosphere(timeOfDayHours, isRainy),
    [timeOfDayHours, isRainy]
  );

  return (
    <>
      {/* Active Scene Background & Realistic Distance Horizon Fog */}
      <color attach="background" args={[palette.horizon]} />
      <fog
        attach="fog"
        args={[palette.fog, isRainy ? 22 : 45, isRainy ? 80 : 155]}
      />

      {/* Atmospheric Sky Dome */}
      <SkyDome
        zenithColor={palette.zenith}
        horizonColor={palette.horizon}
      />

      {/* Starry Nightfield when sun is down */}
      {palette.starsOpacity > 0.05 && !isRainy && (
        <Stars
          radius={110}
          depth={45}
          count={2200}
          factor={4}
          saturation={0}
          fade
          speed={0.8}
        />
      )}

      {/* Volumetric Drifting Clouds */}
      <DriftingClouds
        cloudColor={palette.cloud}
        cloudOpacity={palette.cloudOpacity}
        isRainy={isRainy}
      />

      {/* Dynamic Animated Rain in Monsoon Season */}
      <RainParticles isRainy={isRainy} />
    </>
  );
};

