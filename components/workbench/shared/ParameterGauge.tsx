"use client";

import React from "react";

interface ParameterGaugeProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  warningHigh?: number;
  dangerHigh?: number;
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
  format,
}: ParameterGaugeProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const isDanger = dangerHigh !== undefined && value >= dangerHigh;
  const isWarning = !isDanger && warningHigh !== undefined && value >= warningHigh;
  const color = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
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
            fontSize: "9px",
            color: "#6ee7b7",
            letterSpacing: "1px",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontFamily: "'Share Tech Mono', monospace",
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
