"use client";

import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import { COLORS } from "../../../../lib/workbench/theme";
import { useSelectionHighlight } from "../hooks/useSelectionHighlight";
import { SG } from "../layout";

interface SteamGeneratorProps {
  sgId: string; // "sg-1" | "sg-2" | "sg-3" | "sg-4"
  position: [number, number, number];
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const UTUBE_RADIUS = 0.8;
const UTUBE_TUBE_RADIUS = 0.08;

function SteamGenerator({
  sgId,
  position,
  selected = false,
  onSelect,
}: SteamGeneratorProps) {
  const matRef = useSelectionHighlight(selected);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(sgId);
  };

  // U-tube arc rotation: face toward vessel center (origin)
  const utubeRotY = Math.atan2(-position[0], -position[2]);

  // Vertical layout:
  //   Lower section center at y=0 (height=5, spans -2.5 to +2.5)
  //   Cone center at y = lowerH/2 + coneH/2 = 2.5 + 0.75 = 3.25
  //   Upper section center at y = lowerH/2 + coneH + upperH/2 = 2.5 + 1.5 + 1.5 = 5.5
  const lowerCenterY = 0;
  const coneCenterY = SG.lowerHeight / 2 + SG.coneHeight / 2;
  const upperCenterY = SG.lowerHeight / 2 + SG.coneHeight + SG.upperHeight / 2;
  const topOfUpper = SG.lowerHeight / 2 + SG.coneHeight + SG.upperHeight;

  return (
    <group position={position} onClick={handleClick}>
      {/* Lower section (tube bundle region) */}
      <mesh position={[0, lowerCenterY, 0]}>
        <cylinderGeometry args={[SG.lowerRadius, SG.lowerRadius, SG.lowerHeight, 24, 1]} />
        <meshStandardMaterial
          ref={matRef}
          color={COLORS.metalMedium}
          metalness={0.8}
          roughness={0.35}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Transition cone */}
      <mesh position={[0, coneCenterY, 0]}>
        <cylinderGeometry args={[SG.upperRadius, SG.lowerRadius, SG.coneHeight, 24, 1]} />
        <meshStandardMaterial
          color={COLORS.metalMedium}
          metalness={0.8}
          roughness={0.35}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Upper section (steam drum) */}
      <mesh position={[0, upperCenterY, 0]}>
        <cylinderGeometry args={[SG.upperRadius, SG.upperRadius, SG.upperHeight, 24, 1]} />
        <meshStandardMaterial
          color={COLORS.metalMedium}
          metalness={0.8}
          roughness={0.35}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Top dome cap */}
      <mesh position={[0, topOfUpper, 0]}>
        <sphereGeometry
          args={[SG.upperRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color={COLORS.metalMedium}
          metalness={0.8}
          roughness={0.35}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* Bottom dome cap */}
      <mesh position={[0, -SG.lowerHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry
          args={[SG.lowerRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color={COLORS.metalMedium}
          metalness={0.8}
          roughness={0.35}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>

      {/* U-tube bundle (simplified as a single torus arc) */}
      <mesh
        position={[0, -SG.lowerHeight / 2 + 0.4, 0]}
        rotation={[0, utubeRotY, Math.PI / 2]}
      >
        <torusGeometry args={[UTUBE_RADIUS, UTUBE_TUBE_RADIUS, 12, 24, Math.PI]} />
        <meshStandardMaterial
          color="#7a7a7a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Steam outlet nozzle (top) */}
      <mesh position={[0, topOfUpper + SG.upperRadius * 0.5 + 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 12, 1]} />
        <meshStandardMaterial
          color="#555555"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default React.memo(SteamGenerator);
