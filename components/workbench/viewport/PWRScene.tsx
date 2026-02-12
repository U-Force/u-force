"use client";

import React from "react";
import ReactorVessel from "./geometries/ReactorVessel";
import ControlRodAssembly from "./geometries/ControlRodAssembly";
import CoreRegion from "./geometries/CoreRegion";
import SteamGenerator from "./geometries/SteamGenerator";
import Pressurizer from "./geometries/Pressurizer";
import PrimaryLoop from "./geometries/PrimaryLoop";
import CoolantPump from "./geometries/CoolantPump";
import Containment from "./geometries/Containment";
import TurbineIsland from "./geometries/TurbineIsland";
import SecondaryLoop from "./geometries/SecondaryLoop";
import HotspotMarker from "../overlays/HotspotMarker";
import { LOOPS, PRESSURIZER, TURBINE_ISLAND as TI, SG } from "./layout";
import type { SceneProps } from "./hooks/usePhysicsToScene";

interface PWRSceneProps extends SceneProps {
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  showHotspots: boolean;
}

// SG top Y for hotspot placement
const SG_TOP_Y = SG.lowerHeight / 2 + SG.coneHeight + SG.upperHeight + SG.upperRadius + 1;

export default function PWRScene({
  power,
  rodPosition,
  coolantTemp,
  pumpOn,
  flowSpeed,
  containmentVisible,
  viewMode,
  selectedComponent,
  onSelectComponent,
  showHotspots,
}: PWRSceneProps) {
  return (
    <group>
      {/* Containment dome */}
      <Containment visible={containmentVisible} viewMode={viewMode} />

      {/* Reactor Vessel at origin */}
      <ReactorVessel
        onSelect={onSelectComponent}
        selected={selectedComponent === "vessel"}
        viewMode={viewMode}
      />

      {/* Core glow inside vessel */}
      <CoreRegion power={power} />

      {/* Control Rods */}
      <ControlRodAssembly rodPosition={rodPosition} />

      {/* Primary Loop Piping (4 loops) */}
      <PrimaryLoop coolantTemp={coolantTemp} flowSpeed={flowSpeed} />

      {/* 4 Steam Generators + 4 RCPs */}
      {LOOPS.map((loop) => (
        <React.Fragment key={`loop-${loop.id}`}>
          <SteamGenerator
            position={loop.sgPosition}
            sgId={`sg-${loop.id}`}
            onSelect={onSelectComponent}
            selected={selectedComponent === `sg-${loop.id}`}
          />
          <CoolantPump
            position={loop.rcpPosition}
            pumpId={`rcp-${loop.id}`}
            pumpOn={pumpOn}
            onSelect={onSelectComponent}
            selected={selectedComponent === `rcp-${loop.id}`}
          />
        </React.Fragment>
      ))}

      {/* Pressurizer (on Loop 2 hot leg) */}
      <Pressurizer
        power={power}
        onSelect={onSelectComponent}
        selected={selectedComponent === "pressurizer"}
      />

      {/* Turbine Island (outside containment) */}
      <TurbineIsland
        power={power}
        selectedComponent={selectedComponent}
        onSelect={onSelectComponent}
      />

      {/* Secondary Loop (steam lines + feedwater) */}
      <SecondaryLoop
        power={power}
        pumpOn={pumpOn}
        selectedComponent={selectedComponent}
        onSelect={onSelectComponent}
      />

      {/* Hotspot Markers */}
      {showHotspots && (
        <>
          <HotspotMarker
            position={[0, 6, 0]}
            label="Reactor Vessel"
            componentId="vessel"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[0, 2, 0]}
            label="Core"
            componentId="core"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[0, 4.5, 0]}
            label="Control Rods"
            componentId="rods"
            onClick={onSelectComponent}
          />
          {/* SG hotspots */}
          {LOOPS.map((loop) => (
            <HotspotMarker
              key={`hs-sg-${loop.id}`}
              position={[loop.sgPosition[0], SG_TOP_Y, loop.sgPosition[2]]}
              label={`SG-${loop.id}`}
              componentId={`sg-${loop.id}`}
              onClick={onSelectComponent}
            />
          ))}
          {/* RCP hotspots */}
          {LOOPS.map((loop) => (
            <HotspotMarker
              key={`hs-rcp-${loop.id}`}
              position={[loop.rcpPosition[0], loop.rcpPosition[1] + 1.5, loop.rcpPosition[2]]}
              label={`RCP-${loop.id}`}
              componentId={`rcp-${loop.id}`}
              onClick={onSelectComponent}
            />
          ))}
          <HotspotMarker
            position={[PRESSURIZER.position[0], PRESSURIZER.position[1] + 3, PRESSURIZER.position[2]]}
            label="Pressurizer"
            componentId="pressurizer"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[TI.position[0], TI.position[1] + 3, TI.position[2]]}
            label="Turbine Island"
            componentId="hp-turbine"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[TI.position[0] + TI.generator.offset[0], 3, TI.position[2] + TI.generator.offset[2]]}
            label="Generator"
            componentId="generator"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[TI.position[0] + TI.condenser.offset[0], TI.condenser.offset[1] + 2, TI.position[2] + TI.condenser.offset[2]]}
            label="Condenser"
            componentId="condenser"
            onClick={onSelectComponent}
          />
        </>
      )}
    </group>
  );
}
