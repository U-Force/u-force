"use client";

import React from "react";

interface PowerDisplayProps {
  power: number;
  decayHeat?: number;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function PowerDisplay({
  power,
  decayHeat,
  colorTheme = "green",
  children,
}: PowerDisplayProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>REACTOR POWER</span>
        <span style={styles.status(power)}>
          {power > 105 ? "HIGH" : power < 50 ? "LOW" : "NOMINAL"}
        </span>
      </div>
      <div style={styles.valueContainer}>
        <span style={styles.value(power)}>{power.toFixed(1)}</span>
        <span style={styles.unit}>%</span>
      </div>
      <div style={styles.bar}>
        <div style={styles.barFill(power)} />
      </div>
      {decayHeat !== undefined && (
        <div style={styles.decayHeatRow}>
          <span style={styles.decayHeatLabel}>DECAY HEAT</span>
          <span style={styles.decayHeatValue}>{decayHeat.toFixed(2)}%</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const greenStyles = {
  container: {
    padding: "20px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(20, 25, 30, 0.6)",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    position: "relative",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    padding: "6px 10px",
    background: "rgba(0, 255, 170, 0.05)",
    borderRadius: "6px",
  } as React.CSSProperties,
  label: {
    fontSize: "12px",
    letterSpacing: "0.5px",
    color: "#6ee7b7",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
  } as React.CSSProperties,
  status: (power: number): React.CSSProperties => ({
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "1px",
    fontFamily: "'Inter', sans-serif",
    color: power > 105 ? "#ff0000" : power < 50 ? "#ffaa00" : "#10b981",
    animation: "none",
  }),
  valueContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    padding: "10px",
    background: "rgba(20, 25, 30, 0.6)",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    borderRadius: "6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  value: (power: number): React.CSSProperties => ({
    fontSize: "64px",
    fontWeight: "bold",
    color: power > 110 ? "#ff0000" : power > 105 ? "#ffaa00" : "#10b981",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.5px",
  }),
  unit: {
    fontSize: "28px",
    color: "#666",
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,
  bar: {
    height: "8px",
    background: "rgba(15, 20, 25, 0.5)",
    borderRadius: "6px",
    overflow: "hidden",
    marginTop: "8px",
  } as React.CSSProperties,
  barFill: (power: number): React.CSSProperties => ({
    height: "100%",
    width: `${Math.min(power, 120)}%`,
    background: power > 110 ? "#ff5555" : power > 105 ? "#ffaa00" : "#ff9900",
    transition: "width 0.1s, background 0.3s",
  }),
  decayHeatRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
    padding: "6px 10px",
    background: "rgba(255, 170, 0, 0.08)",
    borderRadius: "6px",
    border: "1px solid rgba(255, 170, 0, 0.15)",
  } as React.CSSProperties,
  decayHeatLabel: {
    fontSize: "10px",
    letterSpacing: "1px",
    color: "#ffaa00",
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,
  decayHeatValue: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#ffaa00",
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,
};

const orangeStyles = {
  container: {
    padding: "16px",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "rgba(0, 0, 0, 0.5)",
    marginBottom: "16px",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  } as React.CSSProperties,
  label: {
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#888",
  } as React.CSSProperties,
  status: (power: number): React.CSSProperties => ({
    fontSize: "11px",
    fontWeight: "bold",
    color: power > 105 ? "#ff5555" : power < 50 ? "#ffaa00" : "#00ff00",
  }),
  valueContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  } as React.CSSProperties,
  value: (power: number): React.CSSProperties => ({
    fontSize: "48px",
    fontWeight: "bold",
    color: power > 110 ? "#ff5555" : power > 105 ? "#ffaa00" : "#ff9900",
    fontFamily: "monospace",
  }),
  unit: {
    fontSize: "24px",
    color: "#666",
  } as React.CSSProperties,
  bar: {
    height: "8px",
    background: "#222",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  } as React.CSSProperties,
  barFill: (power: number): React.CSSProperties => ({
    height: "100%",
    width: `${Math.min(power, 120)}%`,
    background: power > 110 ? "#ff5555" : power > 105 ? "#ffaa00" : "#ff9900",
    transition: "width 0.1s, background 0.3s",
  }),
  decayHeatRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    padding: "4px 8px",
    background: "rgba(255, 153, 0, 0.1)",
    borderRadius: "4px",
  } as React.CSSProperties,
  decayHeatLabel: {
    fontSize: "10px",
    letterSpacing: "1px",
    color: "#ff9900",
  } as React.CSSProperties,
  decayHeatValue: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#ff9900",
    fontFamily: "monospace",
  } as React.CSSProperties,
};
