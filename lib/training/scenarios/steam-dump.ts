/**
 * Scenario: Steam Dump and Transient Management
 *
 * Learning objectives:
 * - Use steam dump valves to reject excess heat
 * - Manage a load rejection transient
 * - Coordinate power reduction with secondary heat removal
 */

import type { TrainingScenario } from '../types';
import { TrainingRole } from '../types';

export const steamDumpScenario: TrainingScenario = {
  id: 'PWR_STEAMDUMP_01',
  name: 'Steam Dump & Load Rejection',
  description:
    'Use steam dump valves to manage excess heat during a simulated load rejection. Reduce power to 30% while maintaining stable conditions.',
  difficulty: 3,
  estimatedDuration: 12,
  recommendedRole: TrainingRole.RO,

  initialState: {
    reactorState: {
      t: 0,
      P: 0.8,
      Tf: 430,
      Tc: 370,
      C: [0.002, 0.002, 0.002, 0.002, 0.002, 0.002],
      I135: 0,
      Xe135: 0,
      decayHeat: [0, 0, 0],
      Ppzr: 15.5,
    },
    controls: {
      rod: 0.7,
      pumpOn: true,
      scram: false,
      boronConc: 0,
      pressurizerHeater: 0,
      pressurizerSpray: 0,
      steamDump: 0,
      feedwaterFlow: 1,
    },
    timeAcceleration: 1,
  },

  objectives: [
    {
      id: 'OBJ1_OPEN_DUMP',
      description: 'Open steam dump valves to increase heat removal',
      assessmentCriteria: [
        {
          metric: 'observationTime',
          target: '>60',
          unit: 'seconds',
          weight: 0.2,
        },
      ],
    },
    {
      id: 'OBJ2_REDUCE_POWER',
      description: 'Reduce power to below 35% without trip',
      assessmentCriteria: [
        {
          metric: 'finalPower',
          target: '<35',
          unit: '%',
          weight: 0.4,
        },
      ],
    },
    {
      id: 'OBJ3_NO_TRIPS',
      description: 'Complete without reactor trip',
      assessmentCriteria: [
        {
          metric: 'tripsOccurred',
          target: '0',
          unit: 'count',
          weight: 0.3,
        },
      ],
    },
    {
      id: 'OBJ4_CLOSE_DUMP',
      description: 'Close steam dump as conditions stabilize',
      assessmentCriteria: [
        {
          metric: 'observationTime',
          target: '>180',
          unit: 'seconds',
          weight: 0.1,
        },
      ],
    },
  ],

  completionConditions: {
    type: 'state_reached',
    parameters: {
      targetPower: 0.3,
      stabilizationTime: 30,
    },
  },

  failureConditions: [
    {
      type: 'trip',
      parameters: {},
      description: 'Reactor tripped — parameters exceeded safety limits',
    },
    {
      type: 'time_exceeded',
      parameters: { maxTime: 720 },
      description: 'Took too long — transient must be managed promptly',
    },
  ],

  briefing: `SCENARIO BRIEFING: Steam Dump & Load Rejection

INITIAL CONDITIONS:
• Reactor operating at 80% power
• All systems normal
• Steam dump valves available but closed

SITUATION:
A load rejection has occurred — the grid no longer needs full power output.
You must reduce reactor power to ~30% while managing the excess heat.

YOUR MISSION:
Use steam dump valves and rod insertion to safely reduce power.

IMMEDIATE ACTIONS:
1. Open steam dump valves to increase secondary heat rejection
2. Begin inserting control rods to reduce power
3. Monitor temperatures — steam dump prevents thermal shock
4. As power approaches 30%, begin closing dump valves
5. Stabilize at 30% with dump valves closed

KEY CONCEPTS:
• Steam dump bypasses turbines, dumping steam directly to condenser
• This increases heat removal from the primary side
• Without steam dump, rapid power reduction causes thermal stress
• Coordinate rod insertion with dump valve position

WARNINGS:
• Do not leave dump valves open at low power (overcooling risk)
• Monitor RCS pressure — temperature changes affect pressure
• Use pressurizer heaters/spray if needed for pressure control`,

  hints: [
    {
      triggerId: 'HINT_OPEN_DUMP',
      triggerCondition: 'time > 5 && time < 15',
      content:
        'Open the steam dump valves to increase heat rejection. This will help cool the primary side as you reduce power.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_INSERT_RODS',
      triggerCondition: 'time > 20 && P > 0.7',
      content:
        'Begin inserting control rods to reduce reactor power. The steam dump will help manage the thermal transient.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_CLOSE_DUMP',
      triggerCondition: 'P < 0.4',
      content:
        'Power is approaching target. Begin closing steam dump valves to prevent overcooling.',
      displayMode: 'automatic',
      priority: 'info',
    },
  ],
};
