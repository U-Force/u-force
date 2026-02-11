"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "../../../../lib/workbench/theme";
import { LOOPS, VESSEL, SG, PIPING } from "../layout";

interface PrimaryLoopProps {
  coolantTemp: number;
  flowSpeed: number;
}

const COLD_COLOR = new THREE.Color(COLORS.pipeCold);
const HOT_COLOR = new THREE.Color(COLORS.pipeHot);

function makeCurve(points: [number, number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    0.5
  );
}

function PrimaryLoop({ coolantTemp, flowSpeed }: PrimaryLoopProps) {
  // Refs: 4 hot legs + 4 cold legs = 8 material refs
  const hotLegRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null, null]);
  const coldLegRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([null, null, null, null]);
  const currentColor = useMemo(() => new THREE.Color(), []);
  const phaseRef = useRef(0);

  // Build tube geometries for all 4 loops
  const { hotGeos, coldGeos } = useMemo(() => {
    const hGeos: THREE.TubeGeometry[] = [];
    const cGeos: THREE.TubeGeometry[] = [];

    for (const loop of LOOPS) {
      const [sx, , sz] = loop.sgPosition;
      const sgBottomY = -SG.lowerHeight / 2;

      // Hot leg: vessel top → SG inlet (enters SG at roughly y=0 level)
      const hotCurve = makeCurve([
        [loop.dirX * VESSEL.radius, VESSEL.hotNozzleY, loop.dirZ * VESSEL.radius],
        [loop.dirX * (VESSEL.radius + 2.5), VESSEL.hotNozzleY + 0.5, loop.dirZ * (VESSEL.radius + 2.5)],
        [sx - loop.dirX * 1.2, 1.0, sz - loop.dirZ * 1.2],
        [sx, 0, sz],
      ]);

      // Cold leg: SG bottom → through RCP → vessel bottom
      const [rcpX, rcpY, rcpZ] = loop.rcpPosition;
      const coldCurve = makeCurve([
        [sx, sgBottomY, sz],
        [sx - loop.dirX * 1.5, sgBottomY - 0.5, sz - loop.dirZ * 1.5],
        [rcpX, rcpY, rcpZ],
        [loop.dirX * (VESSEL.radius + 1.5), VESSEL.coldNozzleY - 0.3, loop.dirZ * (VESSEL.radius + 1.5)],
        [loop.dirX * VESSEL.radius, VESSEL.coldNozzleY, loop.dirZ * VESSEL.radius],
      ]);

      hGeos.push(new THREE.TubeGeometry(hotCurve, 40, PIPING.primaryRadius, PIPING.segments, false));
      cGeos.push(new THREE.TubeGeometry(coldCurve, 48, PIPING.primaryRadius, PIPING.segments, false));
    }

    return { hotGeos: hGeos, coldGeos: cGeos };
  }, []);

  useFrame((_, delta) => {
    const t = THREE.MathUtils.clamp(coolantTemp, 0, 1);
    phaseRef.current += delta * flowSpeed * 3.0;

    const pulse = flowSpeed > 0 ? 0.15 + 0.1 * Math.sin(phaseRef.current) : 0.05;

    const hotColor = currentColor.copy(COLD_COLOR).lerp(HOT_COLOR, t);
    const coldT = Math.max(t - 0.15, 0);
    const coldColor = new THREE.Color().copy(COLD_COLOR).lerp(HOT_COLOR, coldT);

    for (let i = 0; i < 4; i++) {
      const hRef = hotLegRefs.current[i];
      if (hRef) {
        hRef.color.copy(hotColor);
        hRef.emissive.copy(hotColor);
        hRef.emissiveIntensity = pulse;
      }
      const cRef = coldLegRefs.current[i];
      if (cRef) {
        cRef.color.copy(coldColor);
        cRef.emissive.copy(coldColor);
        cRef.emissiveIntensity = pulse;
      }
    }
  });

  return (
    <group>
      {LOOPS.map((loop, i) => (
        <React.Fragment key={`loop-${loop.id}`}>
          {/* Hot leg */}
          <mesh geometry={hotGeos[i]}>
            <meshStandardMaterial
              ref={(el) => { hotLegRefs.current[i] = el; }}
              color={COLORS.pipeHot}
              metalness={0.6}
              roughness={0.4}
              emissive={COLORS.pipeHot}
              emissiveIntensity={0.15}
            />
          </mesh>

          {/* Cold leg */}
          <mesh geometry={coldGeos[i]}>
            <meshStandardMaterial
              ref={(el) => { coldLegRefs.current[i] = el; }}
              color={COLORS.pipeCold}
              metalness={0.6}
              roughness={0.4}
              emissive={COLORS.pipeCold}
              emissiveIntensity={0.1}
            />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

export default React.memo(PrimaryLoop);
