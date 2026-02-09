"use client";

import React from "react";
import type { ReactivityComponents } from "../../lib/reactor";

interface ReactivityPanelProps {
  reactivity: ReactivityComponents | null;
  isActive?: boolean;
  colorTheme?: "green" | "orange";
  children?: React.ReactNode;
}

export default function ReactivityPanel({
  reactivity,
  isActive = true,
  colorTheme = "green",
  children,
}: ReactivityPanelProps) {
  const styles = colorTheme === "orange" ? orangeStyles : greenStyles;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.indicator(isActive)} />
        <span style={styles.title}>REACTIVITY</span>
      </div>
      <div style={styles.grid}>
        <div style={styles.row}>
          <span style={styles.label}>External (Rods)</span>
          <span style={styles.value}>{reactivity ? (reactivity.rhoExt * 1e5).toFixed(0) : 0} pcm</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Doppler (Fuel)</span>
          <span style={styles.value}>{reactivity ? (reactivity.rhoDoppler * 1e5).toFixed(0) : 0} pcm</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Moderator</span>
          <span style={styles.value}>{reactivity ? (reactivity.rhoMod * 1e5).toFixed(0) : 0} pcm</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Xenon-135</span>
          <span style={styles.value}>{reactivity ? (reactivity.rhoXenon * 1e5).toFixed(0) : 0} pcm</span>
        </div>
        <div style={styles.xenonNote}>
          <span style={{opacity: 0.6}}>⚡ Xenon dynamics accelerated 500× for simulation</span>
        </div>
        <div style={styles.totalRow}>
          <span style={styles.label}>TOTAL</span>
          <span style={styles.totalValue(reactivity?.rhoTotal || 0)}>
            {reactivity ? (reactivity.rhoTotal * 1e5).toFixed(0) : 0} pcm
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const greenStyles = {
  panel: {
    padding: "16px",
    borderRadius: "6px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    background: "rgba(20, 25, 30, 0.6)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    padding: "8px 12px",
    background: "rgba(15, 20, 25, 0.4)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    borderRadius: "6px",
  } as React.CSSProperties,
  indicator: (active: boolean): React.CSSProperties => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: active ? "#10b981" : "#374151",
    boxShadow: active ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
    border: active ? "2px solid #6ee7b7" : "2px solid #4b5563",
  }),
  title: {
    fontSize: "13px",
    letterSpacing: "0.5px",
    color: "#6ee7b7",
    fontWeight: "bold",
    fontFamily: "'Inter', sans-serif",
    textTransform: "none",
    flex: 1,
  } as React.CSSProperties,
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  } as React.CSSProperties,
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    padding: "6px 8px",
    background: "rgba(0, 255, 170, 0.03)",
    borderRadius: "6px",
  } as React.CSSProperties,
  xenonNote: {
    fontSize: "9px",
    color: "#6ee7b7",
    textAlign: "center",
    padding: "4px 8px",
    marginTop: "-4px",
    marginBottom: "4px",
    fontFamily: "'Inter', sans-serif",
    fontStyle: "italic",
  } as React.CSSProperties,
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "6px 8px",
    background: "rgba(0, 255, 170, 0.08)",
    borderRadius: "6px",
    borderTop: "2px solid #6ee7b7",
    paddingTop: "10px",
    marginTop: "8px",
  } as React.CSSProperties,
  label: {
    color: "#6ee7b7",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  } as React.CSSProperties,
  value: {
    color: "#10b981",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
    textShadow: "none",
  } as React.CSSProperties,
  totalValue: (rho: number): React.CSSProperties => ({
    color: rho > 0.0001 ? "#ffaa00" : rho < -0.0001 ? "#66aaff" : "#10b981",
    fontWeight: "bold",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    letterSpacing: "1px",
  }),
};

const orangeStyles = {
  panel: {
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #333",
    background: "rgba(0, 0, 0, 0.5)",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  } as React.CSSProperties,
  indicator: (active: boolean): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: active ? "#00ff00" : "#444",
    boxShadow: active ? "0 0 8px #00ff00" : "none",
  }),
  title: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#ff9900",
    fontWeight: "bold",
  } as React.CSSProperties,
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  } as React.CSSProperties,
  row: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  } as React.CSSProperties,
  xenonNote: {
    fontSize: "9px",
    color: "#888",
    textAlign: "center",
    padding: "4px 8px",
    marginTop: "2px",
    marginBottom: "4px",
    fontFamily: "monospace",
    fontStyle: "italic",
  } as React.CSSProperties,
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    borderTop: "1px solid #333",
    paddingTop: "6px",
    marginTop: "4px",
  } as React.CSSProperties,
  label: {
    color: "#888",
  } as React.CSSProperties,
  value: {
    color: "#ccc",
    fontFamily: "monospace",
  } as React.CSSProperties,
  totalValue: (rho: number): React.CSSProperties => ({
    color: rho > 0.0001 ? "#ffaa00" : rho < -0.0001 ? "#66aaff" : "#00ff00",
    fontWeight: "bold",
    fontFamily: "monospace",
  }),
};
