"use client";

import React from "react";
import { INSPECTOR_DATA } from "../../../lib/workbench/inspector-data";
import type { ReactorState, ReactivityComponents } from "../../../lib/reactor/types";

interface InspectorCardProps {
  componentId: string;
  state: ReactorState | null;
  reactivity: ReactivityComponents | null;
  rodActual: number;
  onClose: () => void;
  onOpenControl: (card: string) => void;
}

export default function InspectorCard({
  componentId,
  state,
  reactivity,
  rodActual,
  onClose,
  onOpenControl,
}: InspectorCardProps) {
  const meta = INSPECTOR_DATA[componentId];
  if (!meta) return null;

  const getParamValue = (key: string): number => {
    if (!state) return 0;
    if (key === "rodActual") return rodActual;
    if (key === "rhoTotal") return reactivity?.rhoTotal ?? 0;
    if (key === "rhoExt") return reactivity?.rhoExt ?? 0;
    return (state as unknown as Record<string, number>)[key] ?? 0;
  };

  return (
    <div style={card}>
      {/* Header */}
      <div style={header}>
        <div>
          <div style={nameStyle}>{meta.name}</div>
          <div style={idStyle}>{meta.id.toUpperCase()}</div>
        </div>
        <button style={closeBtn} onClick={onClose}>
          x
        </button>
      </div>

      {/* Description */}
      <div style={descStyle}>{meta.description}</div>

      {/* Live Parameters */}
      {meta.parameters.length > 0 && (
        <div style={paramSection}>
          <div style={sectionLabel}>LIVE DATA</div>
          {meta.parameters.map((p) => {
            const val = getParamValue(p.key);
            const display = p.format ? p.format(val) : val.toFixed(1);
            return (
              <div key={p.key} style={paramRow}>
                <span style={paramLabel}>{p.label}</span>
                <span style={paramValue}>
                  {display} {p.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Educational Note */}
      {meta.educationalNote && (
        <div style={eduNote}>{meta.educationalNote}</div>
      )}

      {/* Control Card Button */}
      {meta.controlCard && (
        <button
          style={controlBtn}
          onClick={() => onOpenControl(meta.controlCard!)}
        >
          OPEN CONTROLS
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Styles
// ============================================================================

const card: React.CSSProperties = {
  position: "absolute",
  top: "80px",
  right: "16px",
  width: "300px",
  background: "rgba(10, 15, 20, 0.92)",
  border: "1px solid rgba(16, 185, 129, 0.35)",
  borderRadius: "8px",
  padding: "16px",
  backdropFilter: "blur(12px)",
  zIndex: 50,
  color: "#e2e8f0",
  fontFamily: "'Inter', sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "12px",
};

const nameStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#10b981",
};

const idStyle: React.CSSProperties = {
  fontSize: "9px",
  color: "#6ee7b7",
  letterSpacing: "1px",
  marginTop: "2px",
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "4px",
  color: "#94a3b8",
  cursor: "pointer",
  padding: "2px 8px",
  fontSize: "12px",
  fontWeight: 700,
};

const descStyle: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#94a3b8",
  marginBottom: "12px",
};

const paramSection: React.CSSProperties = {
  marginBottom: "12px",
  padding: "8px",
  background: "rgba(0,0,0,0.3)",
  borderRadius: "4px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "9px",
  color: "#6ee7b7",
  letterSpacing: "1.5px",
  fontWeight: 700,
  marginBottom: "6px",
};

const paramRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "3px 0",
};

const paramLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
};

const paramValue: React.CSSProperties = {
  fontSize: "12px",
  fontFamily: "'Share Tech Mono', monospace",
  fontWeight: 700,
  color: "#10b981",
};

const eduNote: React.CSSProperties = {
  fontSize: "10px",
  lineHeight: 1.5,
  color: "#6ee7b7",
  padding: "8px",
  background: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "4px",
  marginBottom: "12px",
};

const controlBtn: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  background: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.4)",
  borderRadius: "4px",
  color: "#10b981",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
};
