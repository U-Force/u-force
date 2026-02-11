"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { LOOPS, SG, PIPING, TURBINE_ISLAND as TI } from "../layout";
import FeedwaterPump from "./FeedwaterPump";

interface SecondaryLoopProps {
  power: number;
  pumpOn: boolean;
  selectedComponent: string | null;
  onSelect: (id: string) => void;
}

function makeCurve(points: [number, number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    0.5
  );
}

const STEAM_COLOR = new THREE.Color(COLORS.steamLine);
const FW_COLOR = new THREE.Color(COLORS.feedwater);

function SecondaryLoop({ power, pumpOn, selectedComponent, onSelect }: SecondaryLoopProps) {
  const steamRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null, null]);
  const fwRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null, null]);
  const phaseRef = useRef(0);

  // SG top → common header point → turbine inlet
  const sgTopY = SG.lowerHeight / 2 + SG.coneHeight + SG.upperHeight + SG.upperRadius * 0.5 + 0.4;
  const turbineInlet: [number, number, number] = [
    TI.position[0] - 3,
    TI.position[1] + TI.hp.radius + 0.5,
    TI.position[2] + TI.hp.offset[2],
  ];

  // Feedwater return: condenser area → feed pump → SGs (enters at middle height)
  const fwSourceY = TI.position[1] + TI.condenser.offset[1];
  const fwSourceX = TI.position[0] + TI.condenser.offset[0] - TI.condenser.width / 2 - 1;
  const fwSourceZ = TI.position[2] + TI.condenser.offset[2];

  const { steamGeos, fwGeos } = useMemo(() => {
    const sGeos: THREE.TubeGeometry[] = [];
    const fGeos: THREE.TubeGeometry[] = [];

    for (const loop of LOOPS) {
      const [sx, , sz] = loop.sgPosition;

      // Steam line: SG top → converge above containment → turbine inlet
      const steamCurve = makeCurve([
        [sx, sgTopY, sz],
        [sx * 0.6, sgTopY + 2, sz * 0.6],
        [turbineInlet[0] * 0.5, sgTopY + 3, 0],
        turbineInlet,
      ]);
      sGeos.push(new THREE.TubeGeometry(steamCurve, 40, PIPING.steamLineRadius, PIPING.segments, false));

      // Feedwater line: source → back to SG at mid-height
      const sgMidY = SG.lowerHeight / 2 + SG.coneHeight * 0.5;
      const fwCurve = makeCurve([
        [fwSourceX, fwSourceY, fwSourceZ],
        [fwSourceX - 3, fwSourceY - 1, fwSourceZ * 0.5 + sz * 0.5],
        [sx * 0.5, sgMidY - 1, sz * 0.5],
        [sx, sgMidY, sz],
      ]);
      fGeos.push(new THREE.TubeGeometry(fwCurve, 40, PIPING.feedwaterRadius, PIPING.segments, false));
    }

    return { steamGeos: sGeos, fwGeos: fGeos };
  }, [sgTopY, turbineInlet, fwSourceX, fwSourceY, fwSourceZ]);

  useFrame((_, delta) => {
    phaseRef.current += delta * power * 2.0;
    const pulse = power > 0.01 ? 0.1 + 0.08 * Math.sin(phaseRef.current) : 0.03;

    for (let i = 0; i < 4; i++) {
      const sRef = steamRefs.current[i];
      if (sRef) {
        sRef.emissiveIntensity = pulse;
      }
      const fRef = fwRefs.current[i];
      if (fRef) {
        fRef.emissiveIntensity = pulse * 0.8;
      }
    }
  });

  // Feed pump positions (between condenser and containment)
  const feedPumpPos: [number, number, number] = [
    TI.position[0] - 6,
    TI.position[1] + TI.condenser.offset[1],
    TI.position[2],
  ];
  const condensatePumpPos: [number, number, number] = [
    TI.position[0] + TI.condenser.offset[0] - TI.condenser.width / 2 - 1.5,
    TI.position[1] + TI.condenser.offset[1] - 0.5,
    TI.position[2] + TI.condenser.offset[2],
  ];

  return (
    <group>
      {/* Steam lines from each SG to turbine */}
      {LOOPS.map((loop, i) => (
        <mesh key={`steam-${loop.id}`} geometry={steamGeos[i]}>
          <meshStandardMaterial
            ref={(el) => { steamRefs.current[i] = el; }}
            color={COLORS.steamLine}
            metalness={0.5}
            roughness={0.5}
            emissive={STEAM_COLOR}
            emissiveIntensity={0.05}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Feedwater lines from feed system back to each SG */}
      {LOOPS.map((loop, i) => (
        <mesh key={`fw-${loop.id}`} geometry={fwGeos[i]}>
          <meshStandardMaterial
            ref={(el) => { fwRefs.current[i] = el; }}
            color={COLORS.feedwater}
            metalness={0.6}
            roughness={0.4}
            emissive={FW_COLOR}
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}

      {/* Feed pump */}
      <FeedwaterPump
        pumpId="feed-pump"
        position={feedPumpPos}
        pumpOn={pumpOn && power > 0.01}
        selected={selectedComponent === "feed-pump"}
        onSelect={onSelect}
      />

      {/* Condensate pump */}
      <FeedwaterPump
        pumpId="condensate-pump"
        position={condensatePumpPos}
        pumpOn={pumpOn && power > 0.01}
        selected={selectedComponent === "condensate-pump"}
        onSelect={onSelect}
      />
    </group>
  );
}

export default React.memo(SecondaryLoop);
