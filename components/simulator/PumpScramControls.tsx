"use client";

import React from "react";

interface PumpScramControlsProps {
  pumpOn: boolean;
  tripActive: boolean;
  onPumpToggle: () => void;
  onScram: () => void;
  pumpDisabled?: boolean;
  scramDisabled?: boolean;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function PumpScramControls({
  pumpOn,
  tripActive,
  onPumpToggle,
  onScram,
  pumpDisabled = false,
  scramDisabled = false,
  colorTheme = "green",
  children,
}: PumpScramControlsProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <>
      <div style={controlRow}>
        <button
          type="button"
          style={{ ...styles.toggleButton, ...(pumpOn ? styles.toggleButtonActive : {}) }}
          onClick={onPumpToggle}
          disabled={pumpDisabled}
        >
          <span style={styles.toggleLabel}>PRIMARY PUMP</span>
          <span style={pumpOn ? styles.statusOn : styles.statusOff}>{pumpOn ? "ON" : "OFF"}</span>
        </button>

        <button
          type="button"
          style={{ ...styles.scramButton, ...(tripActive ? styles.scramActive : {}) }}
          onClick={onScram}
          disabled={scramDisabled}
        >
          <span style={styles.toggleLabel}>SCRAM</span>
          <span style={tripActive ? styles.statusOff : styles.statusArmed}>
            {tripActive ? "FIRED" : "ARMED"}
          </span>
        </button>
      </div>
      {children}
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const controlRow: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  marginBottom: "16px",
};

const greenStyles = {
  toggleButton: {
    flex: 1,
    padding: "10px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(15, 20, 25, 0.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    minWidth: 0,
  } as React.CSSProperties,
  toggleButtonActive: {
    borderColor: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
  } as React.CSSProperties,
  scramButton: {
    flex: 1,
    padding: "10px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(15, 20, 25, 0.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    borderColor: "rgba(239, 68, 68, 0.3)",
    minWidth: 0,
  } as React.CSSProperties,
  scramActive: {
    borderColor: "#ef4444",
    background: "rgba(239, 68, 68, 0.2)",
  } as React.CSSProperties,
  toggleLabel: {
    fontSize: "9px",
    letterSpacing: "1px",
    color: "#6ee7b7",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
  } as React.CSSProperties,
  statusOn: {
    fontSize: "12px",
    color: "#10b981",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
  statusOff: {
    fontSize: "12px",
    color: "#ff5555",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
  statusArmed: {
    fontSize: "12px",
    color: "#ffaa00",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
};

const orangeStyles = {
  toggleButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #444",
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  } as React.CSSProperties,
  toggleButtonActive: {
    borderColor: "#ff9900",
    boxShadow: "0 0 10px rgba(255, 153, 0, 0.3)",
  } as React.CSSProperties,
  scramButton: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "4px",
    border: "1px solid #444",
    background: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderColor: "#aa0000",
  } as React.CSSProperties,
  scramActive: {
    borderColor: "#ff0000",
    boxShadow: "0 0 12px rgba(255, 0, 0, 0.5)",
  } as React.CSSProperties,
  toggleLabel: {
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#ccc",
  } as React.CSSProperties,
  statusOn: { fontSize: "12px", color: "#00ff00", fontWeight: "bold" } as React.CSSProperties,
  statusOff: { fontSize: "12px", color: "#ff5555", fontWeight: "bold" } as React.CSSProperties,
  statusArmed: { fontSize: "12px", color: "#ffaa00", fontWeight: "bold" } as React.CSSProperties,
};
