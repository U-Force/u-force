"use client";

import React from "react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}

export default function ToolButton({
  icon,
  label,
  active = false,
  onClick,
  variant = "default",
}: ToolButtonProps) {
  const bg = active
    ? variant === "danger"
      ? "rgba(239, 68, 68, 0.25)"
      : "rgba(16, 185, 129, 0.2)"
    : "transparent";

  const border = active
    ? variant === "danger"
      ? "1px solid rgba(239, 68, 68, 0.5)"
      : "1px solid rgba(16, 185, 129, 0.4)"
    : "1px solid rgba(255, 255, 255, 0.08)";

  const color = active
    ? variant === "danger"
      ? "#ef4444"
      : "#10b981"
    : "#94a3b8";

  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "5px 10px",
        background: bg,
        border,
        borderRadius: "4px",
        color,
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        transition: "all 0.15s",
        letterSpacing: "0.3px",
      }}
    >
      <span style={{ fontSize: "14px", lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
