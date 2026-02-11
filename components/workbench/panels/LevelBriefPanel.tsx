"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import LevelBriefTabs from "./LevelBriefTabs";
import type { TrainingScenario } from "../../../lib/training/types";

interface LevelBriefPanelProps {
  scenario: TrainingScenario;
  onStart: () => void;
  onDismiss: () => void;
}

const DIFFICULTY_LABELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];
const DIFFICULTY_COLORS = ["", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function LevelBriefPanel({
  scenario,
  onStart,
  onDismiss,
}: LevelBriefPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={panel}>
      {/* Header */}
      <button
        style={header}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div style={title}>{scenario.name}</div>
          <div style={meta}>
            <span
              style={{
                color: DIFFICULTY_COLORS[scenario.difficulty],
                fontWeight: 700,
              }}
            >
              {DIFFICULTY_LABELS[scenario.difficulty]}
            </span>
            <span style={{ color: "#64748b" }}>
              ~{scenario.estimatedDuration} min
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={14} style={{ color: "#64748b" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "#64748b" }} />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <>
          <div style={desc}>{scenario.description}</div>
          <LevelBriefTabs scenario={scenario} />

          {/* Actions */}
          <div style={actions}>
            <button style={startBtn} onClick={onStart}>
              <Play size={12} /> START SCENARIO
            </button>
            <button style={dismissBtn} onClick={onDismiss}>
              DISMISS
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "rgba(10, 15, 20, 0.92)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  borderRadius: "8px",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: "10px 12px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "'Inter', sans-serif",
};

const title: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#10b981",
  marginBottom: "2px",
};

const meta: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  fontSize: "10px",
};

const desc: React.CSSProperties = {
  padding: "0 12px 8px",
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#94a3b8",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  padding: "8px 12px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const startBtn: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px",
  background: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.4)",
  borderRadius: "4px",
  color: "#10b981",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  cursor: "pointer",
};

const dismissBtn: React.CSSProperties = {
  padding: "8px 12px",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
};
