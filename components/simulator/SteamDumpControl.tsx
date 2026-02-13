"use client";

import React from "react";

interface SteamDumpControlProps {
  steamDump: number;
  steamDumpActual: number;
  onSteamDumpChange: (value: number) => void;
  disabled?: boolean;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function SteamDumpControl({
  steamDump,
  steamDumpActual,
  onSteamDumpChange,
  disabled = false,
  colorTheme = "green",
  children,
}: SteamDumpControlProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={controlGroup}>
      <label style={styles.label}>
        STEAM DUMP VALVE
        <span style={styles.labelValue}>{Math.round(steamDump * 100)}%</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={steamDump}
        onChange={(e) => onSteamDumpChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={styles.slider}
      />
      <div style={styles.actualDisplay}>
        ACTUAL: {Math.round(steamDumpActual * 100)}%
      </div>
      <div style={styles.helpText}>
        Opens bypass valves for extra heat rejection during transients
      </div>
      {children}
    </div>
  );
}

const controlGroup: React.CSSProperties = {
  marginBottom: "16px",
};

const greenStyles = {
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
