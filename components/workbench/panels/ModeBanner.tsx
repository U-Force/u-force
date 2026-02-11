"use client";

import React from "react";
import type { PlantMode } from "../WorkbenchContext";

interface ModeBannerProps {
  mode: PlantMode;
  tripActive: boolean;
  tripReason: string | null;
}

const MODE_CONFIG: Record<PlantMode, { label: string; color: string; bg: string }> = {
  normal: { label: "NORMAL OPERATION", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  abnormal: { label: "ABNORMAL CONDITION", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  emergency: { label: "EMERGENCY", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
};

export default function ModeBanner({ mode, tripActive, tripReason }: ModeBannerProps) {
  const effectiveMode = tripActive ? "emergency" : mode;
  const cfg = MODE_CONFIG[effectiveMode];

  return (
    <div
      style={{
        padding: "6px 12px",
        background: cfg.bg,
        borderRadius: "4px",
        border: `1px solid ${cfg.color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...(tripActive ? { animation: "blink 1s infinite" } : {}),
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: cfg.color,
          ...(tripActive ? { animation: "blink 0.5s infinite" } : {}),
        }}
      />
      <span
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "1.5px",
          color: cfg.color,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {tripActive ? `REACTOR TRIP: ${tripReason}` : cfg.label}
      </span>
    </div>
  );
}
