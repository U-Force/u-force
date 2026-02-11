"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Atom, BookOpen, Zap } from "lucide-react";
import type { TreeNodeData } from "../../../lib/workbench/system-tree";

interface TreeNodeProps {
  node: TreeNodeData;
  depth?: number;
  selectedId: string | null;
  onSelect: (node: TreeNodeData) => void;
}

export default function TreeNode({
  node,
  depth = 0,
  selectedId,
  onSelect,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const icon = node.trainingNode ? (
    <BookOpen size={12} style={{ color: "#f59e0b" }} />
  ) : node.scenarioIds ? (
    <Zap size={12} style={{ color: "#f59e0b" }} />
  ) : (
    <Atom size={12} style={{ color: "#6ee7b7" }} />
  );

  return (
    <div>
      <button
        style={{
          ...rowStyle,
          paddingLeft: `${8 + depth * 14}px`,
          background: isSelected ? "rgba(16, 185, 129, 0.12)" : "transparent",
          borderLeft: isSelected ? "2px solid #10b981" : "2px solid transparent",
        }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect(node);
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={12} style={{ color: "#64748b", flexShrink: 0 }} />
          ) : (
            <ChevronRight size={12} style={{ color: "#64748b", flexShrink: 0 }} />
          )
        ) : (
          <span style={{ width: 12, flexShrink: 0 }} />
        )}
        {icon}
        <span
          style={{
            fontSize: "11px",
            color: isSelected ? "#10b981" : "#cbd5e1",
            fontWeight: isSelected ? 700 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.label}
        </span>
      </button>
      {expanded &&
        hasChildren &&
        node.children!.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  width: "100%",
  padding: "5px 8px",
  background: "transparent",
  border: "none",
  borderRadius: "2px",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  textAlign: "left",
  transition: "background 0.1s",
};
