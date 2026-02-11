"use client";

import React, { useMemo } from "react";
import { COLORS, FONTS, FONT_SIZES } from "../../../lib/workbench/theme";
import GlassPanel from "../shared/GlassPanel";
import ParameterGauge from "../shared/ParameterGauge";
import LearningTooltip from "../shared/LearningTooltip";
import SparklineTrend from "./SparklineTrend";
import { STATUS_HELP } from "../../../lib/workbench/learning-content";
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
  learningMode?: boolean;
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
  learningMode = false,
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
        <div style={gaugeRow}>
          <div style={{ flex: 1 }}>
            <ParameterGauge
              label="REACTOR POWER"
              value={power}
              unit="%"
              max={120}
              warningHigh={100}
              dangerHigh={110}
              format={(v) => v.toFixed(1)}
            />
          </div>
          <LearningTooltip visible={learningMode} title={STATUS_HELP.power.title} description={STATUS_HELP.power.description} position="left" />
        </div>
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
        <div style={gaugeRow}>
          <div style={{ flex: 1 }}>
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
          </div>
          <LearningTooltip visible={learningMode} title={STATUS_HELP.fuelTemp.title} description={STATUS_HELP.fuelTemp.description} position="left" />
        </div>
        <SparklineTrend
          data={tfHistory}
          color={COLORS.amber}
          warningLevel={1500}
          dangerLevel={1800}
          min={293}
          max={2000}
        />
      </GlassPanel>

      <GlassPanel variant="dark">
        <div style={gaugeRow}>
          <div style={{ flex: 1 }}>
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
          </div>
          <LearningTooltip visible={learningMode} title={STATUS_HELP.coolantTemp.title} description={STATUS_HELP.coolantTemp.description} position="left" />
        </div>
        <SparklineTrend
          data={tcHistory}
          color={COLORS.blue}
          warningLevel={580}
          dangerLevel={620}
          min={293}
          max={650}
        />
      </GlassPanel>

      {/* Control Status */}
      <GlassPanel variant="dark">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={gaugeRow}>
            <StatusRow label="ROD POSITION" value={`${(rodActual * 100).toFixed(1)}%`} />
            <LearningTooltip visible={learningMode} title={STATUS_HELP.rodPosition.title} description={STATUS_HELP.rodPosition.description} position="left" />
          </div>
          <div style={gaugeRow}>
            <StatusRow label="BORON" value={`${boronActual.toFixed(0)} ppm`} />
            <LearningTooltip visible={learningMode} title={STATUS_HELP.boron.title} description={STATUS_HELP.boron.description} position="left" />
          </div>
          <div style={gaugeRow}>
            <StatusRow label="DECAY HEAT" value={`${decayHeatPct.toFixed(2)}%`} color={COLORS.amber} />
            <LearningTooltip visible={learningMode} title={STATUS_HELP.decayHeat.title} description={STATUS_HELP.decayHeat.description} position="left" />
          </div>
          <div style={gaugeRow}>
            <StatusRow
              label="RCP STATUS"
              value={pumpOn ? "RUNNING" : "OFF"}
              color={pumpOn ? COLORS.emerald : COLORS.red}
            />
            <LearningTooltip visible={learningMode} title={STATUS_HELP.rcpStatus.title} description={STATUS_HELP.rcpStatus.description} position="left" />
          </div>
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
  color = COLORS.emerald,
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
      <span style={{ fontSize: FONT_SIZES.xs, color: COLORS.teal, letterSpacing: "1px", fontWeight: 700 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: FONT_SIZES.lg,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const gaugeRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const headerStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  letterSpacing: "1.5px",
  color: COLORS.teal,
  fontWeight: 700,
  fontFamily: FONTS.sans,
  paddingBottom: "4px",
  borderBottom: `1px solid ${COLORS.borderEmeraldLight}`,
  marginBottom: "4px",
};
