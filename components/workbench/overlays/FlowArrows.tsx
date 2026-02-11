"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlowArrowsProps {
  flowSpeed: number;
  coolantTemp: number;
}

/** Animated arrows along the primary loop showing coolant flow direction */
const FlowArrows = React.memo(function FlowArrows({
  flowSpeed,
  coolantTemp,
}: FlowArrowsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const offsetRef = useRef(0);

  // Arrow positions along the hot/cold legs
  const arrowPaths: [number, number, number][] = [
    // Hot leg A (vessel → SG-A)
    [2.5, 2, -1.5],
    [4.5, 2, -2],
    // Hot leg B (vessel → SG-B)
    [-2.5, 2, -1.5],
    [-4.5, 2, -2],
    // Cold leg A (SG-A → pump → vessel)
    [5, -2, -3],
    [3, -3, -2],
    // Cold leg B (SG-B → vessel)
    [-5, -2, -3],
    [-3, -3, -2],
  ];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    offsetRef.current += delta * flowSpeed * 2;

    // Pulse opacity based on flow
    const pulse = flowSpeed > 0 ? 0.4 + Math.sin(offsetRef.current * 3) * 0.3 : 0.1;

    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.opacity = pulse;
        // Temperature-based coloring
        const t = Math.max(0, Math.min(1, (coolantTemp - 300) / 350));
        mesh.material.color.setRGB(
          0.13 + t * 0.83,
          0.59 - t * 0.3,
          0.95 - t * 0.73
        );
      }
    });
  });

  if (flowSpeed <= 0.01) return null;

  return (
    <group ref={groupRef}>
      {arrowPaths.map((pos, i) => (
        <mesh key={i} position={pos}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial
            color="#2196f3"
            transparent
            opacity={0.4}
            emissive="#2196f3"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
});

export default FlowArrows;
