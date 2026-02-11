"use client";

import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: "default" | "dark" | "accent";
  noPadding?: boolean;
}

export default function GlassPanel({
  children,
  style,
  variant = "default",
  noPadding = false,
}: GlassPanelProps) {
  const bg =
    variant === "dark"
      ? "rgba(5, 10, 15, 0.85)"
      : variant === "accent"
      ? "rgba(16, 185, 129, 0.08)"
      : "rgba(12, 17, 23, 0.75)";

  const border =
    variant === "accent"
      ? "1px solid rgba(16, 185, 129, 0.4)"
      : "1px solid rgba(255, 255, 255, 0.06)";

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: "8px",
        backdropFilter: "blur(12px)",
        padding: noPadding ? 0 : "12px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
