'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { calculateSunPosition, getSolarTimes } from '../../utils/solarCalculations';

interface SunPathArcProps {
  timeOfDayHours: number;
  monthOfYear: number;
  latitude: number;
  setTimeOfDay: (hours: number) => void;
  visible?: boolean;
}

const ARC_RADIUS = 28; // Optimal framing distance for rooftop and building

export const SunPathArc: React.FC<SunPathArcProps> = ({
  timeOfDayHours,
  monthOfYear,
  latitude,
  setTimeOfDay,
  visible = true,
}) => {
  // 1. Compute Active Month Path and Hourly Markers
  const {
    activeTubeGeo,
    activeGlowGeo,
    hourMarkers,
    currentSunPos,
    isNight,
  } = useMemo(() => {
    const solarTimes = getSolarTimes(monthOfYear, latitude);
    const startHour = Math.max(5.0, solarTimes.sunriseHour - 0.1);
    const endHour = Math.min(19.2, solarTimes.sunsetHour + 0.1);

    // Active path 3D curve points
    const points: THREE.Vector3[] = [];
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const t = startHour + (i / steps) * (endHour - startHour);
      const pos = calculateSunPosition(t, monthOfYear, latitude, ARC_RADIUS);
      points.push(new THREE.Vector3(pos.lightPosition[0], pos.lightPosition[1], pos.lightPosition[2]));
    }

    let activeTube: THREE.TubeGeometry | null = null;
    let activeGlow: THREE.TubeGeometry | null = null;
    if (points.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(points);
      activeTube = new THREE.TubeGeometry(curve, 72, 0.12, 8, false);
      activeGlow = new THREE.TubeGeometry(curve, 72, 0.35, 8, false);
    }

    // Hourly markers (e.g. 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19)
    const markers: { hour: number; pos: [number, number, number]; label: string }[] = [];
    const minH = Math.ceil(solarTimes.sunriseHour);
    const maxH = Math.floor(solarTimes.sunsetHour);

    for (let h = minH; h <= maxH; h++) {
      const pos = calculateSunPosition(h, monthOfYear, latitude, ARC_RADIUS);
      markers.push({
        hour: h,
        pos: pos.lightPosition,
        label: `${h}`,
      });
    }

    // Current Sun Position
    const current = calculateSunPosition(timeOfDayHours, monthOfYear, latitude, ARC_RADIUS);

    return {
      activeTubeGeo: activeTube,
      activeGlowGeo: activeGlow,
      hourMarkers: markers,
      currentSunPos: current.lightPosition,
      isNight: current.isNight,
    };
  }, [monthOfYear, latitude, timeOfDayHours]);

  // 2. Compute Seasonal Solstice Reference Curves (Summer June 21 & Winter Dec 21)
  const { summerTubeGeo, winterTubeGeo } = useMemo(() => {
    const makeSeasonalTube = (month: number) => {
      const times = getSolarTimes(month, latitude);
      const pts: THREE.Vector3[] = [];
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const t = times.sunriseHour + (i / steps) * (times.sunsetHour - times.sunriseHour);
        const pos = calculateSunPosition(t, month, latitude, ARC_RADIUS);
        pts.push(new THREE.Vector3(pos.lightPosition[0], pos.lightPosition[1], pos.lightPosition[2]));
      }
      if (pts.length < 2) return null;
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.TubeGeometry(curve, 54, 0.05, 6, false);
    };

    return {
      summerTubeGeo: monthOfYear !== 5 ? makeSeasonalTube(5) : null, // June 21
      winterTubeGeo: monthOfYear !== 11 ? makeSeasonalTube(11) : null, // Dec 21
    };
  }, [latitude, monthOfYear]);

  const formatBadgeTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  if (!visible) return null;

  return (
    <group>
      {/* Summer Solstice Guide Arc (June - Highest) */}
      {summerTubeGeo && (
        <mesh geometry={summerTubeGeo}>
          <meshBasicMaterial color="#fde047" transparent opacity={0.25} />
        </mesh>
      )}

      {/* Winter Solstice Guide Arc (December - Lowest) */}
      {winterTubeGeo && (
        <mesh geometry={winterTubeGeo}>
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.22} />
        </mesh>
      )}

      {/* Active Month Sun Path Arc (Solid Core) */}
      {activeTubeGeo && (
        <mesh geometry={activeTubeGeo}>
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}

      {/* Active Month Sun Path Arc (Glow Halo) */}
      {activeGlowGeo && (
        <mesh geometry={activeGlowGeo}>
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Hourly Nodes & Time Labels along the Path */}
      {hourMarkers.map((marker) => {
        const isCurrent = Math.abs(timeOfDayHours - marker.hour) < 0.45;
        return (
          <group key={marker.hour} position={marker.pos}>
            {/* Small Glowing Tick Sphere */}
            <mesh>
              <sphereGeometry args={[0.26, 12, 12]} />
              <meshBasicMaterial
                color={isCurrent ? '#ffffff' : '#fbbf24'}
                transparent
                opacity={isCurrent ? 1 : 0.85}
              />
            </mesh>

            {/* 3D Clickable Time Badge on the Path */}
            <Html center distanceFactor={28} className="pointer-events-auto select-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTimeOfDay(marker.hour);
                }}
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 scale-125 shadow-lg shadow-amber-400/60 ring-2 ring-white z-30'
                    : 'bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/35 hover:scale-110 shadow-md'
                }`}
                title={`Set Sun time to ${marker.hour}:00`}
              >
                {marker.label}
              </button>
            </Html>
          </group>
        );
      })}

      {/* Glowing 3D Sun Orb Traveling on the Arc */}
      {!isNight && (
        <group position={currentSunPos}>
          {/* Core White Disc */}
          <mesh>
            <sphereGeometry args={[1.0, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Inner Golden Corona */}
          <mesh>
            <sphereGeometry args={[1.9, 16, 16]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Outer Ambient Glow Corona */}
          <mesh>
            <sphereGeometry args={[3.4, 16, 16]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Floating Time Pill Over the Sun */}
          <Html position={[0, 2.2, 0]} center distanceFactor={28} className="pointer-events-none select-none">
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-mono font-extrabold text-[10px] shadow-xl border border-amber-200 whitespace-nowrap">
              {formatBadgeTime(timeOfDayHours)}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

