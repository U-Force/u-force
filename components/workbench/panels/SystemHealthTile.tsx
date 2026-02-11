"use client";

import React from "react";

interface SystemHealthTileProps {
  name: string;
  status: "ok" | "degraded" | "failed" | "na";
}

const STATUS_MAP = {
  ok: { color: "#10b981", label: "OK", bg: "rgba(16, 185, 129, 0.1)" },
  degraded: { color: "#f59e0b", label: "DEGR", bg: "rgba(245, 158, 11, 0.1)" },
  failed: { color: "#ef4444", label: "FAIL", bg: "rgba(239, 68, 68, 0.1)" },
  na: { color: "#64748b", label: "N/A", bg: "rgba(100, 116, 139, 0.1)" },
};

export default function SystemHealthTile({ name, status }: SystemHealthTileProps) {
  const cfg = STATUS_MAP[status];

  return (
    <div
      style={{
        padding: "6px 8px",
        background: cfg.bg,
        borderRadius: "4px",
        border: `1px solid ${cfg.color}30`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: "9px",
          color: "#94a3b8",
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: "9px",
          color: cfg.color,
          fontWeight: 700,
          letterSpacing: "1px",
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}
