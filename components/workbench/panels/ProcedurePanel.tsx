"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import type { ProcedureStep } from "../../../lib/training/types";

interface ProcedurePanelProps {
  steps: ProcedureStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function ProcedurePanel({
  steps,
  currentStep,
  onStepClick,
}: ProcedurePanelProps) {
  return (
    <div style={container}>
      <div style={header}>PROCEDURE CHECKLIST</div>
      <div style={list}>
        {steps.map((step) => {
          const isComplete = step.step < currentStep;
          const isCurrent = step.step === currentStep;

          return (
            <button
              key={step.step}
              style={{
                ...stepRow,
                background: isCurrent ? "rgba(16, 185, 129, 0.08)" : "transparent",
                borderLeft: isCurrent
                  ? "2px solid #10b981"
                  : isComplete
                  ? "2px solid rgba(16, 185, 129, 0.3)"
                  : "2px solid transparent",
              }}
              onClick={() => onStepClick(step.step)}
            >
              {isComplete ? (
                <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0 }} />
              ) : (
                <Circle
                  size={14}
                  style={{
                    color: isCurrent ? "#10b981" : "#475569",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "11px",
                  color: isComplete ? "#6ee7b7" : isCurrent ? "#e2e8f0" : "#94a3b8",
                  textDecoration: isComplete ? "line-through" : "none",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
              >
                {step.instruction}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const header: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "1.5px",
  color: "#6ee7b7",
  fontWeight: 700,
  padding: "8px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  padding: "4px 0",
  maxHeight: "200px",
  overflowY: "auto",
};

const stepRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  padding: "6px 12px",
  border: "none",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  width: "100%",
  transition: "background 0.1s",
};
