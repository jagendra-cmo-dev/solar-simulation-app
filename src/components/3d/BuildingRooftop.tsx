'use client';

import React from 'react';
import { RoofType } from '../../types/solar';

interface BuildingRooftopProps {
  roofType: RoofType;
  length: number; // East-West (X)
  width: number;  // North-South (Z)
  buildingHeight: number;
  parapetHeight: number;
  elevatedHeight: number;
}

export const BuildingRooftop: React.FC<BuildingRooftopProps> = ({
  roofType,
  length,
  width,
  buildingHeight,
  parapetHeight,
  elevatedHeight,
}) => {
  const wallThickness = 0.25;

  return (
    <group position={[0, 0, 0]}>
      {/* Main Building Base (Walls) */}
      <mesh position={[0, -buildingHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[length, buildingHeight, width]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>

      {/* Building Base Plinth & Ground Floor Trim */}
      <mesh position={[0, -buildingHeight + 0.15, 0]} receiveShadow>
        <boxGeometry args={[length + 0.4, 0.3, width + 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.9} />
      </mesh>

      {/* Building Windows & Architectural Accents */}
      {[-buildingHeight / 2].map((yOffset, idx) => (
        <group key={idx} position={[0, yOffset, width / 2 + 0.02]}>
          {[-length / 3, 0, length / 3].map((xOffset, wIdx) => (
            <mesh key={wIdx} position={[xOffset, 0, 0]}>
              <planeGeometry args={[1.6, 1.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Rooftop Styles */}
      {roofType === 'flat_rcc' && (
        <group>
          {/* Flat Concrete Roof Slab Surface */}
          <mesh position={[0, 0.01, 0]} receiveShadow>
            <boxGeometry args={[length, 0.15, width]} />
            <meshStandardMaterial
              color="#cbd5e1"
              roughness={0.75}
              metalness={0.1}
            />
          </mesh>

          {/* Roof Tiles / Paver Grid Overlay Lines */}
          <gridHelper
            args={[Math.max(length, width), Math.round(Math.max(length, width) * 2), '#94a3b8', '#cbd5e1']}
            position={[0, 0.09, 0]}
          />

          {/* Parapet Walls on 4 sides */}
          {parapetHeight > 0 && (
            <group position={[0, parapetHeight / 2 + 0.08, 0]}>
              {/* North Wall (Negative Z) */}
              <mesh position={[0, 0, -width / 2 + wallThickness / 2]} receiveShadow castShadow>
                <boxGeometry args={[length, parapetHeight, wallThickness]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
              </mesh>
              {/* South Wall (Positive Z) */}
              <mesh position={[0, 0, width / 2 - wallThickness / 2]} receiveShadow castShadow>
                <boxGeometry args={[length, parapetHeight, wallThickness]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
              </mesh>
              {/* West Wall (Negative X) */}
              <mesh position={[-length / 2 + wallThickness / 2, 0, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, parapetHeight, width - 2 * wallThickness]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
              </mesh>
              {/* East Wall (Positive X) */}
              <mesh position={[length / 2 - wallThickness / 2, 0, 0]} receiveShadow castShadow>
                <boxGeometry args={[wallThickness, parapetHeight, width - 2 * wallThickness]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
              </mesh>
              
              {/* Coping Stone Cap on Parapet */}
              <mesh position={[0, parapetHeight / 2 + 0.03, -width / 2 + wallThickness / 2]}>
                <boxGeometry args={[length + 0.1, 0.06, wallThickness + 0.08]} />
                <meshStandardMaterial color="#64748b" roughness={0.6} />
              </mesh>
              <mesh position={[0, parapetHeight / 2 + 0.03, width / 2 - wallThickness / 2]}>
                <boxGeometry args={[length + 0.1, 0.06, wallThickness + 0.08]} />
                <meshStandardMaterial color="#64748b" roughness={0.6} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {roofType === 'tin_shed' && (
        <group>
          {/* Metal Industrial Pitched / Shed Roof */}
          <group position={[0, 0.2, 0]}>
            {/* South Pitch (sloping down toward positive Z) */}
            <mesh position={[0, 0.5, 0]} rotation={[0.18, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[length + 0.6, 0.08, width + 0.6]} />
              <meshStandardMaterial
                color="#0284c7" // industrial blue sheet
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>

            {/* Trapezoidal Corrugation Ridge Trim */}
            <mesh position={[0, 1.15, -width / 2 + 0.2]} rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[length + 0.8, 0.12, 0.35]} />
              <meshStandardMaterial color="#0369a1" roughness={0.5} metalness={0.7} />
            </mesh>

            {/* Structural Girders / Steel Trusses under shed */}
            {[-length / 3, 0, length / 3].map((xP, i) => (
              <mesh key={i} position={[xP, 0.3, 0]}>
                <boxGeometry args={[0.1, 0.4, width - 0.2]} />
                <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {roofType === 'elevated_pergola' && (
        <group>
          {/* Usable Flat Concrete Terrace Floor underneath */}
          <mesh position={[0, 0.01, 0]} receiveShadow>
            <boxGeometry args={[length, 0.15, width]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
          </mesh>

          {/* Terrace Paver Lines */}
          <gridHelper
            args={[Math.max(length, width), Math.round(Math.max(length, width) * 2), '#cbd5e1', '#e2e8f0']}
            position={[0, 0.09, 0]}
          />

          {/* Terrace Decorative Railing / Balustrade */}
          <group position={[0, 0.55, 0]}>
            {/* Handrail bars */}
            <mesh position={[0, 0, -width / 2 + 0.1]}>
              <boxGeometry args={[length - 0.2, 0.05, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, width / 2 - 0.1]}>
              <boxGeometry args={[length - 0.2, 0.05, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[-length / 2 + 0.1, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, width - 0.2]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[length / 2 - 0.1, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, width - 0.2]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>

          {/* Elevated Galvanized Steel Columns (Stanchions) */}
          {[-length / 2 + 0.8, -length / 6, length / 6, length / 2 - 0.8].map((colX, cIdx) => (
            <React.Fragment key={cIdx}>
              {/* Front Column */}
              <mesh position={[colX, elevatedHeight / 2, width / 2 - 0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.12, elevatedHeight, 0.12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Base Plate */}
              <mesh position={[colX, 0.05, width / 2 - 0.8]}>
                <boxGeometry args={[0.3, 0.06, 0.3]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>

              {/* Back Column */}
              <mesh position={[colX, elevatedHeight / 2, -width / 2 + 0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.12, elevatedHeight, 0.12]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Base Plate */}
              <mesh position={[colX, 0.05, -width / 2 + 0.8]}>
                <boxGeometry args={[0.3, 0.06, 0.3]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
            </React.Fragment>
          ))}

          {/* High Pergola Overhead Heavy Beams */}
          <mesh position={[0, elevatedHeight + 0.06, width / 2 - 0.8]} castShadow>
            <boxGeometry args={[length - 1.2, 0.14, 0.12]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, elevatedHeight + 0.06, -width / 2 + 0.8]} castShadow>
            <boxGeometry args={[length - 1.2, 0.14, 0.12]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
};
