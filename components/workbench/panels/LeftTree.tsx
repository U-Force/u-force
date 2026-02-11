"use client";

import React from "react";
import TreeNode from "./TreeNode";
import { PLANT_TREE, type TreeNodeData } from "../../../lib/workbench/system-tree";
import { SCENARIOS, getScenarioById } from "../../../lib/training";
import type { TrainingScenario } from "../../../lib/training/types";

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
  const handleNodeSelect = (node: TreeNodeData) => {
    // If it has a componentId, select in 3D viewport
    if (node.componentId) {
      onSelectComponent(node.componentId);
    }
    // If it has scenarioIds, show first scenario brief
    if (node.scenarioIds && node.scenarioIds.length > 0) {
      const scenario = getScenarioById(node.scenarioIds[0]);
      if (scenario) {
        onSelectScenario(scenario);
        return;
      }
    }
  };

  return (
    <div style={container}>
      <div style={header}>
        <span style={headerTitle}>PLANT STRUCTURE</span>
      </div>
      <div style={treeContainer}>
        {PLANT_TREE.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedNodeId}
            onSelect={handleNodeSelect}
          />
        ))}
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const headerTitle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "1.5px",
  color: "#6ee7b7",
  fontWeight: 700,
  fontFamily: "'Inter', sans-serif",
};

const treeContainer: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "4px 0",
};
