"use client";

import React from "react";
import type { Alarm } from "../WorkbenchContext";

interface AlarmListProps {
  alarms: Alarm[];
  onAcknowledge: (id: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#eab308",
  low: "#3b82f6",
};

export default function AlarmList({ alarms, onAcknowledge }: AlarmListProps) {
  if (alarms.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ color: "#10b981", fontSize: "11px" }}>NO ACTIVE ALARMS</span>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={headerStyle}>
        ALARMS ({alarms.filter((a) => !a.acknowledged).length} ACTIVE)
      </div>
      {alarms.map((alarm) => {
        const color = PRIORITY_COLORS[alarm.priority];
        return (
          <div
            key={alarm.id}
            style={{
              ...alarmRow,
              borderLeft: `3px solid ${color}`,
              opacity: alarm.acknowledged ? 0.5 : 1,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color,
                  letterSpacing: "0.5px",
                  ...(!alarm.acknowledged && alarm.priority === "critical"
                    ? { animation: "blink 1s infinite" }
                    : {}),
                }}
              >
                {alarm.message}
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
                {alarm.parameter} = {alarm.value.toFixed(1)} (limit: {alarm.limit})
              </div>
            </div>
            {!alarm.acknowledged && (
              <button style={ackBtn} onClick={() => onAcknowledge(alarm.id)}>
                ACK
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const headerStyle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "1.5px",
  color: "#f59e0b",
  fontWeight: 700,
  paddingBottom: "4px",
  borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
};

const alarmRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 8px",
  background: "rgba(0,0,0,0.3)",
  borderRadius: "4px",
};

const ackBtn: React.CSSProperties = {
  padding: "2px 8px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "3px",
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "1px",
};

const emptyStyle: React.CSSProperties = {
  padding: "8px",
  textAlign: "center",
  background: "rgba(16, 185, 129, 0.05)",
  borderRadius: "4px",
  border: "1px solid rgba(16, 185, 129, 0.15)",
};
