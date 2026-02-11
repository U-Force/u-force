/**
 * Learning mode content for contextual tooltips.
 * Each entry maps to a UI region or feature in the workbench.
 */

export interface LearningEntry {
  title: string;
  description: string;
}

// ============================================================================
// Toolbar
// ============================================================================

export const TOOLBAR_HELP: Record<string, LearningEntry> = {
  toolMode: {
    title: "Interaction Tools",
    description:
      "Select: Click reactor components to inspect them. Pan: Drag to move the viewport. Orbit: Drag to rotate around the 3D model.",
  },
  viewMode: {
    title: "View Modes",
    description:
      "Normal: Standard 3D rendering. X-Ray: Transparent view that lets you see internal components like the core and control rods.",
  },
};

// ============================================================================
// Plant Status Panel (right side)
// ============================================================================

export const STATUS_HELP: Record<string, LearningEntry> = {
  power: {
    title: "Reactor Power",
    description:
      "Thermal power output as a percentage of rated capacity (3000 MWth). Above 100% is overpower; above 110% triggers a safety trip. Controlled by rod position and boron concentration.",
  },
  fuelTemp: {
    title: "Fuel Temperature",
    description:
      "Average fuel pellet temperature in Kelvin. Fuel has negative temperature feedback (Doppler effect) \u2014 as fuel heats up, it naturally reduces reactivity. Limit is ~1800 K to prevent fuel damage.",
  },
  coolantTemp: {
    title: "Coolant Temperature",
    description:
      "Primary coolant (water) temperature in Kelvin. The coolant carries heat from the core to the steam generators. Exceeding ~620 K risks boiling in the primary loop.",
  },
  rodPosition: {
    title: "Rod Position",
    description:
      "Control rod insertion percentage. 0% = fully inserted (maximum neutron absorption, reactor subcritical). 100% = fully withdrawn (minimum absorption). Rods are the primary short-term reactivity control.",
  },
  boron: {
    title: "Boron Concentration",
    description:
      "Soluble boron in the primary coolant (ppm). Boron absorbs neutrons, providing long-term reactivity control via the CVCS system. Higher boron = more negative reactivity.",
  },
  decayHeat: {
    title: "Decay Heat",
    description:
      "Residual heat from radioactive decay of fission products. Present even after shutdown and decreases slowly over time. This is why cooling must continue after a reactor trip.",
  },
  rcpStatus: {
    title: "RCP Status",
    description:
      "Reactor Coolant Pump state. RCPs provide forced circulation of primary coolant through the core. Losing forced flow degrades heat removal and can lead to a reactor trip.",
  },
};

// ============================================================================
// Bottom Timeline
// ============================================================================

export const TIMELINE_HELP: LearningEntry = {
  title: "Simulation Controls",
  description:
    "Start/pause/stop the physics simulation. Speed multiplier controls how fast time passes (1x = real-time, 10x = ten times faster). The timer shows elapsed simulation time.",
};

// ============================================================================
// Control Cards
// ============================================================================

export const CONTROL_HELP: Record<string, LearningEntry> = {
  rod: {
    title: "Control Rod Assembly",
    description:
      "Ag-In-Cd neutron absorber rods with an S-curve worth profile. Moving rods out (withdrawing) adds positive reactivity, making the reactor more critical. Moving rods in (inserting) adds negative reactivity. SCRAM drives all rods fully in as an emergency shutdown.",
  },
  boron: {
    title: "Chemical Shim (CVCS)",
    description:
      "The Chemical & Volume Control System adjusts soluble boron in primary coolant. Boron is a slow-acting control used for long-term reactivity management and to compensate for fuel burnup and xenon transients.",
  },
  pump: {
    title: "RCP & Protection",
    description:
      "Reactor Coolant Pump toggle and SCRAM button. The RCP maintains forced coolant flow. SCRAM (Safety Control Rod Ax Man) is the emergency shutdown \u2014 it inserts all control rods instantly to make the reactor deeply subcritical.",
  },
};

// ============================================================================
// Alarm System
// ============================================================================

export const ALARM_HELP: LearningEntry = {
  title: "Alarm System",
  description:
    "Monitors key parameters and triggers alarms when limits are exceeded. Priority levels: Low (informational), Medium (attention), High (action required), Critical (immediate response). Acknowledge alarms with ACK to indicate you are aware.",
};

// ============================================================================
// System Health
// ============================================================================

export const SYSTEM_HEALTH_HELP: LearningEntry = {
  title: "System Health",
  description:
    "Status of major plant systems. RCS: Reactor Coolant System (primary loop circulation). SAFETY: Protection system and trip circuits. CVCS: Chemical & Volume Control. ECCS: Emergency Core Cooling System.",
};

// ============================================================================
// Mode Banner
// ============================================================================

export const MODE_BANNER_HELP: LearningEntry = {
  title: "Operating Mode",
  description:
    "Shows the current plant operating state. Normal: All parameters within limits. Abnormal: One or more parameters approaching limits. Emergency: Safety system activated or reactor trip in progress.",
};

// ============================================================================
// 3D Viewport
// ============================================================================

export const VIEWPORT_HELP: LearningEntry = {
  title: "3D Reactor Model",
  description:
    "Interactive 3D model of a Pressurized Water Reactor (PWR). Use Select mode to click components for details. The model shows the reactor vessel, steam generators, pressurizer, coolant pumps, and turbine. Colors reflect current operating conditions.",
};

// ============================================================================
// Left Panel / Tree
// ============================================================================

export const TREE_HELP: LearningEntry = {
  title: "Plant Structure",
  description:
    "Hierarchical view of reactor systems and components. Click any item to select it in the 3D viewport. Some items link to training scenarios you can run to practice specific operations.",
};
