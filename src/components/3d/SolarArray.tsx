'use client';

import React, { useState } from 'react';
import { PlacedPanel, PanelSpec } from '../../types/solar';

interface SolarArrayProps {
  panels: PlacedPanel[];
  panelSpec: PanelSpec;
  heatmapMode: boolean;
  onTogglePanel: (id: string) => void;
}

export const SolarArray: React.FC<SolarArrayProps> = ({
  panels,
  panelSpec,
  heatmapMode,
  onTogglePanel,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const pWidth = panelSpec.width; // East-West (X) ~1.134m
  const pLength = panelSpec.length; // Length along slope ~2.278m
  const pThickness = 0.035; // 35mm standard frame

  // Heatmap color interpolation
  const getHeatmapColor = (score: number): string => {
    // 0 - 50: red to orange, 50 - 80: orange to yellow, 80 - 100: yellow to green
    if (score >= 90) return '#10b981'; // vibrant emerald
    if (score >= 75) return '#84cc16'; // lime green
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 45) return '#f97316'; // orange
    return '#ef4444'; // red (heavy shade)
  };

  return (
    <group position={[0, 0, 0]}>
      {panels.map((panel) => {
        const isHovered = hoveredId === panel.id;
        const isEnabled = panel.enabled;
        
        // Tilt rotation: in Three.js, to face South (+Z), we rotate around X axis
        const radTilt = (panel.tilt * Math.PI) / 180;
        const radAzimuth = (panel.azimuth * Math.PI) / 180;

        // Visual panel color
        let cellColor = '#0f172a'; // standard deep monocrystalline navy-black
        if (panelSpec.id === 'topcon_bifacial') cellColor = '#0b192c'; // deep blue bifacial
        if (panelSpec.id === 'hjt_high_eff') cellColor = '#05070a'; // pure black HJT

        if (heatmapMode) {
          cellColor = getHeatmapColor(panel.irradianceScore);
        } else if (!isEnabled) {
          cellColor = '#475569'; // disabled / shaded grey
        } else if (isHovered) {
          cellColor = '#1e3a8a'; // hover highlight
        }

        const legHeight = Math.max(0.15, pLength * Math.sin(radTilt));

        return (
          <group
            key={panel.id}
            position={[panel.x, panel.y, panel.z]}
            rotation={[0, radAzimuth, 0]}
          >
            {/* Mounting Racking Structure (Aluminum Legs & Rails) */}
            {isEnabled && (
              <group position={[0, 0, 0]}>
                {/* Rear Leg (Taller) */}
                <mesh position={[-pWidth * 0.35, legHeight / 2, -pLength * 0.35]} castShadow>
                  <boxGeometry args={[0.04, legHeight, 0.04]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[pWidth * 0.35, legHeight / 2, -pLength * 0.35]} castShadow>
                  <boxGeometry args={[0.04, legHeight, 0.04]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Front Leg (Shorter) */}
                <mesh position={[-pWidth * 0.35, 0.08, pLength * 0.35]} castShadow>
                  <boxGeometry args={[0.04, 0.16, 0.04]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[pWidth * 0.35, 0.08, pLength * 0.35]} castShadow>
                  <boxGeometry args={[0.04, 0.16, 0.04]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Mounting C-Rails underneath */}
                <mesh
                  position={[0, legHeight * 0.48, 0]}
                  rotation={[radTilt, 0, 0]}
                  castShadow
                >
                  <boxGeometry args={[pWidth * 0.95, 0.04, 0.06]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} />
                </mesh>
              </group>
            )}

            {/* Tilted Solar PV Module Group */}
            <group
              position={[0, legHeight / 2 + 0.05, 0]}
              rotation={[radTilt, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePanel(panel.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(panel.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId(null);
                document.body.style.cursor = 'default';
              }}
            >
              {/* Outer Anodized Aluminum Frame */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[pWidth, pThickness, pLength]} />
                <meshStandardMaterial
                  color={
                    !isEnabled
                      ? '#ef4444' // red boundary when disabled
                      : isHovered
                      ? '#38bdf8' // cyan highlight on hover
                      : '#cbd5e1' // silver anodized frame
                  }
                  metalness={0.85}
                  roughness={0.2}
                  wireframe={!isEnabled}
                />
              </mesh>

              {/* Photovoltaic Silicon Cell Surface */}
              <mesh position={[0, pThickness / 2 + 0.002, 0]} receiveShadow castShadow>
                <boxGeometry args={[pWidth - 0.04, 0.004, pLength - 0.04]} />
                <meshStandardMaterial
                  color={cellColor}
                  roughness={0.15}
                  metalness={0.5}
                  opacity={isEnabled ? 1.0 : 0.25}
                  transparent={!isEnabled}
                />
              </mesh>

              {/* Solar Cell Busbars / Gridlines Simulation */}
              {isEnabled && !heatmapMode && (
                <group position={[0, pThickness / 2 + 0.005, 0]}>
                  {/* Subtle longitudinal busbar lines */}
                  {[-pWidth * 0.3, -pWidth * 0.1, pWidth * 0.1, pWidth * 0.3].map((xLine, idx) => (
                    <mesh key={idx} position={[xLine, 0, 0]}>
                      <planeGeometry args={[0.004, pLength - 0.06]} />
                      <meshBasicMaterial color="#94a3b8" />
                    </mesh>
                  ))}
                  {/* Half-cut horizontal cell divider */}
                  <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[pWidth - 0.06, 0.006]} />
                    <meshBasicMaterial color="#020617" />
                  </mesh>
                </group>
              )}

              {/* Disabled / Shaded Ghost Badge */}
              {!isEnabled && (
                <group position={[0, 0.15, 0]}>
                  <mesh>
                    <boxGeometry args={[0.4, 0.04, 0.2]} />
                    <meshBasicMaterial color="#ef4444" />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
};
