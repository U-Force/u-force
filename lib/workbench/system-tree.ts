/**
 * Plant structure tree data for the left navigation panel.
 * Organized by system category with minimal nesting.
 */

export interface TreeNodeData {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNodeData[];
  /** Component ID for 3D viewport selection */
  componentId?: string;
  /** Linked scenario IDs */
  scenarioIds?: string[];
  /** Whether this is a training-only node */
  trainingNode?: boolean;
}

export interface SystemCategory {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  nodes: TreeNodeData[];
}

export const SYSTEM_CATEGORIES: SystemCategory[] = [
  {
    id: "core",
    label: "Reactor Core",
    shortLabel: "Core",
    color: "#f59e0b",
    nodes: [
      { id: "reactor-vessel", label: "Reactor Vessel", componentId: "vessel" },
      { id: "control-rods", label: "Control Rods", componentId: "rods" },
      { id: "fuel-assemblies", label: "Fuel Assemblies", componentId: "core" },
    ],
  },
  {
    id: "coolant",
    label: "Coolant System",
    shortLabel: "RCS",
    color: "#3b82f6",
    nodes: [
      { id: "sg-1", label: "Steam Generator 1", componentId: "sg-1" },
      { id: "sg-2", label: "Steam Generator 2", componentId: "sg-2" },
      { id: "sg-3", label: "Steam Generator 3", componentId: "sg-3" },
      { id: "sg-4", label: "Steam Generator 4", componentId: "sg-4" },
      { id: "rcp-1", label: "RCP-1", componentId: "rcp-1" },
      { id: "rcp-2", label: "RCP-2", componentId: "rcp-2" },
      { id: "rcp-3", label: "RCP-3", componentId: "rcp-3" },
      { id: "rcp-4", label: "RCP-4", componentId: "rcp-4" },
      { id: "hot-leg", label: "Hot Legs", componentId: "hotleg" },
      { id: "cold-leg", label: "Cold Legs", componentId: "coldleg" },
      { id: "pressurizer", label: "Pressurizer", componentId: "pressurizer" },
    ],
  },
  {
    id: "secondary",
    label: "Secondary Side",
    shortLabel: "BOP",
    color: "#a855f7",
    nodes: [
      { id: "main-steam-lines", label: "Main Steam Lines", componentId: "hotleg" },
      { id: "hp-turbine", label: "HP Turbine", componentId: "hp-turbine" },
      { id: "msr", label: "Moisture Sep. Reheater", componentId: "msr" },
      { id: "lp-turbine", label: "LP Turbines", componentId: "lp-turbine" },
      { id: "generator", label: "Main Generator", componentId: "generator" },
      { id: "condenser", label: "Main Condenser", componentId: "condenser" },
      { id: "condensate-pump", label: "Condensate Pump", componentId: "condensate-pump" },
      { id: "feed-pump", label: "Main Feed Pump", componentId: "feed-pump" },
    ],
  },
  {
    id: "safety",
    label: "Safety & Containment",
    shortLabel: "Safety",
    color: "#ef4444",
    nodes: [
      { id: "containment", label: "Containment Building", componentId: "containment" },
    ],
  },
];

/** Legacy flat tree export for compatibility */
export const PLANT_TREE: TreeNodeData[] = SYSTEM_CATEGORIES.flatMap((cat) => cat.nodes);
