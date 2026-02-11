"use client";

import React, { useMemo } from "react";
import GlassPanel from "../shared/GlassPanel";
import ParameterGauge from "../shared/ParameterGauge";
import SparklineTrend from "./SparklineTrend";
import type { HistoryPoint } from "../../../hooks/useReactorSimulation";

interface PlantStatusPanelProps {
  power: number;
  fuelTemp: number;
  coolantTemp: number;
  rodActual: number;
  boronActual: number;
  pumpOn: boolean;
  decayHeatPct: number;
  simTime: number;
  history: HistoryPoint[];
}

export default function PlantStatusPanel({
  power,
  fuelTemp,
  coolantTemp,
  rodActual,
  boronActual,
  pumpOn,
  decayHeatPct,
  simTime,
  history,
}: PlantStatusPanelProps) {
  const powerHistory = useMemo(
    () => history.slice(-60).map((h) => ({ value: h.P * 100 })),
    [history]
  );
  const tfHistory = useMemo(
    () => history.slice(-60).map((h) => ({ value: h.Tf })),
    [history]
  );
  const tcHistory = useMemo(
    () => history.slice(-60).map((h) => ({ value: h.Tc })),
    [history]
  );

  const mins = Math.floor(simTime / 60);
  const secs = Math.floor(simTime % 60);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={headerStyle}>PLANT STATUS</div>

      {/* Power */}
      <GlassPanel variant="dark">
        <ParameterGauge
          label="REACTOR POWER"
          value={power}
          unit="%"
          max={120}
          warningHigh={100}
          dangerHigh={110}
          format={(v) => v.toFixed(1)}
        />
        <SparklineTrend
          data={powerHistory}
          warningLevel={100}
          dangerLevel={110}
          min={0}
          max={120}
        />
      </GlassPanel>

      {/* Temperatures */}
      <GlassPanel variant="dark">
        <ParameterGauge
          label="FUEL TEMP"
          value={fuelTemp}
          unit="K"
          min={293}
          max={2000}
          warningHigh={1500}
          dangerHigh={1800}
          format={(v) => v.toFixed(0)}
        />
        <SparklineTrend
          data={tfHistory}
          color="#f59e0b"
          warningLevel={1500}
          dangerLevel={1800}
          min={293}
          max={2000}
        />
      </GlassPanel>

      <GlassPanel variant="dark">
        <ParameterGauge
          label="COOLANT TEMP"
          value={coolantTemp}
          unit="K"
          min={293}
          max={650}
          warningHigh={580}
          dangerHigh={620}
          format={(v) => v.toFixed(0)}
        />
        <SparklineTrend
          data={tcHistory}
          color="#3b82f6"
          warningLevel={580}
          dangerLevel={620}
          min={293}
          max={650}
        />
      </GlassPanel>

      {/* Control Status */}
      <GlassPanel variant="dark">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <StatusRow label="ROD POSITION" value={`${(rodActual * 100).toFixed(1)}%`} />
          <StatusRow label="BORON" value={`${boronActual.toFixed(0)} ppm`} />
          <StatusRow label="DECAY HEAT" value={`${decayHeatPct.toFixed(2)}%`} color="#f59e0b" />
          <StatusRow
            label="RCP STATUS"
            value={pumpOn ? "RUNNING" : "OFF"}
            color={pumpOn ? "#10b981" : "#ef4444"}
          />
          <StatusRow
            label="SIM TIME"
            value={`${mins}:${secs.toString().padStart(2, "0")}`}
          />
        </div>
      </GlassPanel>
    </div>
  );
}

function StatusRow({
  label,
  value,
  color = "#10b981",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "9px", color: "#6ee7b7", letterSpacing: "1px", fontWeight: 700 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "12px",
          fontFamily: "'Share Tech Mono', monospace",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "1.5px",
  color: "#6ee7b7",
  fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
  paddingBottom: "4px",
  borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
  marginBottom: "4px",
};
