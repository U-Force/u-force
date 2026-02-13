/**
 * Scenario: Integrated Secondary Control
 *
 * Learning objectives:
 * - Coordinate feedwater, steam dump, and pressurizer during power ascension
 * - Understand the interaction between primary and secondary systems
 * - Practice multi-system management
 */

import type { TrainingScenario } from '../types';
import { TrainingRole } from '../types';

export const secondaryIntegratedScenario: TrainingScenario = {
  id: 'PWR_SECONDARY_01',
  name: 'Integrated Secondary Control',
  description:
    'Coordinate feedwater, steam dump, and pressurizer controls during a full power ascension from 30% to 90%.',
  difficulty: 3,
  estimatedDuration: 15,
  recommendedRole: TrainingRole.RO,

  initialState: {
    reactorState: {
      t: 0,
      P: 0.3,
      Tf: 360,
      Tc: 330,
      C: [0.002, 0.002, 0.002, 0.002, 0.002, 0.002],
      I135: 0,
      Xe135: 0,
      decayHeat: [0, 0, 0],
      Ppzr: 15.5,
    },
    controls: {
      rod: 0.45,
      pumpOn: true,
      scram: false,
      boronConc: 200,
      pressurizerHeater: 0,
      pressurizerSpray: 0,
      steamDump: 0,
      feedwaterFlow: 1,
    },
    timeAcceleration: 2,
  },

  objectives: [
    {
      id: 'OBJ1_REACH_POWER',
      description: 'Reach 85–95% power',
      assessmentCriteria: [
        {
          metric: 'finalPower',
          target: '85-95',
          unit: '%',
          weight: 0.3,
        },
      ],
    },
    {
      id: 'OBJ2_MAINTAIN_PRESSURE',
      description: 'Finish with pressure between 14.5–16.5 MPa',
      assessmentCriteria: [
        {
          metric: 'finalPressure',
          target: '14.5-16.5',
          unit: 'MPa',
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
          weight: 0.2,
        },
      ],
    },
    {
      id: 'OBJ4_TEMP_CONTROL',
      description: 'Keep fuel temperature below 700 K',
      assessmentCriteria: [
        {
          metric: 'maxFuelTemp',
          target: '<700',
          unit: 'K',
          weight: 0.1,
        },
      ],
    },
  ],

  completionConditions: {
    type: 'state_reached',
    parameters: {
      targetPower: 0.85,
      stabilizationTime: 30,
    },
  },

  failureConditions: [
    {
      type: 'trip',
      parameters: {},
      description: 'Reactor tripped — a safety limit was exceeded',
    },
    {
      type: 'time_exceeded',
      parameters: { maxTime: 900 },
      description: 'Time exceeded — power ascension took too long',
    },
  ],

  briefing: `SCENARIO BRIEFING: Integrated Secondary Control

INITIAL CONDITIONS:
• Reactor at 30% power, stable
• Boron at 200 ppm
• All secondary systems available
• 2× time acceleration for faster thermal response

YOUR MISSION:
Perform a power ascension from 30% to 90% while coordinating all secondary controls.

PROCEDURE:
1. Begin rod withdrawal to increase power
2. Monitor pressure — use heaters/spray as needed
3. Feedwater flow should remain at 100% (adjust only if needed)
4. If temperatures rise too fast, briefly open steam dump
5. Use pressurizer controls to maintain ~15.5 MPa
6. Stabilize at 85–95% power

COORDINATION TIPS:
• As power increases, coolant temperature rises → pressure rises
• Use spray proactively as you approach full power
• Steam dump can help during rapid power changes
• Feedwater maintains SG level — reducing it simulates a feedwater issue
• Boron dilution may help overcome negative reactivity from temp increase

WARNINGS:
• Do not exceed 16.5 MPa pressure
• Monitor fuel temperature — limit is 700 K
• Avoid rapid power oscillations

This scenario tests your ability to manage multiple systems simultaneously.`,

  hints: [
    {
      triggerId: 'HINT_START',
      triggerCondition: 'time > 5 && time < 15',
      content:
        'Begin withdrawing control rods slowly. As temperature rises, you may need to use pressurizer spray to control pressure.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_PRESSURE_RISING',
      triggerCondition: 'Ppzr > 15.8',
      content:
        'Pressure rising — use pressurizer spray to control. This is normal during power ascension.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_MID_POWER',
      triggerCondition: 'P > 0.6 && P < 0.7',
      content:
        'Good progress! Continue ascending. Consider diluting boron to help overcome negative reactivity feedback.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_HIGH_POWER',
      triggerCondition: 'P > 0.85',
      content:
        'Approaching target power. Stabilize rod position and ensure pressure is within band. Close any open steam dump valves.',
      displayMode: 'automatic',
      priority: 'info',
    },
  ],
};
