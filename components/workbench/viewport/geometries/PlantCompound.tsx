"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CONTAINMENT, TURBINE_ISLAND as TI } from "../layout";

interface PlantCompoundProps {
  viewMode?: "normal" | "xray" | "section" | "interior";
}

const GROUND_Y = CONTAINMENT.baseY - 1.0; // -8

// ── Palette ────────────────────────────────────────────────────────────────
const GRASS = "#4a5c3a";
const METAL_SIDING = "#8a9098";
const METAL_ROOF = "#707880";
const CONCRETE = "#a8a49c";
const ASPHALT = "#3a3a3a";
const TOWER_CONCRETE = "#c0bbb2";
const FENCE_COLOR = "#666666";

function PlantCompound({ viewMode = "normal" }: PlantCompoundProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(1.0);

  // Fade out in interior / xray modes
  useFrame(() => {
    if (!groupRef.current) return;
    const target = viewMode === "interior" || viewMode === "xray" ? 0 : 1;
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, target, 0.06);
    const op = opacityRef.current;

    if (op < 0.01) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    groupRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material;
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.opacity = op;
        mat.transparent = op < 0.99;
        mat.depthWrite = op > 0.5;
      }
    });
  });

  // Cooling tower hyperboloid profile
  const towerProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const height = 28;
    const a = 5; // throat radius
    const b = 12;
    const y0 = 18; // throat height
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const y = t * height;
      const r = a * Math.sqrt(1 + ((y - y0) / b) ** 2);
      points.push(new THREE.Vector2(r, y));
    }
    return points;
  }, []);

  // Cooling tower support columns
  const towerColumns = useMemo(() => {
    const baseR = 5 * Math.sqrt(1 + (18 / 12) ** 2); // r at y=0
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 16;
      return {
        x: Math.cos(angle) * (baseR - 0.3),
        z: Math.sin(angle) * (baseR - 0.3),
      };
    });
  }, []);

  // Fence posts
  const fencePosts = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 40;
      return {
        x: Math.cos(angle) * 55,
        z: Math.sin(angle) * 55,
      };
    });
  }, []);

  const tbX = TI.position[0]; // 24
  const tbZ = 4;

  return (
    <group ref={groupRef}>
      {/* ── Ground plane ─────────────────────────────────────────── */}
      <mesh
        position={[0, GROUND_Y - 0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[80, 64]} />
        <meshStandardMaterial color={GRASS} roughness={0.98} metalness={0} />
      </mesh>

      {/* ── Turbine building (enclosing turbine island) ──────────── */}
      <group position={[tbX, GROUND_Y, tbZ]}>
        {/* Roof */}
        <mesh position={[0, 14.5, 0]} castShadow>
          <boxGeometry args={[16, 0.3, 24]} />
          <meshStandardMaterial
            color={METAL_ROOF}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        {/* Left wall */}
        <mesh position={[-8, 7.25, 0]} castShadow>
          <boxGeometry args={[0.25, 14.5, 24]} />
          <meshStandardMaterial
            color={METAL_SIDING}
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Right wall */}
        <mesh position={[8, 7.25, 0]} castShadow>
          <boxGeometry args={[0.25, 14.5, 24]} />
          <meshStandardMaterial
            color={METAL_SIDING}
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Back wall */}
        <mesh position={[0, 7.25, -12]} castShadow>
          <boxGeometry args={[16, 14.5, 0.25]} />
          <meshStandardMaterial
            color={METAL_SIDING}
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Front wall */}
        <mesh position={[0, 7.25, 12]} castShadow>
          <boxGeometry args={[16, 14.5, 0.25]} />
          <meshStandardMaterial
            color={METAL_SIDING}
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Foundation slab */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[17, 0.3, 25]} />
          <meshStandardMaterial
            color={CONCRETE}
            roughness={0.95}
            metalness={0.01}
          />
        </mesh>
      </group>

      {/* ── Auxiliary building ────────────────────────────────────── */}
      <group position={[-6, GROUND_Y, -18]}>
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[14, 7, 10]} />
          <meshStandardMaterial
            color={CONCRETE}
            roughness={0.9}
            metalness={0.02}
          />
        </mesh>
        <mesh position={[0, 7.1, 0]}>
          <boxGeometry args={[14.4, 0.2, 10.4]} />
          <meshStandardMaterial
            color={METAL_ROOF}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* ── Control building ─────────────────────────────────────── */}
      <group position={[12, GROUND_Y, -20]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[8, 5, 8]} />
          <meshStandardMaterial
            color="#b0aca4"
            roughness={0.88}
            metalness={0.03}
          />
        </mesh>
        <mesh position={[0, 5.1, 0]}>
          <boxGeometry args={[8.3, 0.2, 8.3]} />
          <meshStandardMaterial
            color={METAL_ROOF}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      </group>

      {/* ── Cooling tower (natural draft) ────────────────────────── */}
      <group position={[-30, GROUND_Y, -35]}>
        {/* Hyperboloid shell */}
        <mesh position={[0, 3, 0]} castShadow>
          <latheGeometry args={[towerProfile, 32]} />
          <meshStandardMaterial
            color={TOWER_CONCRETE}
            roughness={0.92}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Support columns */}
        {towerColumns.map((col, i) => (
          <mesh key={`tc-${i}`} position={[col.x, 1.5, col.z]}>
            <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
            <meshStandardMaterial
              color={CONCRETE}
              roughness={0.9}
              metalness={0.02}
            />
          </mesh>
        ))}
        {/* Base apron */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3, 10, 32]} />
          <meshStandardMaterial
            color={CONCRETE}
            roughness={0.95}
            metalness={0.01}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ── Switchyard ───────────────────────────────────────────── */}
      <group position={[50, GROUND_Y, 0]}>
        {/* Gravel pad */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 14]} />
          <meshStandardMaterial
            color="#6a6a64"
            roughness={0.9}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Transformers */}
        {[-4, 0, 4].map((z, i) => (
          <mesh key={`xfmr-${i}`} position={[0, 1.5, z]} castShadow>
            <boxGeometry args={[2, 3, 2]} />
            <meshStandardMaterial
              color="#707070"
              roughness={0.6}
              metalness={0.5}
            />
          </mesh>
        ))}
        {/* Lattice towers */}
        {[-6, 6].map((z, i) => (
          <mesh key={`lt-${i}`} position={[5, 5, z]} castShadow>
            <boxGeometry args={[0.5, 10, 0.5]} />
            <meshStandardMaterial
              color={FENCE_COLOR}
              roughness={0.6}
              metalness={0.7}
            />
          </mesh>
        ))}
        {/* Transmission line */}
        <mesh position={[5, 10, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 12, 4]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.5}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* ── Perimeter road (ring) ────────────────────────────────── */}
      <mesh
        position={[0, GROUND_Y + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[42, 46, 64]} />
        <meshStandardMaterial
          color={ASPHALT}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Access road (straight, from south) ───────────────────── */}
      <mesh
        position={[35, GROUND_Y + 0.02, -40]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[6, 40]} />
        <meshStandardMaterial
          color={ASPHALT}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Parking lot ──────────────────────────────────────────── */}
      <mesh
        position={[25, GROUND_Y + 0.02, -35]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[18, 10]} />
        <meshStandardMaterial
          color="#484848"
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Security fence posts ─────────────────────────────────── */}
      {fencePosts.map((p, i) => (
        <mesh key={`fp-${i}`} position={[p.x, GROUND_Y + 1.25, p.z]}>
          <cylinderGeometry args={[0.06, 0.06, 2.5, 6]} />
          <meshStandardMaterial
            color={FENCE_COLOR}
            roughness={0.6}
            metalness={0.7}
          />
        </mesh>
      ))}
      {/* Fence wires */}
      {[1.0, 2.0].map((h, i) => (
        <mesh
          key={`fw-${i}`}
          position={[0, GROUND_Y + h, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[55, 0.02, 4, 80]} />
          <meshStandardMaterial
            color={FENCE_COLOR}
            roughness={0.5}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

export default React.memo(PlantCompound);
