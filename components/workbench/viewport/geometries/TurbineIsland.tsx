"use client";

import React, { useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { useSelectionHighlight } from "../hooks/useSelectionHighlight";
import { TURBINE_ISLAND as TI } from "../layout";

interface TurbineIslandProps {
  power: number;
  selectedComponent: string | null;
  onSelect: (id: string) => void;
}

function TurbineIsland({ power, selectedComponent, onSelect }: TurbineIslandProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const hpMatRef = useSelectionHighlight(selectedComponent === "hp-turbine", 0.25);
  const currentSpeed = useRef(0);

  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(power, 0, 1);
    const targetSpeed = p * 6.0;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.03);

    if (rotorRef.current) {
      rotorRef.current.rotation.z += currentSpeed.current * delta;
    }
  });

  const bladeAngles: number[] = [];
  for (let i = 0; i < 8; i++) {
    bladeAngles.push((i / 8) * Math.PI * 2);
  }

  const handleClick = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <group position={TI.position}>
      {/* Shared rotor assembly (spins all turbines) */}
      <group ref={rotorRef}>
        {/* Shaft spanning from HP through LP to generator */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[TI.shaftRadius, TI.shaftRadius, 18, 8, 1]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* HP Turbine */}
      <group position={TI.hp.offset} onClick={handleClick("hp-turbine")}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[TI.hp.radius, TI.hp.radius, TI.hp.length, 24, 1]} />
          <meshStandardMaterial
            ref={hpMatRef}
            color={COLORS.metalMedium}
            metalness={0.85}
            roughness={0.3}
            emissive={COLORS.highlightEmissive}
            emissiveIntensity={0}
          />
        </mesh>
        {/* HP end caps */}
        <mesh position={[0, 0, TI.hp.length / 2]}>
          <sphereGeometry args={[TI.hp.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={COLORS.metalMedium} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -TI.hp.length / 2]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[TI.hp.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={COLORS.metalMedium} metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* MSR (Moisture Separator Reheater) */}
      <group position={TI.msr.offset} onClick={handleClick("msr")}>
        <mesh>
          <boxGeometry args={[TI.msr.width, TI.msr.height, TI.msr.depth]} />
          <meshStandardMaterial
            color={COLORS.msrGreen}
            metalness={0.6}
            roughness={0.5}
          />
        </mesh>
      </group>

      {/* LP Turbines (2x, larger than HP) */}
      {TI.lp.offsets.map((offset, i) => (
        <group key={`lp-${i}`} position={offset} onClick={handleClick("lp-turbine")}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[TI.lp.radius, TI.lp.radius, TI.lp.length, 24, 1]} />
            <meshStandardMaterial
              color={COLORS.metalMedium}
              metalness={0.85}
              roughness={0.3}
              emissive={COLORS.highlightEmissive}
              emissiveIntensity={selectedComponent === "lp-turbine" ? 0.3 : 0}
            />
          </mesh>
          {/* LP end caps */}
          <mesh position={[0, 0, TI.lp.length / 2]}>
            <sphereGeometry args={[TI.lp.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={COLORS.metalMedium} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -TI.lp.length / 2]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[TI.lp.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={COLORS.metalMedium} metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Generator */}
      <group position={TI.generator.offset} onClick={handleClick("generator")}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[TI.generator.radius, TI.generator.radius, TI.generator.length, 24, 1]} />
          <meshStandardMaterial
            color={COLORS.generatorCopper}
            metalness={0.7}
            roughness={0.4}
            emissive={COLORS.highlightEmissive}
            emissiveIntensity={selectedComponent === "generator" ? 0.3 : 0}
          />
        </mesh>
        {/* Generator end caps */}
        <mesh position={[0, 0, TI.generator.length / 2]}>
          <sphereGeometry args={[TI.generator.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={COLORS.generatorCopper} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, -TI.generator.length / 2]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[TI.generator.radius, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={COLORS.generatorCopper} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* Condenser (below LP turbines) */}
      <group position={TI.condenser.offset} onClick={handleClick("condenser")}>
        <mesh>
          <boxGeometry args={[TI.condenser.width, TI.condenser.height, TI.condenser.depth]} />
          <meshStandardMaterial
            color={COLORS.condenserShell}
            metalness={0.5}
            roughness={0.6}
            emissive={COLORS.highlightEmissive}
            emissiveIntensity={selectedComponent === "condenser" ? 0.3 : 0}
          />
        </mesh>
        {/* CW inlet/outlet nozzles */}
        <mesh position={[-TI.condenser.width / 2 - 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 10, 1]} />
          <meshStandardMaterial color="#555555" metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[TI.condenser.width / 2 + 0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 10, 1]} />
          <meshStandardMaterial color="#555555" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* Steam inlet pipe (from containment side, -X direction) */}
      <mesh position={[-2, TI.hp.radius + 0.3, TI.hp.offset[2]]}>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 10, 1]} />
        <meshStandardMaterial color={COLORS.steamLine} metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default React.memo(TurbineIsland);
