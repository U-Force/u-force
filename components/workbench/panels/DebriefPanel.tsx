"use client";

import React from "react";
import { Award, AlertTriangle, Clock, Target } from "lucide-react";
import type { TrainingScenario } from "../../../lib/training/types";

interface DebriefPanelProps {
  scenario: TrainingScenario;
  success: boolean;
  score: number;
  duration: number;
  tripCount: number;
  feedback: string[];
  onRestart: () => void;
  onDismiss: () => void;
}

export default function DebriefPanel({
  scenario,
  success,
  score,
  duration,
  tripCount,
  feedback,
  onRestart,
  onDismiss,
}: DebriefPanelProps) {
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);

  return (
    <div style={panel}>
      <div style={header}>
        <div style={headerTitle}>SCENARIO DEBRIEF</div>
        <div style={scenarioName}>{scenario.name}</div>
      </div>

      {/* Result Badge */}
      <div
        style={{
          ...resultBadge,
          background: success
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(239, 68, 68, 0.15)",
          borderColor: success ? "#10b981" : "#ef4444",
        }}
      >
        {success ? (
          <Award size={20} style={{ color: "#10b981" }} />
        ) : (
          <AlertTriangle size={20} style={{ color: "#ef4444" }} />
        )}
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: success ? "#10b981" : "#ef4444",
            }}
          >
            {success ? "SCENARIO PASSED" : "SCENARIO FAILED"}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Score: {score}/100
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={statsGrid}>
        <div style={statCard}>
          <Clock size={14} style={{ color: "#3b82f6" }} />
          <div>
            <div style={statLabel}>DURATION</div>
            <div style={statValue}>
              {mins}:{secs.toString().padStart(2, "0")}
            </div>
          </div>
        </div>
        <div style={statCard}>
          <Target size={14} style={{ color: "#10b981" }} />
          <div>
            <div style={statLabel}>SCORE</div>
            <div style={statValue}>{score}%</div>
          </div>
        </div>
        <div style={statCard}>
          <AlertTriangle
            size={14}
            style={{ color: tripCount > 0 ? "#ef4444" : "#10b981" }}
          />
          <div>
            <div style={statLabel}>TRIPS</div>
            <div style={statValue}>{tripCount}</div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div style={feedbackSection}>
          <div style={feedbackLabel}>FEEDBACK</div>
          {feedback.map((f, i) => (
            <div key={i} style={feedbackItem}>
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={actions}>
        <button style={restartBtn} onClick={onRestart}>
          RETRY SCENARIO
        </button>
        <button style={dismissBtn} onClick={onDismiss}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "rgba(10, 15, 20, 0.94)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  borderRadius: "8px",
  overflow: "hidden",
  maxWidth: "400px",
};

const header: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const headerTitle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "1.5px",
  color: "#6ee7b7",
  fontWeight: 700,
};

const scenarioName: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#e2e8f0",
  marginTop: "4px",
};

const resultBadge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  margin: "12px 14px",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "8px",
  padding: "0 14px",
  marginBottom: "12px",
};

const statCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px",
  background: "rgba(0,0,0,0.3)",
  borderRadius: "4px",
};

const statLabel: React.CSSProperties = {
  fontSize: "8px",
  color: "#64748b",
  letterSpacing: "1px",
  fontWeight: 700,
};

const statValue: React.CSSProperties = {
  fontSize: "14px",
  fontFamily: "'Share Tech Mono', monospace",
  fontWeight: 700,
  color: "#e2e8f0",
};

const feedbackSection: React.CSSProperties = {
  padding: "0 14px 12px",
};

const feedbackLabel: React.CSSProperties = {
  fontSize: "9px",
  color: "#6ee7b7",
  letterSpacing: "1.5px",
  fontWeight: 700,
  marginBottom: "6px",
};

const feedbackItem: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#94a3b8",
  padding: "4px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  padding: "10px 14px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const restartBtn: React.CSSProperties = {
  flex: 1,
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
