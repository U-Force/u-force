"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { useSelectionHighlight } from "../hooks/useSelectionHighlight";
import { PRESSURIZER } from "../layout";

interface PressurizerProps {
  power?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const PZR_RADIUS = PRESSURIZER.radius;
const PZR_HEIGHT = PRESSURIZER.height;
const SURGE_RADIUS = 0.14;
const HEATER_COLOR = new THREE.Color("#ff4400");

function Pressurizer({
  power = 0,
  selected = false,
  onSelect,
}: PressurizerProps) {
  const bodyMatRef = useSelectionHighlight(selected, 0.25);
  const heaterMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const currentHeaterIntensity = useRef(0);

  useFrame(() => {
    if (heaterMatRef.current) {
      const p = THREE.MathUtils.clamp(power, 0, 1);
      const targetIntensity = p * 1.5;
      currentHeaterIntensity.current = THREE.MathUtils.lerp(
        currentHeaterIntensity.current,
        targetIntensity,
        0.05
      );
      heaterMatRef.current.emissiveIntensity = currentHeaterIntensity.current;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.("pressurizer");
  };

  // Build curved surge line via CatmullRom → TubeGeometry
  // Routes from pressurizer bottom down to Loop 2 hot leg
  const surgeGeo = useMemo(() => {
    const pzrBottom = new THREE.Vector3(0, -PZR_HEIGHT / 2 - 0.2, 0);
    const target = new THREE.Vector3(
      PRESSURIZER.surgeLineTarget[0] - PRESSURIZER.position[0],
      PRESSURIZER.surgeLineTarget[1] - PRESSURIZER.position[1],
      PRESSURIZER.surgeLineTarget[2] - PRESSURIZER.position[2],
    );
    // Smooth 4-point curve: down from pressurizer, arc toward hot leg, connect
    const curve = new THREE.CatmullRomCurve3(
      [
        pzrBottom,
        new THREE.Vector3(pzrBottom.x, pzrBottom.y - 0.6, pzrBottom.z),
        new THREE.Vector3(
          (pzrBottom.x + target.x) * 0.5,
          (pzrBottom.y + target.y) * 0.5 - 0.3,
          (pzrBottom.z + target.z) * 0.5,
        ),
        target,
      ],
      false,
      "catmullrom",
      0.5
    );
    return new THREE.TubeGeometry(curve, 32, SURGE_RADIUS, 10, false);
  }, []);

  return (
    <group position={PRESSURIZER.position} onClick={handleClick}>
      {/* Pressurizer body */}
      <mesh>
        <cylinderGeometry args={[PZR_RADIUS, PZR_RADIUS, PZR_HEIGHT, 20, 1]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color="#3d3d3d"
          metalness={0.85}
          roughness={0.3}
          emissive={COLORS.highlightEmissive}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Top dome */}
      <mesh position={[0, PZR_HEIGHT / 2, 0]}>
        <sphereGeometry
          args={[PZR_RADIUS, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color="#3d3d3d"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* Bottom dome */}
      <mesh position={[0, -PZR_HEIGHT / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry
          args={[PZR_RADIUS, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color="#3d3d3d"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* Heater element glow region at bottom */}
      <mesh position={[0, -PZR_HEIGHT / 2 + 0.3, 0]}>
        <cylinderGeometry args={[PZR_RADIUS * 0.75, PZR_RADIUS * 0.75, 0.5, 16, 1]} />
        <meshStandardMaterial
          ref={heaterMatRef}
          color="#331100"
          emissive={HEATER_COLOR}
          emissiveIntensity={0}
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Curved surge line (pressurizer bottom → Loop 2 hot leg) */}
      <mesh geometry={surgeGeo}>
        <meshStandardMaterial
          color={COLORS.pipeHot}
          metalness={0.6}
          roughness={0.4}
          emissive={COLORS.pipeHot}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Relief valve nozzle on top */}
      <mesh position={[0, PZR_HEIGHT / 2 + PZR_RADIUS * 0.5 + 0.15, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8, 1]} />
        <meshStandardMaterial
          color="#555555"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

export default React.memo(Pressurizer);
