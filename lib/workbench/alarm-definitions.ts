/**
 * Alarm threshold definitions for the workbench alarm engine.
 */

export interface AlarmDefinition {
  id: string;
  parameter: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  /** Function that extracts the current value from reactor state */
  getValue: (state: {
    P: number;
    Tf: number;
    Tc: number;
    decayHeat: number[];
  }) => number;
  /** Threshold above which the alarm activates */
  highLimit?: number;
  /** Threshold below which the alarm activates */
  lowLimit?: number;
  /** Deadband to prevent chattering */
  deadband?: number;
}

export const ALARM_DEFINITIONS: AlarmDefinition[] = [
  // Power alarms
  {
    id: "PWR_HI_WARN",
    parameter: "Power",
    message: "HIGH POWER WARNING >100%",
    priority: "high",
    getValue: (s) => s.P * 100,
    highLimit: 100,
    deadband: 1,
  },
  {
    id: "PWR_HI_TRIP",
    parameter: "Power",
    message: "HIGH POWER TRIP >110%",
    priority: "critical",
    getValue: (s) => s.P * 100,
    highLimit: 110,
    deadband: 0.5,
  },
  // Fuel temperature alarms
  {
    id: "TF_HI_WARN",
    parameter: "Fuel Temp",
    message: "HIGH FUEL TEMP WARNING >1500K",
    priority: "high",
    getValue: (s) => s.Tf,
    highLimit: 1500,
    deadband: 10,
  },
  {
    id: "TF_HI_TRIP",
    parameter: "Fuel Temp",
    message: "HIGH FUEL TEMP TRIP >1800K",
    priority: "critical",
    getValue: (s) => s.Tf,
    highLimit: 1800,
    deadband: 5,
  },
  // Coolant temperature alarms
  {
    id: "TC_HI_WARN",
    parameter: "Coolant Temp",
    message: "HIGH COOLANT TEMP WARNING >580K",
    priority: "medium",
    getValue: (s) => s.Tc,
    highLimit: 580,
    deadband: 5,
  },
  {
    id: "TC_HI_TRIP",
    parameter: "Coolant Temp",
    message: "HIGH COOLANT TEMP TRIP >620K",
    priority: "critical",
    getValue: (s) => s.Tc,
    highLimit: 620,
    deadband: 3,
  },
  // Low power warning (for monitoring startup)
  {
    id: "PWR_LO_WARN",
    parameter: "Power",
    message: "LOW POWER - DECAY HEAT DOMINANT",
    priority: "low",
    getValue: (s) => {
      const dh = s.decayHeat.reduce((sum, d) => sum + d, 0);
      return dh > 0 && s.P < 0.01 ? 1 : 0;
    },
    highLimit: 0.5,
    deadband: 0,
  },
];
