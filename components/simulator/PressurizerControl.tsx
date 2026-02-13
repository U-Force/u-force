"use client";

import React from "react";

interface PressurizerControlProps {
  pressure: number;
  heater: number;
  heaterActual: number;
  spray: number;
  sprayActual: number;
  onHeaterChange: (value: number) => void;
  onSprayChange: (value: number) => void;
  disabled?: boolean;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function PressurizerControl({
  pressure,
  heater,
  heaterActual,
  spray,
  sprayActual,
  onHeaterChange,
  onSprayChange,
  disabled = false,
  colorTheme = "green",
  children,
}: PressurizerControlProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  const pressureColor =
    pressure > 16.5 || pressure < 12.0
      ? "#ef4444"
      : pressure > 16.0 || pressure < 13.0
        ? "#f59e0b"
        : "#10b981";

  return (
    <div style={controlGroup}>
      <div style={{ ...styles.pressureReadout, color: pressureColor }}>
        {pressure.toFixed(2)} MPa
      </div>

      <label style={styles.label}>
        HEATER DEMAND
        <span style={styles.labelValue}>{Math.round(heater * 100)}%</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={heater}
        onChange={(e) => onHeaterChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={styles.slider}
      />
      <div style={styles.actualDisplay}>
        ACTUAL: {Math.round(heaterActual * 100)}%
      </div>

      <label style={{ ...styles.label, marginTop: "12px" }}>
        SPRAY DEMAND
        <span style={styles.labelValue}>{Math.round(spray * 100)}%</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={spray}
        onChange={(e) => onSprayChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={styles.slider}
      />
      <div style={styles.actualDisplay}>
        ACTUAL: {Math.round(sprayActual * 100)}%
      </div>

      <div style={styles.helpText}>
        Heaters raise pressure · Spray lowers pressure
      </div>
      {children}
    </div>
  );
}

const controlGroup: React.CSSProperties = {
  marginBottom: "16px",
};

const greenStyles = {
  pressureReadout: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: "12px",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
  label: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    letterSpacing: "1.5px",
    color: "#6ee7b7",
    marginBottom: "8px",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
  } as React.CSSProperties,
  labelValue: {
    color: "#10b981",
    fontWeight: "bold",
    fontSize: "13px",
    textShadow: "none",
    fontFamily: "'Inter', sans-serif",
  } as React.CSSProperties,
  slider: {
    width: "100%",
    height: "8px",
    accentColor: "#10b981",
    background: "rgba(15, 20, 25, 0.5)",
    borderRadius: "6px",
    cursor: "pointer",
  } as React.CSSProperties,
  actualDisplay: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#10b981",
    fontWeight: "bold",
    letterSpacing: "1px",
    fontFamily: "'Inter', sans-serif",
    textShadow: "none",
  } as React.CSSProperties,
  helpText: {
    marginTop: "6px",
    fontSize: "9px",
    color: "#555",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "0.5px",
  } as React.CSSProperties,
};

const orangeStyles = {
  pressureReadout: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: "12px",
    letterSpacing: "1px",
  } as React.CSSProperties,
  label: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#ccc",
    marginBottom: "6px",
  } as React.CSSProperties,
  labelValue: {
    color: "#ff9900",
    fontWeight: "bold",
  } as React.CSSProperties,
  slider: {
    width: "100%",
    accentColor: "#ff9900",
  } as React.CSSProperties,
  actualDisplay: {
    marginTop: "4px",
    fontSize: "11px",
    color: "#ff9900",
    fontWeight: "bold",
    letterSpacing: "1px",
  } as React.CSSProperties,
  helpText: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#666",
  } as React.CSSProperties,
};
