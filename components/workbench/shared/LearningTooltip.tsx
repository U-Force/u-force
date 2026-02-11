"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { COLORS, FONTS, FONT_SIZES, RADIUS, BLUR } from "../../../lib/workbench/theme";

interface LearningTooltipProps {
  /** Short title shown in the badge */
  title: string;
  /** Explanation text shown when expanded */
  description: string;
  /** Preferred position of the tooltip relative to the badge */
  position?: "top" | "bottom" | "left" | "right";
  /** Whether the tooltip is visible (controlled by learning mode) */
  visible: boolean;
}

const OFFSET = 8;

export default function LearningTooltip({
  title,
  description,
  position = "bottom",
  visible,
}: LearningTooltipProps) {
  const [expanded, setExpanded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const w = 260;

    let top = 0;
    let left = 0;

    if (position === "bottom") {
      top = rect.bottom + OFFSET;
      left = rect.left;
    } else if (position === "top") {
      top = rect.top - OFFSET;
      left = rect.left;
    } else if (position === "right") {
      top = rect.top;
      left = rect.right + OFFSET;
    } else {
      top = rect.top;
      left = rect.left - w - OFFSET;
    }

    // Clamp so it stays on screen
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (left < 8) left = 8;

    setPopupStyle({
      position: "fixed",
      top: position === "top" ? undefined : top,
      bottom: position === "top" ? window.innerHeight - rect.top + OFFSET : undefined,
      left,
      width: w,
    });
  }, [position]);

  useEffect(() => {
    if (!expanded) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [expanded, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  if (!visible) return null;

  return (
    <div style={wrapper}>
      <button
        ref={btnRef}
        onClick={() => setExpanded((v) => !v)}
        style={badge(expanded)}
        title={title}
      >
        <span style={iconStyle}>?</span>
        <span style={labelStyle}>{title}</span>
      </button>

      {expanded &&
        createPortal(
          <div style={{ ...tooltipBase, ...popupStyle }} onMouseDown={(e) => e.stopPropagation()}>
            <div style={tooltipHeader}>{title}</div>
            <div style={tooltipBody}>{description}</div>
          </div>,
          document.body
        )}
    </div>
  );
}

const wrapper: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  zIndex: 100,
  flexShrink: 0,
};

const badge = (expanded: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "2px 8px 2px 5px",
  background: expanded ? "rgba(59, 130, 246, 0.25)" : "rgba(59, 130, 246, 0.12)",
  border: `1px solid rgba(59, 130, 246, ${expanded ? 0.5 : 0.3})`,
  borderRadius: RADIUS.md,
  cursor: "pointer",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
});

const iconStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  background: "rgba(59, 130, 246, 0.3)",
  color: "#93c5fd",
  fontSize: "9px",
  fontWeight: 800,
  fontFamily: FONTS.sans,
  lineHeight: 1,
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  fontWeight: 600,
  color: "#93c5fd",
  letterSpacing: "0.3px",
  fontFamily: FONTS.sans,
};

const tooltipBase: React.CSSProperties = {
  zIndex: 9999,
  background: "rgba(10, 15, 25, 0.95)",
  border: "1px solid rgba(59, 130, 246, 0.3)",
  borderRadius: RADIUS.lg,
  backdropFilter: BLUR.lg,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
};

const tooltipHeader: React.CSSProperties = {
  padding: "8px 10px 6px",
  fontSize: FONT_SIZES.sm,
  fontWeight: 700,
  color: "#93c5fd",
  letterSpacing: "0.8px",
  borderBottom: "1px solid rgba(59, 130, 246, 0.15)",
  fontFamily: FONTS.sans,
};

const tooltipBody: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: FONT_SIZES.sm,
  color: COLORS.slateLight,
  lineHeight: "1.5",
  fontFamily: FONTS.sans,
};
