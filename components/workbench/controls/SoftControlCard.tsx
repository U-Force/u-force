"use client";

import React from "react";

interface SoftControlCardProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function SoftControlCard({
  title,
  children,
  onClose,
}: SoftControlCardProps) {
  return (
    <div style={overlay}>
      <div style={card}>
        <div style={header}>
          <span style={titleStyle}>{title}</span>
          <button style={closeBtn} onClick={onClose}>x</button>
        </div>
        <div style={body}>{children}</div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "absolute",
  bottom: "64px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 60,
};

const card: React.CSSProperties = {
  background: "rgba(10, 15, 20, 0.94)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  borderRadius: "8px",
  backdropFilter: "blur(16px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  minWidth: "280px",
  maxWidth: "360px",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1.5px",
  color: "#6ee7b7",
  fontFamily: "'Inter', sans-serif",
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "4px",
  color: "#94a3b8",
  cursor: "pointer",
  padding: "2px 8px",
  fontSize: "12px",
  fontWeight: 700,
};

const body: React.CSSProperties = {
  padding: "14px",
};
