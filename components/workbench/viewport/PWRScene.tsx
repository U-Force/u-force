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
import Turbine from "./geometries/Turbine";
import HotspotMarker from "../overlays/HotspotMarker";
import type { SceneProps } from "./hooks/usePhysicsToScene";

interface PWRSceneProps extends SceneProps {
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  showHotspots: boolean;
}

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
      <Containment
        visible={containmentVisible}
        viewMode={viewMode}
      />

      {/* Reactor Vessel at origin */}
      <ReactorVessel
        onSelect={onSelectComponent}
        selected={selectedComponent === "vessel"}
      />

      {/* Core glow inside vessel */}
      <CoreRegion power={power} />

      {/* Control Rods */}
      <ControlRodAssembly rodPosition={rodPosition} />

      {/* Primary Loop Piping */}
      <PrimaryLoop coolantTemp={coolantTemp} flowSpeed={flowSpeed} />

      {/* Coolant Pump (on cold leg A) */}
      <CoolantPump
        position={[4.5, -3, -3]}
        pumpOn={pumpOn}
        onSelect={onSelectComponent}
        selected={selectedComponent === "pump"}
      />

      {/* Steam Generator A (right side) */}
      <SteamGenerator
        position={[6, 0, -3]}
        sgId="sg-a"
        onSelect={onSelectComponent}
        selected={selectedComponent === "sg-a"}
      />

      {/* Steam Generator B (left side) */}
      <SteamGenerator
        position={[-6, 0, -3]}
        sgId="sg-b"
        onSelect={onSelectComponent}
        selected={selectedComponent === "sg-b"}
      />

      {/* Pressurizer (offset) */}
      <Pressurizer
        power={power}
        onSelect={onSelectComponent}
        selected={selectedComponent === "pressurizer"}
      />

      {/* Turbine (secondary side) */}
      <Turbine
        power={power}
        onSelect={onSelectComponent}
        selected={selectedComponent === "turbine"}
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
          <HotspotMarker
            position={[6, 4, -3]}
            label="SG-A"
            componentId="sg-a"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[-6, 4, -3]}
            label="SG-B"
            componentId="sg-b"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[3.5, 4.5, 0]}
            label="Pressurizer"
            componentId="pressurizer"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[4.5, -2.5, -3]}
            label="RCP"
            componentId="pump"
            onClick={onSelectComponent}
          />
          <HotspotMarker
            position={[10, 1, 0]}
            label="Turbine"
            componentId="turbine"
            onClick={onSelectComponent}
          />
        </>
      )}
    </group>
  );
}
