"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ContainmentProps {
  /** Whether containment dome is visible */
  visible?: boolean;
  /** View mode: "normal" shows translucent dome, "xray" nearly invisible */
  viewMode?: "normal" | "xray" | "section";
}

const DOME_RADIUS = 12;
const NORMAL_OPACITY = 0.08;
const XRAY_OPACITY = 0.02;

function Containment({
  visible = true,
  viewMode = "normal",
}: ContainmentProps) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;

    const targetOpacity =
      viewMode === "xray" ? XRAY_OPACITY : NORMAL_OPACITY;

    matRef.current.opacity = THREE.MathUtils.lerp(
      matRef.current.opacity,
      targetOpacity,
      0.05
    );

    if (wireMatRef.current) {
      const wireTarget = viewMode === "xray" ? 0.03 : 0.06;
      wireMatRef.current.opacity = THREE.MathUtils.lerp(
        wireMatRef.current.opacity,
        wireTarget,
        0.05
      );
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Solid translucent dome */}
      <mesh>
        <sphereGeometry args={[DOME_RADIUS, 32, 24]} />
        <meshPhysicalMaterial
          ref={matRef}
          color="#88aacc"
          transparent
          opacity={NORMAL_OPACITY}
          metalness={0.1}
          roughness={0.2}
          transmission={0.6}
          thickness={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[DOME_RADIUS * 1.001, 24, 18]} />
        <meshBasicMaterial
          ref={wireMatRef}
          color="#6688aa"
          wireframe
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default React.memo(Containment);
