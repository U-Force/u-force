"use client";

import React from "react";
import { Html } from "@react-three/drei";

interface HotspotMarkerProps {
  position: [number, number, number];
  label: string;
  componentId: string;
  onClick: (id: string) => void;
}

export default function HotspotMarker({
  position,
  label,
  componentId,
  onClick,
}: HotspotMarkerProps) {
  return (
    <Html position={position} center distanceFactor={20} zIndexRange={[10, 0]}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick(componentId);
        }}
        style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.5)",
          borderRadius: "12px",
          padding: "3px 10px",
          color: "#6ee7b7",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "'Inter', sans-serif",
          backdropFilter: "blur(4px)",
          transition: "all 0.15s",
          lineHeight: "16px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.35)";
          e.currentTarget.style.borderColor = "#10b981";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
          e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
        }}
      >
        {label}
      </button>
    </Html>
  );
}
