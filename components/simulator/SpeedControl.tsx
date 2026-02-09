"use client";

import React from "react";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  colorTheme?: "green" | "orange";
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 5, 10];

export default function SpeedControl({
  speed,
  onSpeedChange,
  colorTheme = "green",
}: SpeedControlProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={styles.container}>
      <span style={styles.label}>SPEED:</span>
      {SPEED_OPTIONS.map(s => (
        <button
          key={s}
          style={speedButton(speed === s)}
          onClick={() => onSpeedChange(s)}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const speedButton = (active: boolean): React.CSSProperties => ({
  padding: "4px 8px",
  borderRadius: "3px",
  fontSize: "11px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "none",
  background: active ? "#ff9900" : "rgba(0, 0, 0, 0.4)",
  color: active ? "#000" : "#888",
});

const greenStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  } as React.CSSProperties,
  label: {
    fontSize: "11px",
    color: "#888",
    letterSpacing: "1px",
  } as React.CSSProperties,
};

const orangeStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  } as React.CSSProperties,
  label: {
    fontSize: "11px",
    color: "#888",
    letterSpacing: "1px",
  } as React.CSSProperties,
};
