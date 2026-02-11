"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ControlRodAssemblyProps {
  /** 0 = fully inserted (bottom), 1 = fully withdrawn (top) */
  rodPosition: number;
}

const ROD_RADIUS = 0.04;
const ROD_HEIGHT = 3.8;
const CLUSTER_OFFSET = 0.15;
const Y_BOTTOM = -2;
const Y_TOP = 2;

// 4 rods in a square cluster pattern
const ROD_OFFSETS: [number, number][] = [
  [-CLUSTER_OFFSET, -CLUSTER_OFFSET],
  [-CLUSTER_OFFSET, CLUSTER_OFFSET],
  [CLUSTER_OFFSET, -CLUSTER_OFFSET],
  [CLUSTER_OFFSET, CLUSTER_OFFSET],
];

function ControlRodAssembly({ rodPosition }: ControlRodAssemblyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(Y_BOTTOM);

  useFrame(() => {
    if (!groupRef.current) return;

    const clamped = THREE.MathUtils.clamp(rodPosition, 0, 1);
    const targetY = THREE.MathUtils.lerp(Y_BOTTOM, Y_TOP, clamped);

    // Smooth interpolation for rod movement
    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, 0.06);
    groupRef.current.position.y = currentY.current;
  });

  return (
    <group ref={groupRef} position={[0, Y_BOTTOM, 0]}>
      {ROD_OFFSETS.map(([ox, oz], i) => (
        <mesh key={`rod-${i}`} position={[ox, 0, oz]}>
          <cylinderGeometry args={[ROD_RADIUS, ROD_RADIUS, ROD_HEIGHT, 8, 1]} />
          <meshStandardMaterial
            color="#c0c0c0"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Spider assembly connecting the 4 rods at the top */}
      <mesh position={[0, ROD_HEIGHT / 2 + 0.05, 0]}>
        <cylinderGeometry args={[CLUSTER_OFFSET * 1.6, CLUSTER_OFFSET * 1.6, 0.06, 8, 1]} />
        <meshStandardMaterial
          color="#a0a0a0"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>

      {/* Drive shaft extending upward from spider */}
      <mesh position={[0, ROD_HEIGHT / 2 + 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 6, 1]} />
        <meshStandardMaterial
          color="#b0b0b0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default React.memo(ControlRodAssembly);
