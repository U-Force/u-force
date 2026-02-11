"use client";

import React, { useState } from "react";
import type { TrainingScenario } from "../../../lib/training/types";

interface LevelBriefTabsProps {
  scenario: TrainingScenario;
}

type TabId = "brief" | "goals" | "hints" | "procedure";

export default function LevelBriefTabs({ scenario }: LevelBriefTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("brief");

  const tabs: { id: TabId; label: string }[] = [
    { id: "brief", label: "BRIEFING" },
    { id: "goals", label: "GOALS" },
    { id: "hints", label: "HINTS" },
    ...(scenario.proceduralGuidance
      ? [{ id: "procedure" as TabId, label: "PROCEDURE" }]
      : []),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={tabBtn(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={content}>
        {activeTab === "brief" && (
          <pre style={briefText}>{scenario.briefing}</pre>
        )}

        {activeTab === "goals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scenario.objectives.map((obj) => (
              <div key={obj.id} style={goalCard}>
                <div style={goalTitle}>{obj.description}</div>
                {obj.assessmentCriteria.map((c, i) => (
                  <div key={i} style={criteriaRow}>
                    <span style={criteriaLabel}>{c.metric}</span>
                    <span style={criteriaValue}>
                      {c.target} {c.unit}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "hints" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(scenario.hints ?? []).map((hint) => (
              <div
                key={hint.triggerId}
                style={{
                  ...hintCard,
                  borderLeft: `3px solid ${
                    hint.priority === "critical"
                      ? "#ef4444"
                      : hint.priority === "warning"
                      ? "#f59e0b"
                      : "#3b82f6"
                  }`,
                }}
              >
                {hint.content}
              </div>
            ))}
            {(!scenario.hints || scenario.hints.length === 0) && (
              <div style={{ fontSize: "11px", color: "#64748b" }}>No hints available.</div>
            )}
          </div>
        )}

        {activeTab === "procedure" && scenario.proceduralGuidance && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {scenario.proceduralGuidance.map((step) => (
              <div key={step.step} style={stepRow}>
                <span style={stepNum}>{step.step}</span>
                <span style={stepText}>{step.instruction}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const tabBar: React.CSSProperties = {
  display: "flex",
  gap: "2px",
  padding: "0 8px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  background: active ? "rgba(16, 185, 129, 0.1)" : "transparent",
  border: "none",
  borderBottom: active ? "2px solid #10b981" : "2px solid transparent",
  color: active ? "#10b981" : "#64748b",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "1px",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
});

const content: React.CSSProperties = {
  padding: "10px 12px",
  maxHeight: "200px",
  overflowY: "auto",
};

const briefText: React.CSSProperties = {
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#94a3b8",
  fontFamily: "'Inter', sans-serif",
  whiteSpace: "pre-wrap",
  margin: 0,
};

const goalCard: React.CSSProperties = {
  padding: "8px",
  background: "rgba(0,0,0,0.2)",
  borderRadius: "4px",
};

const goalTitle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#e2e8f0",
  marginBottom: "4px",
};

const criteriaRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "10px",
  padding: "2px 0",
};

const criteriaLabel: React.CSSProperties = { color: "#94a3b8" };
const criteriaValue: React.CSSProperties = {
  color: "#10b981",
  fontFamily: "'Share Tech Mono', monospace",
  fontWeight: 700,
};

const hintCard: React.CSSProperties = {
  padding: "6px 10px",
  background: "rgba(0,0,0,0.2)",
  borderRadius: "4px",
  fontSize: "10px",
  lineHeight: 1.5,
  color: "#94a3b8",
};

const stepRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  padding: "4px 0",
  alignItems: "flex-start",
};

const stepNum: React.CSSProperties = {
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "rgba(16, 185, 129, 0.15)",
  color: "#10b981",
  fontSize: "10px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const stepText: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
  lineHeight: 1.4,
};
