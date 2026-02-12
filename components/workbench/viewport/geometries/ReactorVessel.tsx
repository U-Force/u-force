"use client";

import React, { useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { useSelectionHighlight } from "../hooks/useSelectionHighlight";
import { VESSEL, CRDM, NOZZLE, LOOPS } from "../layout";
import type { ViewMode } from "../../WorkbenchContext";

interface ReactorVesselProps {
  selected?: boolean;
  onSelect?: (id: string) => void;
  viewMode?: ViewMode;
}

const CAP_RADIUS = VESSEL.radius;

function ReactorVessel({ selected = false, onSelect, viewMode = "normal" }: ReactorVesselProps) {
  const bodyMatRef = useSelectionHighlight(selected);
  const topCapRef = useRef<THREE.MeshStandardMaterial>(null);
  const bottomCapRef = useRef<THREE.MeshStandardMaterial>(null);
  const isXray = viewMode === "xray";

  // Animate vessel shell opacity for X-Ray mode
  useFrame(() => {
    const targetOpacity = isXray ? 0.12 : 1.0;
    const refs = [bodyMatRef, topCapRef, bottomCapRef];
    for (const ref of refs) {
      if (ref.current) {
        ref.current.opacity = THREE.MathUtils.lerp(ref.current.opacity, targetOpacity, 0.06);
        ref.current.transparent = true;
        ref.current.depthWrite = !isXray;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.("vessel");
  };

  // Precompute CRDM positions from layout rings
  const crdmPositions: [number, number, number][] = [];
  for (const ring of CRDM.rings) {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2;
      crdmPositions.push([
        Math.cos(angle) * ring.ringRadius,
        VESSEL.height / 2 + CAP_RADIUS * 0.6 + CRDM.height / 2,
        Math.sin(angle) * ring.ringRadius,
      ]);
    }
  }

  // Nozzle stubs: 4 hot (upper) + 4 cold (lower) — one per loop
  const nozzleStubs: { pos: [number, number, number]; rotZ: number }[] = [];
  for (const loop of LOOPS) {
    // Hot leg nozzle (exits vessel top side)
    nozzleStubs.push({
      pos: [
        loop.dirX * (VESSEL.radius + NOZZLE.length / 2),
        VESSEL.hotNozzleY,
        loop.dirZ * (VESSEL.radius + NOZZLE.length / 2),
      ],
      rotZ: -Math.atan2(loop.dirZ, loop.dirX) + Math.PI / 2,
    });
    // Cold leg nozzle (enters vessel bottom side)
    nozzleStubs.push({
      pos: [
        loop.dirX * (VESSEL.radius + NOZZLE.length / 2),
        VESSEL.coldNozzleY,
        loop.dirZ * (VESSEL.radius + NOZZLE.length / 2),
      ],
      rotZ: -Math.atan2(loop.dirZ, loop.dirX) + Math.PI / 2,
    });
  }

  return (
    <group onClick={handleClick}>
      {/* Vessel body cylinder */}
      <mesh>
        <cylinderGeometry args={[VESSEL.radius, VESSEL.radius, VESSEL.height, 32, 1]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color={COLORS.metalDark}
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={0}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Top hemispherical cap (vessel head) */}
      <mesh position={[0, VESSEL.height / 2, 0]}>
        <sphereGeometry
          args={[CAP_RADIUS, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          ref={topCapRef}
          color={COLORS.metalDark}
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Bottom hemispherical cap */}
      <mesh position={[0, -VESSEL.height / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry
          args={[CAP_RADIUS, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          ref={bottomCapRef}
          color={COLORS.metalDark}
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
          transparent
          opacity={1}
        />
      </mesh>

      {/* CRDM housing nubs — 3 rings (~18 total) */}
      {crdmPositions.map((pos, i) => (
        <mesh key={`crdm-${i}`} position={pos}>
          <cylinderGeometry args={[CRDM.radius, CRDM.radius, CRDM.height, 8, 1]} />
          <meshStandardMaterial
            color={COLORS.metalMedium}
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Center CRDM nub */}
      <mesh
        position={[
          0,
          VESSEL.height / 2 + CAP_RADIUS * 0.85 + CRDM.height / 2,
          0,
        ]}
      >
        <cylinderGeometry args={[CRDM.radius, CRDM.radius, CRDM.height, 8, 1]} />
        <meshStandardMaterial
          color={COLORS.metalMedium}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      {/* Nozzle stubs — 8 total (4 hot + 4 cold) */}
      {nozzleStubs.map((stub, i) => (
        <mesh
          key={`nozzle-${i}`}
          position={stub.pos}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[NOZZLE.radius, NOZZLE.radius, NOZZLE.length, 10, 1]} />
          <meshStandardMaterial
            color={COLORS.metalMedium}
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default React.memo(ReactorVessel);
