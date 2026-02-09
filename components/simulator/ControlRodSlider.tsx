"use client";

import React from "react";

interface ControlRodSliderProps {
  rod: number;
  rodActual: number;
  onRodChange: (value: number) => void;
  disabled?: boolean;
  tripActive: boolean;
  colorTheme?: "green" | "orange";
  showActiveHint?: boolean;
  showScramHint?: boolean;
  disabledMessage?: string;
  children?: React.ReactNode;
}

export default function ControlRodSlider({
  rod,
  rodActual,
  onRodChange,
  disabled = false,
  tripActive,
  colorTheme = "green",
  showActiveHint = false,
  showScramHint = false,
  disabledMessage,
  children,
}: ControlRodSliderProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={controlGroup}>
      <label style={styles.label}>
        CONTROL ROD TARGET
        <span style={styles.labelValue}>{Math.round(rod * 100)}%</span>
      </label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={rod}
        onChange={(e) => onRodChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={styles.slider}
      />
      <div style={styles.rodActualDisplay}>
        ACTUAL: {Math.round(rodActual * 100)}%
      </div>
      <div style={styles.helpText}>
        0% = fully inserted (subcritical) · 100% = fully withdrawn
      </div>
      {showActiveHint && !tripActive && !disabled && (
        <div style={styles.activeControlHint}>
          ✓ Adjustable during simulation
        </div>
      )}
      {showScramHint && tripActive && !disabled && (
        <div style={styles.warningText}>
          ⚠ SCRAM ACTIVE - Rods were inserted to 0% (still adjustable)
        </div>
      )}
      {disabledMessage && disabled && (
        <div style={styles.warningText}>
          ⚠ {disabledMessage}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

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
  rodActualDisplay: {
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
  activeControlHint: {
    marginTop: "6px",
    fontSize: "9px",
    color: "#10b981",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    textShadow: "none",
    letterSpacing: "1px",
  } as React.CSSProperties,
  warningText: {
    marginTop: "6px",
    fontSize: "9px",
    color: "#ff5555",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
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
  rodActualDisplay: {
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
  activeControlHint: {
    marginTop: "6px",
    fontSize: "9px",
    color: "#ff9900",
    fontWeight: "bold",
    letterSpacing: "1px",
  } as React.CSSProperties,
  warningText: {
    marginTop: "6px",
    fontSize: "9px",
    color: "#ff5555",
    fontWeight: "bold",
    letterSpacing: "1px",
  } as React.CSSProperties,
};
