/**
 * Plant structure tree data for the left navigation panel.
 * Maps PWR systems into an expandable tree hierarchy.
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

export const PLANT_TREE: TreeNodeData[] = [
  {
    id: "reactor",
    label: "Reactor",
    children: [
      {
        id: "reactor-vessel",
        label: "Reactor Vessel",
        componentId: "vessel",
      },
      {
        id: "reactor-core",
        label: "Core Region",
        componentId: "core",
        children: [
          {
            id: "control-rods",
            label: "Control Rod Assemblies",
            componentId: "rods",
          },
          {
            id: "fuel-assemblies",
            label: "Fuel Assemblies",
            componentId: "core",
          },
        ],
      },
    ],
  },
  {
    id: "rcs",
    label: "Reactor Coolant System",
    children: [
      {
        id: "rcs-loops",
        label: "Primary Loops",
        children: [
          { id: "loop-1", label: "Loop 1 (SG-1 / RCP-1)", children: [
            { id: "sg-1", label: "Steam Generator 1", componentId: "sg-1" },
            { id: "rcp-1", label: "RCP-1", componentId: "rcp-1" },
          ]},
          { id: "loop-2", label: "Loop 2 (SG-2 / RCP-2)", children: [
            { id: "sg-2", label: "Steam Generator 2", componentId: "sg-2" },
            { id: "rcp-2", label: "RCP-2", componentId: "rcp-2" },
          ]},
          { id: "loop-3", label: "Loop 3 (SG-3 / RCP-3)", children: [
            { id: "sg-3", label: "Steam Generator 3", componentId: "sg-3" },
            { id: "rcp-3", label: "RCP-3", componentId: "rcp-3" },
          ]},
          { id: "loop-4", label: "Loop 4 (SG-4 / RCP-4)", children: [
            { id: "sg-4", label: "Steam Generator 4", componentId: "sg-4" },
            { id: "rcp-4", label: "RCP-4", componentId: "rcp-4" },
          ]},
        ],
      },
      {
        id: "hot-leg",
        label: "Hot Legs",
        componentId: "hotleg",
      },
      {
        id: "cold-leg",
        label: "Cold Legs",
        componentId: "coldleg",
      },
      {
        id: "pressurizer",
        label: "Pressurizer",
        componentId: "pressurizer",
      },
    ],
  },
  {
    id: "secondary",
    label: "Secondary System",
    children: [
      {
        id: "steam-supply",
        label: "Steam Supply",
        children: [
          { id: "main-steam-lines", label: "Main Steam Lines", componentId: "hotleg" },
        ],
      },
      {
        id: "turbine-island",
        label: "Turbine Island",
        children: [
          { id: "hp-turbine", label: "HP Turbine", componentId: "hp-turbine" },
          { id: "msr", label: "Moisture Separator Reheater", componentId: "msr" },
          { id: "lp-turbine", label: "LP Turbines (2)", componentId: "lp-turbine" },
        ],
      },
      {
        id: "generator",
        label: "Main Generator",
        componentId: "generator",
      },
      {
        id: "condenser",
        label: "Main Condenser",
        componentId: "condenser",
      },
      {
        id: "feedwater-system",
        label: "Feedwater System",
        children: [
          { id: "condensate-pump", label: "Condensate Pump", componentId: "condensate-pump" },
          { id: "feed-pump", label: "Main Feed Pump", componentId: "feed-pump" },
          { id: "feedwater-lines", label: "Feedwater Lines" },
        ],
      },
    ],
  },
  {
    id: "containment",
    label: "Containment",
    componentId: "containment",
  },
];
