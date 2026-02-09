"use client";

import React from "react";

interface TemperatureMetricsProps {
  fuelTemp: number;
  coolantTemp: number;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function TemperatureMetrics({
  fuelTemp,
  coolantTemp,
  colorTheme = "green",
  children,
}: TemperatureMetricsProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.label}>FUEL TEMP</div>
          <div style={styles.value(fuelTemp > 1500)}>{fuelTemp.toFixed(0)} <span style={styles.unit}>K</span></div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>COOLANT TEMP</div>
          <div style={styles.value(coolantTemp > 600)}>{coolantTemp.toFixed(0)} <span style={styles.unit}>K</span></div>
        </div>
      </div>
      {children}
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const greenStyles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  } as React.CSSProperties,
  card: {
    padding: "14px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(20, 25, 30, 0.6)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  label: {
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#6ee7b7",
    marginBottom: "8px",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
  } as React.CSSProperties,
  value: (warning: boolean): React.CSSProperties => ({
    fontSize: "28px",
    fontWeight: "bold",
    color: warning ? "#ff0000" : "#10b981",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  }),
  unit: {
    fontSize: "14px",
    color: "#6ee7b7",
    marginLeft: "4px",
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,
};

const orangeStyles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  } as React.CSSProperties,
  card: {
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "rgba(0, 0, 0, 0.5)",
  } as React.CSSProperties,
  label: {
    fontSize: "10px",
    letterSpacing: "1px",
    color: "#888",
    marginBottom: "4px",
  } as React.CSSProperties,
  value: (warning: boolean): React.CSSProperties => ({
    fontSize: "24px",
    fontWeight: "bold",
    color: warning ? "#ff5555" : "#ff9900",
    fontFamily: "monospace",
  }),
  unit: {
    fontSize: "12px",
    color: "#666",
    marginLeft: "4px",
  } as React.CSSProperties,
};
