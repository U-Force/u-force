"use client";

import React, { useState } from "react";
import { Atom } from "lucide-react";
import { SYSTEM_CATEGORIES, type TreeNodeData } from "../../../lib/workbench/system-tree";
import { getScenarioById } from "../../../lib/training";
import type { TrainingScenario } from "../../../lib/training/types";
import { COLORS, FONT_SIZES, RADIUS } from "../../../lib/workbench/theme";

interface LeftTreeProps {
  selectedNodeId: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectScenario: (scenario: TrainingScenario) => void;
}

export default function LeftTree({
  selectedNodeId,
  onSelectComponent,
  onSelectScenario,
}: LeftTreeProps) {
  const [activeCategory, setActiveCategory] = useState<string>("core");

  const handleNodeSelect = (node: TreeNodeData) => {
    if (node.componentId) {
      onSelectComponent(node.componentId);
    }
    if (node.scenarioIds && node.scenarioIds.length > 0) {
      const scenario = getScenarioById(node.scenarioIds[0]);
      if (scenario) {
        onSelectScenario(scenario);
      }
    }
  };

  const currentCategory = SYSTEM_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div style={container}>
      <div style={header}>
        <span style={headerTitle}>PLANT STRUCTURE</span>
      </div>

      {/* Category Tabs */}
      <div style={tabBar}>
        {SYSTEM_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            style={tabBtn(cat.id === activeCategory, cat.color)}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.shortLabel}
          </button>
        ))}
      </div>

      {/* Category Label */}
      {currentCategory && (
        <div style={categoryLabel(currentCategory.color)}>
          {currentCategory.label}
        </div>
      )}

      {/* Component List */}
      <div style={listContainer}>
        {currentCategory?.nodes.map((node) => {
          const isSelected = selectedNodeId === node.componentId;
          return (
            <button
              key={node.id}
              style={itemBtn(isSelected, currentCategory.color)}
              onClick={() => handleNodeSelect(node)}
            >
              <Atom size={11} style={{ color: isSelected ? currentCategory.color : COLORS.slateDark, flexShrink: 0 }} />
              <span style={itemLabel(isSelected)}>{node.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  padding: "10px 12px 6px",
};

const headerTitle: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  letterSpacing: "1.5px",
  color: COLORS.teal,
  fontWeight: 700,
};

const tabBar: React.CSSProperties = {
  display: "flex",
  gap: "3px",
  padding: "0 8px 8px",
};

const tabBtn = (active: boolean, color: string): React.CSSProperties => ({
  flex: 1,
  padding: "4px 0",
  fontSize: "9px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  fontFamily: "'Inter', sans-serif",
  textAlign: "center",
  cursor: "pointer",
  border: `1px solid ${active ? `${color}50` : COLORS.borderSubtle}`,
  borderRadius: RADIUS.md,
  background: active ? `${color}18` : "transparent",
  color: active ? color : COLORS.slateDark,
  transition: "all 0.12s",
});

const categoryLabel = (color: string): React.CSSProperties => ({
  fontSize: "8px",
  fontWeight: 700,
  letterSpacing: "1.2px",
  color,
  padding: "0 12px 6px",
  opacity: 0.7,
});

const listContainer: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "0 6px",
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const itemBtn = (selected: boolean, color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "6px 10px",
  background: selected ? `${color}12` : "transparent",
  border: "none",
  borderLeft: selected ? `2px solid ${color}` : "2px solid transparent",
  borderRadius: RADIUS.sm,
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  textAlign: "left",
  transition: "all 0.1s",
});

const itemLabel = (selected: boolean): React.CSSProperties => ({
  fontSize: FONT_SIZES.md,
  color: selected ? COLORS.white : COLORS.slateLight,
  fontWeight: selected ? 600 : 400,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
