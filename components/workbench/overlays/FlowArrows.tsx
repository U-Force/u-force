"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LOOPS, VESSEL } from "../viewport/layout";

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

  // Build arrow positions for all 4 loops (2 hot + 2 cold per loop = 16 total)
  const arrowPaths: [number, number, number][] = [];
  for (const loop of LOOPS) {
    const [sx, , sz] = loop.sgPosition;
    // Hot leg arrows (mid-path, elevated)
    arrowPaths.push([
      loop.dirX * (VESSEL.radius + 3),
      VESSEL.hotNozzleY + 0.5,
      loop.dirZ * (VESSEL.radius + 3),
    ]);
    arrowPaths.push([
      sx - loop.dirX * 2,
      1.5,
      sz - loop.dirZ * 2,
    ]);
    // Cold leg arrows (lower path)
    arrowPaths.push([
      loop.rcpPosition[0] + loop.dirX * 1.5,
      loop.rcpPosition[1] + 0.5,
      loop.rcpPosition[2] + loop.dirZ * 1.5,
    ]);
    arrowPaths.push([
      loop.dirX * (VESSEL.radius + 2),
      VESSEL.coldNozzleY - 0.5,
      loop.dirZ * (VESSEL.radius + 2),
    ]);
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    offsetRef.current += delta * flowSpeed * 2;

    const pulse = flowSpeed > 0 ? 0.4 + Math.sin(offsetRef.current * 3) * 0.3 : 0.1;

    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.opacity = pulse;
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
