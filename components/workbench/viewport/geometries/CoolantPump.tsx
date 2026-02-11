"use client";

import React, { useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { useSelectionHighlight } from "../hooks/useSelectionHighlight";
import { RCP } from "../layout";

interface CoolantPumpProps {
  pumpOn: boolean;
  pumpId: string; // "rcp-1" | "rcp-2" | "rcp-3" | "rcp-4"
  position?: [number, number, number];
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const IMPELLER_RADIUS = 0.4;
const BLADE_COUNT = 6;

function CoolantPump({
  pumpOn,
  pumpId,
  position = [4, -2, 0],
  selected = false,
  onSelect,
}: CoolantPumpProps) {
  const impellerRef = useRef<THREE.Group>(null);
  const bodyMatRef = useSelectionHighlight(selected, 0.25);
  const currentSpeed = useRef(0);

  useFrame((_, delta) => {
    const targetSpeed = pumpOn ? 4.0 : 0;
    currentSpeed.current = THREE.MathUtils.lerp(
      currentSpeed.current,
      targetSpeed,
      pumpOn ? 0.03 : 0.015
    );

    if (impellerRef.current) {
      impellerRef.current.rotation.y += currentSpeed.current * delta;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(pumpId);
  };

  // Precompute blade rotations
  const bladeAngles: number[] = [];
  for (let i = 0; i < BLADE_COUNT; i++) {
    bladeAngles.push((i / BLADE_COUNT) * Math.PI * 2);
  }

  return (
    <group position={position} onClick={handleClick}>
      {/* Pump casing */}
      <mesh>
        <cylinderGeometry args={[RCP.casingRadius, RCP.casingRadius, RCP.casingHeight, 20, 1]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color="#505050"
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Motor housing (above casing) */}
      <mesh position={[0, RCP.casingHeight / 2 + RCP.motorHeight / 2 + 0.05, 0]}>
        <cylinderGeometry args={[RCP.motorRadius, RCP.motorRadius, RCP.motorHeight, 16, 1]} />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>

      {/* Motor top cap */}
      <mesh position={[0, RCP.casingHeight / 2 + RCP.motorHeight + 0.05, 0]}>
        <sphereGeometry
          args={[RCP.motorRadius, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>

      {/* Impeller assembly (spins) */}
      <group ref={impellerRef} position={[0, 0.1, 0]}>
        {/* Central hub */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 12, 1]} />
          <meshStandardMaterial
            color={COLORS.metalLight}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Impeller blades */}
        {bladeAngles.map((angle, i) => (
          <mesh
            key={`blade-${i}`}
            position={[
              Math.cos(angle) * IMPELLER_RADIUS * 0.5,
              0.12,
              Math.sin(angle) * IMPELLER_RADIUS * 0.5,
            ]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[IMPELLER_RADIUS * 0.7, 0.03, 0.06]} />
            <meshStandardMaterial
              color="#999999"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Inlet nozzle */}
      <mesh position={[0, -RCP.casingHeight / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.4, 12, 1]} />
        <meshStandardMaterial
          color="#454545"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* Outlet nozzle (side discharge) */}
      <mesh
        position={[RCP.casingRadius + 0.15, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.12, 0.12, 0.3, 12, 1]} />
        <meshStandardMaterial
          color="#454545"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default React.memo(CoolantPump);
