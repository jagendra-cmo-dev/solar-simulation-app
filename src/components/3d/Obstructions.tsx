'use client';

import React from 'react';
import { Obstruction } from '../../types/solar';

interface ObstructionsProps {
  obstructions: Obstruction[];
}

export const Obstructions: React.FC<ObstructionsProps> = ({ obstructions }) => {
  return (
    <group position={[0, 0, 0]}>
      {obstructions.map((obs) => {
        if (!obs.enabled) return null;

        if (obs.type === 'water_tank') {
          const standHeight = 0.8;
          const tankRadius = obs.width / 2;
          const tankHeight = obs.height - standHeight;

          return (
            <group key={obs.id} position={[obs.x, 0, obs.z]}>
              {/* 4-Legged Steel Staging Stand */}
              <group position={[0, standHeight / 2, 0]}>
                {[-tankRadius * 0.7, tankRadius * 0.7].map((lx, idx1) =>
                  [-tankRadius * 0.7, tankRadius * 0.7].map((lz, idx2) => (
                    <mesh key={`${idx1}-${idx2}`} position={[lx, 0, lz]} castShadow receiveShadow>
                      <boxGeometry args={[0.06, standHeight, 0.06]} />
                      <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
                    </mesh>
                  ))
                )}
                {/* Horizontal cross bracing */}
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[tankRadius * 1.5, 0.05, tankRadius * 1.5]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
              </group>

              {/* Cylindrical Water Tank Body (Sintex Black / Dark Green UV Tank) */}
              <group position={[0, standHeight + tankHeight / 2, 0]}>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[tankRadius, tankRadius, tankHeight, 24]} />
                  <meshStandardMaterial
                    color="#1e293b" // UV black sintex
                    roughness={0.4}
                    metalness={0.1}
                  />
                </mesh>

                {/* Reinforcement Rib rings */}
                {[-tankHeight * 0.25, 0, tankHeight * 0.25].map((yRib, rIdx) => (
                  <mesh key={rIdx} position={[0, yRib, 0]} castShadow>
                    <cylinderGeometry args={[tankRadius + 0.02, tankRadius + 0.02, 0.04, 24]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.3} />
                  </mesh>
                ))}

                {/* Top Lid / Manhole */}
                <mesh position={[0, tankHeight / 2 + 0.06, 0]} castShadow>
                  <cylinderGeometry args={[tankRadius * 0.45, tankRadius * 0.45, 0.1, 16]} />
                  <meshStandardMaterial color="#334155" roughness={0.5} />
                </mesh>
              </group>
            </group>
          );
        }

        if (obs.type === 'staircase_mumty') {
          return (
            <group key={obs.id} position={[obs.x, obs.height / 2, obs.z]}>
              {/* Mumty Room Main Concrete Box */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[obs.width, obs.height, obs.length]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
              </mesh>

              {/* Mumty Roof Slab with Cantilever Overhang */}
              <mesh position={[0, obs.height / 2 + 0.08, 0]} castShadow receiveShadow>
                <boxGeometry args={[obs.width + 0.35, 0.16, obs.length + 0.35]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
              </mesh>

              {/* Metal Access Door (facing South: +Z) */}
              <mesh position={[0, -obs.height / 2 + 1.05, obs.length / 2 + 0.01]} castShadow>
                <planeGeometry args={[0.95, 2.0]} />
                <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
              </mesh>
              {/* Door Handle */}
              <mesh position={[0.35, -obs.height / 2 + 1.0, obs.length / 2 + 0.04]}>
                <boxGeometry args={[0.04, 0.15, 0.05]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Ventilation Louver */}
              <mesh position={[0, obs.height / 2 - 0.4, obs.length / 2 + 0.01]}>
                <planeGeometry args={[0.6, 0.3]} />
                <meshStandardMaterial color="#64748b" roughness={0.5} />
              </mesh>
            </group>
          );
        }

        if (obs.type === 'ac_outdoor') {
          return (
            <group key={obs.id} position={[obs.x, obs.height / 2, obs.z]}>
              {/* AC Compressor Body */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[obs.width, obs.height, obs.length]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.5} metalness={0.2} />
              </mesh>

              {/* Fan Grill Circle on Front */}
              <mesh position={[0, 0, obs.length / 2 + 0.01]}>
                <circleGeometry args={[obs.height * 0.38, 20]} />
                <meshStandardMaterial color="#334155" roughness={0.7} />
              </mesh>

              {/* Rubber Vibration Pads underneath */}
              {[-obs.width * 0.4, obs.width * 0.4].map((px, idx) => (
                <mesh key={idx} position={[px, -obs.height / 2 - 0.03, 0]}>
                  <boxGeometry args={[0.1, 0.06, obs.length * 0.8]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
              ))}
            </group>
          );
        }

        // Generic Obstruction
        return (
          <mesh
            key={obs.id}
            position={[obs.x, obs.height / 2, obs.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[obs.width, obs.height, obs.length]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
};

