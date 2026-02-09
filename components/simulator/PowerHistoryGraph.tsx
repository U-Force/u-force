"use client";

import React from "react";
import type { HistoryPoint } from "../../hooks/useReactorSimulation";

interface PowerHistoryGraphProps {
  history: HistoryPoint[];
  historyLength: number;
  simTime: number;
  colorTheme?: "green" | "orange";
}

export default function PowerHistoryGraph({
  history,
  historyLength,
  simTime,
  colorTheme = "green",
}: PowerHistoryGraphProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>POWER HISTORY</span>
        <span style={styles.time}>{simTime.toFixed(1)}s</span>
      </div>
      <svg width="100%" height="80" style={styles.svg}>
        {/* Grid lines */}
        <line x1="0" y1="40" x2="100%" y2="40" stroke="#333" strokeDasharray="4" />
        <line x1="0" y1="20" x2="100%" y2="20" stroke="#222" strokeDasharray="2" />
        <line x1="0" y1="60" x2="100%" y2="60" stroke="#222" strokeDasharray="2" />

        {/* Power line */}
        <polyline
          fill="none"
          stroke="#ff9900"
          strokeWidth="2"
          points={history.map((p, i) => {
            const x = (i / historyLength) * 100;
            const y = 80 - Math.min(p.P * 80, 80);
            return `${x}%,${y}`;
          }).join(" ")}
        />

        {/* 100% reference line */}
        <line x1="0" y1="0" x2="100%" y2="0" stroke={styles.refLineColor} strokeWidth="1" opacity="0.3" />
      </svg>
      <div style={styles.labels}>
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const greenStyles = {
  container: {
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(20, 25, 30, 0.6)",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    padding: "6px 10px",
    background: "rgba(0, 255, 170, 0.05)",
    borderRadius: "6px",
  } as React.CSSProperties,
  title: {
    fontSize: "12px",
    letterSpacing: "0.5px",
    color: "#6ee7b7",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
  } as React.CSSProperties,
  time: {
    fontSize: "13px",
    color: "#10b981",
    fontFamily: "'Inter', sans-serif",
    textShadow: "none",
  } as React.CSSProperties,
  svg: {
    background: "rgba(20, 25, 30, 0.6)",
    border: "2px solid #1a1a1a",
    borderRadius: "6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  labels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#6ee7b7",
    marginTop: "8px",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
  refLineColor: "#10b981",
};

const orangeStyles = {
  container: {
    padding: "12px",
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
  title: {
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#888",
  } as React.CSSProperties,
  time: {
    fontSize: "12px",
    color: "#ff9900",
    fontFamily: "monospace",
  } as React.CSSProperties,
  svg: {
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "2px",
  } as React.CSSProperties,
  labels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "9px",
    color: "#555",
    marginTop: "4px",
  } as React.CSSProperties,
  refLineColor: "#00ff00",
};
