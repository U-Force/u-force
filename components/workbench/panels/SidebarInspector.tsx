"use client";

import React from "react";
import { X } from "lucide-react";
import { INSPECTOR_DATA } from "../../../lib/workbench/inspector-data";
import { ControlRodSlider, BoronControl, PumpScramControls, PressurizerControl, SteamDumpControl, FeedwaterControl } from "../../simulator";
import { COLORS, FONTS, FONT_SIZES, RADIUS } from "../../../lib/workbench/theme";
import type { ReactorState, ReactivityComponents } from "../../../lib/reactor/types";

interface SidebarInspectorProps {
  componentId: string;
  state: ReactorState | null;
  reactivity: ReactivityComponents | null;
  rodActual: number;
  onClose: () => void;
  // Control props
  rod: number;
  onRodChange: (v: number) => void;
  tripActive: boolean;
  boronConc: number;
  boronActual: number;
  onBoronChange: (v: number) => void;
  pumpOn: boolean;
  onPumpToggle: () => void;
  onScram: () => void;
  // Pressurizer
  pressurizerHeater: number;
  pressurizerHeaterActual: number;
  pressurizerSpray: number;
  pressurizerSprayActual: number;
  onHeaterChange: (v: number) => void;
  onSprayChange: (v: number) => void;
  // Steam dump
  steamDump: number;
  steamDumpActual: number;
  onSteamDumpChange: (v: number) => void;
  // Feedwater
  feedwaterFlow: number;
  feedwaterFlowActual: number;
  onFeedwaterChange: (v: number) => void;
}

export default function SidebarInspector({
  componentId,
  state,
  reactivity,
  rodActual,
  onClose,
  rod,
  onRodChange,
  tripActive,
  boronConc,
  boronActual,
  onBoronChange,
  pumpOn,
  onPumpToggle,
  onScram,
  pressurizerHeater,
  pressurizerHeaterActual,
  pressurizerSpray,
  pressurizerSprayActual,
  onHeaterChange,
  onSprayChange,
  steamDump,
  steamDumpActual,
  onSteamDumpChange,
  feedwaterFlow,
  feedwaterFlowActual,
  onFeedwaterChange,
}: SidebarInspectorProps) {
  const meta = INSPECTOR_DATA[componentId];
  if (!meta) return null;

  const getParamValue = (key: string): number => {
    if (!state) return 0;
    if (key === "rodActual") return rodActual;
    if (key === "rhoTotal") return reactivity?.rhoTotal ?? 0;
    if (key === "rhoExt") return reactivity?.rhoExt ?? 0;
    if (key === "Ppzr") return state.Ppzr;
    return (state as unknown as Record<string, number>)[key] ?? 0;
  };

  return (
    <div style={wrapper}>
      {/* Header */}
      <div style={header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={nameStyle}>{meta.name}</div>
          <div style={idStyle}>{meta.id.toUpperCase()}</div>
        </div>
        <button style={closeBtn} onClick={onClose}>
          <X size={12} />
        </button>
      </div>

      {/* Inline Controls — shown first so they're always visible */}
      {meta.controlCard && (
        <div style={controlSection}>
          <div style={sectionLabel}>CONTROLS</div>
          {meta.controlCard === "rod" && (
            <ControlRodSlider
              rod={rod}
              rodActual={rodActual}
              onRodChange={onRodChange}
              disabled={false}
              tripActive={tripActive}
              showActiveHint
              showScramHint
            />
          )}
          {meta.controlCard === "boron" && (
            <BoronControl
              boronConc={boronConc}
              boronActual={boronActual}
              onBoronChange={onBoronChange}
            />
          )}
          {meta.controlCard === "pump" && (
            <PumpScramControls
              pumpOn={pumpOn}
              tripActive={tripActive}
              onPumpToggle={onPumpToggle}
              onScram={onScram}
              scramDisabled={false}
            />
          )}
          {meta.controlCard === "pressurizer" && (
            <PressurizerControl
              pressure={state?.Ppzr ?? 15.5}
              heater={pressurizerHeater}
              heaterActual={pressurizerHeaterActual}
              spray={pressurizerSpray}
              sprayActual={pressurizerSprayActual}
              onHeaterChange={onHeaterChange}
              onSprayChange={onSprayChange}
            />
          )}
          {meta.controlCard === "steamDump" && (
            <SteamDumpControl
              steamDump={steamDump}
              steamDumpActual={steamDumpActual}
              onSteamDumpChange={onSteamDumpChange}
            />
          )}
          {meta.controlCard === "feedwater" && (
            <FeedwaterControl
              feedwaterFlow={feedwaterFlow}
              feedwaterFlowActual={feedwaterFlowActual}
              onFeedwaterChange={onFeedwaterChange}
            />
          )}
        </div>
      )}

      {/* Live Parameters */}
      {meta.parameters.length > 0 && (
        <div style={paramSection}>
          <div style={sectionLabel}>LIVE DATA</div>
          {meta.parameters.map((p) => {
            const val = getParamValue(p.key);
            const display = p.format ? p.format(val) : val.toFixed(1);
            return (
              <div key={p.key} style={paramRow}>
                <span style={paramLabelStyle}>{p.label}</span>
                <span style={paramValueStyle}>
                  {display} {p.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Description */}
      <div style={descStyle}>{meta.description}</div>

      {/* Educational Note */}
      {meta.educationalNote && (
        <div style={eduNote}>{meta.educationalNote}</div>
      )}
    </div>
  );
}

// ============================================================================
// Styles
// ============================================================================

const wrapper: React.CSSProperties = {
  padding: "10px",
  overflowY: "auto",
  borderTop: `1px solid ${COLORS.borderSubtle}`,
  flex: "1 1 0",
  minHeight: 0,
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "6px",
  marginBottom: "8px",
};

const nameStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  color: COLORS.emerald,
  lineHeight: 1.2,
};

const idStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  color: COLORS.slateDark,
  letterSpacing: "1px",
  marginTop: "2px",
};

const closeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: COLORS.slateDark,
  cursor: "pointer",
  padding: "2px",
  flexShrink: 0,
};

const descStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  lineHeight: 1.5,
  color: COLORS.slate,
  marginBottom: "8px",
};

const paramSection: React.CSSProperties = {
  marginBottom: "8px",
  padding: "6px 8px",
  background: COLORS.bgOverlay,
  borderRadius: RADIUS.md,
};

const sectionLabel: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  color: COLORS.teal,
  letterSpacing: "1.2px",
  fontWeight: 700,
  marginBottom: "4px",
};

const paramRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "2px 0",
};

const paramLabelStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.slate,
};

const paramValueStyle: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.emerald,
  fontFamily: FONTS.mono,
  fontWeight: 600,
};

const controlSection: React.CSSProperties = {
  marginBottom: "8px",
  padding: "8px",
  background: COLORS.bgOverlay,
  borderRadius: RADIUS.md,
  border: `1px solid ${COLORS.borderEmeraldLight}`,
};

const eduNote: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  lineHeight: 1.5,
  color: COLORS.teal,
  padding: "6px 8px",
  background: COLORS.emeraldBgLight,
  border: `1px solid ${COLORS.emeraldBgStrong}`,
  borderRadius: RADIUS.md,
  opacity: 0.85,
};
