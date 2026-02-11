"use client";

import React, { useEffect, useState } from "react";
import { useReactorSimulation } from "../hooks/useReactorSimulation";
import { useAlarmEngine } from "../hooks/useAlarmEngine";
import {
  WorkbenchProvider,
  useWorkbench,
} from "../components/workbench/WorkbenchContext";
import WorkbenchLayout from "../components/workbench/WorkbenchLayout";

function WorkbenchInner() {
  const { sim, setAlarms } = useWorkbench();
  useAlarmEngine(sim?.state ?? null, setAlarms);
  return <WorkbenchLayout />;
}

export default function WorkbenchPage() {
  const [initError, setInitError] = useState<string | null>(null);

  const sim = useReactorSimulation();

  // Initialize on mount
  useEffect(() => {
    try {
      setInitError(null);
      sim.initializeModel();
    } catch (error) {
      console.error("Initialization error:", error);
      setInitError(
        error instanceof Error
          ? error.message
          : "Failed to initialize reactor model"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (initError) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f14",
          color: "#ef4444",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "20px", marginBottom: "8px", fontWeight: 700 }}>
            INITIALIZATION ERROR
          </div>
          <div style={{ color: "#94a3b8" }}>{initError}</div>
        </div>
      </div>
    );
  }

  return (
    <WorkbenchProvider sim={sim}>
      <WorkbenchInner />
    </WorkbenchProvider>
  );
}
