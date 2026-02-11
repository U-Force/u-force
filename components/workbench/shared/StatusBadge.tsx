"use client";

import React from "react";

interface StatusBadgeProps {
  label: string;
  status: "normal" | "warning" | "danger" | "info" | "offline";
}

const STATUS_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  normal: { bg: "rgba(16, 185, 129, 0.15)", fg: "#10b981", border: "rgba(16, 185, 129, 0.4)" },
  warning: { bg: "rgba(245, 158, 11, 0.15)", fg: "#f59e0b", border: "rgba(245, 158, 11, 0.4)" },
  danger: { bg: "rgba(239, 68, 68, 0.15)", fg: "#ef4444", border: "rgba(239, 68, 68, 0.4)" },
  info: { bg: "rgba(59, 130, 246, 0.15)", fg: "#3b82f6", border: "rgba(59, 130, 246, 0.4)" },
  offline: { bg: "rgba(100, 116, 139, 0.15)", fg: "#64748b", border: "rgba(100, 116, 139, 0.4)" },
};

export default function StatusBadge({ label, status }: StatusBadgeProps) {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.5px",
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.fg,
          ...(status === "danger" ? { animation: "blink 1s infinite" } : {}),
        }}
      />
      {label}
    </span>
  );
}
