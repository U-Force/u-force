"use client";

import React from "react";

interface SimControlBarProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset?: () => void;
  colorTheme?: "green" | "orange";
}

export default function SimControlBar({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  colorTheme = "green",
}: SimControlBarProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={simControls}>
      {!isRunning ? (
        <button style={styles.startButton} onClick={onStart}>▶ START</button>
      ) : isPaused ? (
        <button style={styles.startButton} onClick={onResume}>▶ RESUME</button>
      ) : (
        <button style={styles.pauseButton} onClick={onPause}>⏸ PAUSE</button>
      )}
      <button style={styles.stopButton} onClick={onStop} disabled={!isRunning}>⏹ STOP</button>
      {onReset && (
        <button style={styles.resetButton} onClick={onReset}>↺ RESET</button>
      )}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const simControls: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "12px",
};

const greenButtonBase: React.CSSProperties = {
  flex: 1,
  padding: "12px 8px",
  borderRadius: "3px",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "1.5px",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  textTransform: "none",
  transition: "all 0.15s",
  position: "relative",
  boxShadow: "0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
};

const greenStyles = {
  startButton: {
    ...greenButtonBase,
    background: "#10b981",
    color: "#000",
    border: "1px solid #6ee7b7",
  } as React.CSSProperties,
  pauseButton: {
    ...greenButtonBase,
    background: "#f59e0b",
    color: "#000",
    border: "1px solid #fbbf24",
  } as React.CSSProperties,
  stopButton: {
    ...greenButtonBase,
    background: "#64748b",
    color: "#fff",
    border: "1px solid #94a3b8",
  } as React.CSSProperties,
  resetButton: {
    ...greenButtonBase,
    background: "#64748b",
    color: "#fff",
    border: "1px solid #94a3b8",
  } as React.CSSProperties,
};

const orangeButtonBase: React.CSSProperties = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1px",
  cursor: "pointer",
};

const orangeStyles = {
  startButton: {
    ...orangeButtonBase,
    background: "linear-gradient(135deg, #3d2200, #554400)",
    color: "#ff9900",
    border: "1px solid #ff9900",
  } as React.CSSProperties,
  pauseButton: {
    ...orangeButtonBase,
    background: "linear-gradient(135deg, #3d3d00, #555500)",
    color: "#ffaa00",
    border: "1px solid #ffaa00",
  } as React.CSSProperties,
  stopButton: {
    ...orangeButtonBase,
    background: "rgba(0, 0, 0, 0.4)",
    color: "#888",
    border: "1px solid #444",
  } as React.CSSProperties,
  resetButton: {
    ...orangeButtonBase,
    background: "rgba(0, 0, 0, 0.4)",
    color: "#888",
    border: "1px solid #444",
  } as React.CSSProperties,
};
