"use client";

import React from "react";
import { COLORS, FONTS, FONT_SIZES } from "../../../lib/workbench/theme";

interface ParameterGaugeProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  warningHigh?: number;
  dangerHigh?: number;
  warningLow?: number;
  dangerLow?: number;
  format?: (v: number) => string;
}

export default function ParameterGauge({
  label,
  value,
  unit,
  min = 0,
  max = 100,
  warningHigh,
  dangerHigh,
  warningLow,
  dangerLow,
  format,
}: ParameterGaugeProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isDangerHigh = dangerHigh !== undefined && value >= dangerHigh;
  const isDangerLow = dangerLow !== undefined && value <= dangerLow;
  const isWarningHigh = !isDangerHigh && warningHigh !== undefined && value >= warningHigh;
  const isWarningLow = !isDangerLow && warningLow !== undefined && value <= warningLow;
  const isDanger = isDangerHigh || isDangerLow;
  const isWarning = isWarningHigh || isWarningLow;
  const color = isDanger ? COLORS.red : isWarning ? COLORS.amber : COLORS.emerald;
  const displayValue = format ? format(value) : value.toFixed(1);

  return (
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "3px",
        }}
      >
        <span
          style={{
            fontSize: FONT_SIZES.xs,
            color: COLORS.teal,
            letterSpacing: "1px",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: FONT_SIZES.lg,
            fontFamily: FONTS.mono,
            color,
            fontWeight: 700,
          }}
        >
          {displayValue} {unit}
        </span>
      </div>
      <div
        style={{
          height: "4px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "2px",
            transition: "width 0.15s, background 0.15s",
          }}
        />
      </div>
    </div>
  );
}
