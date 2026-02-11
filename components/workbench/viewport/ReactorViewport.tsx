"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stars } from "@react-three/drei";
import PWRScene from "./PWRScene";
import type { SceneProps } from "./hooks/usePhysicsToScene";

interface ReactorViewportProps extends SceneProps {
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  showHotspots: boolean;
  toolMode: "select" | "pan" | "orbit";
}

function SceneContent(props: ReactorViewportProps) {
  const { toolMode, ...sceneProps } = props;
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#ff6f00" distance={8} />

      {/* Environment for reflections */}
      <Environment preset="night" />

      {/* Background stars */}
      <Stars radius={100} depth={50} count={1000} factor={2} saturation={0} />

      {/* PWR Scene */}
      <PWRScene {...sceneProps} />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enablePan={toolMode === "pan"}
        enableRotate={toolMode === "orbit" || toolMode === "select"}
        enableZoom
        minDistance={5}
        maxDistance={40}
        target={[0, 1, 0]}
      />
    </>
  );
}

export default function ReactorViewport(props: ReactorViewportProps) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [18, 12, 18], fov: 50, near: 0.1, far: 200 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
