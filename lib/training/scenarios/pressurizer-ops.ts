/**
 * Scenario: Pressurizer Pressure Control
 *
 * Learning objectives:
 * - Understand RCS pressure control using heaters and spray
 * - Respond to pressure transients during power changes
 * - Maintain pressure within normal operating band
 */

import type { TrainingScenario } from '../types';
import { TrainingRole } from '../types';

export const pressurizerOpsScenario: TrainingScenario = {
  id: 'PWR_PZR_01',
  name: 'Pressurizer Pressure Control',
  description:
    'Learn to control RCS pressure using pressurizer heaters and spray during a power transient.',
  difficulty: 2,
  estimatedDuration: 10,
  recommendedRole: TrainingRole.RO_TRAINEE,

  initialState: {
    reactorState: {
      t: 0,
      P: 0.5,
      Tf: 380,
      Tc: 345,
      C: [0.002, 0.002, 0.002, 0.002, 0.002, 0.002],
      I135: 0,
      Xe135: 0,
      decayHeat: [0, 0, 0],
      Ppzr: 15.5,
    },
    controls: {
      rod: 0.55,
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
      id: 'OBJ1_MAINTAIN_PRESSURE',
      description: 'Maintain pressure within 14.5–16.5 MPa during power change',
      assessmentCriteria: [
        {
          metric: 'maxPressure',
          target: '<16.5',
          unit: 'MPa',
          weight: 0.3,
        },
        {
          metric: 'minPressure',
          target: '>14.5',
          unit: 'MPa',
          weight: 0.3,
        },
      ],
    },
    {
      id: 'OBJ2_USE_HEATERS',
      description: 'Use heaters when pressure drops below nominal',
      assessmentCriteria: [
        {
          metric: 'observationTime',
          target: '>120',
          unit: 'seconds',
          weight: 0.2,
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
  ],

  completionConditions: {
    type: 'time_limit',
    parameters: {
      minTime: 180,
      maxPower: 1.0,
    },
  },

  failureConditions: [
    {
      type: 'trip',
      parameters: {},
      description: 'Reactor tripped — pressure or other parameter exceeded safety limits',
    },
  ],

  briefing: `SCENARIO BRIEFING: Pressurizer Pressure Control

INITIAL CONDITIONS:
• Reactor operating at 50% power
• All systems normal, pressure at 15.5 MPa (nominal)
• Pressurizer heaters and spray available

YOUR MISSION:
Learn to manage RCS pressure using the pressurizer heaters and spray valves.

INSTRUCTIONS:
1. Observe the current pressure reading (15.5 MPa nominal)
2. Withdraw control rods to increase power — watch pressure change
3. When pressure rises: use SPRAY to bring it down
4. When pressure drops: use HEATERS to bring it up
5. Keep pressure between 14.5 and 16.5 MPa at all times

KEY CONCEPTS:
• Temperature changes drive pressure changes (hotter = higher pressure)
• Heaters boil water in the pressurizer to RAISE pressure
• Spray condenses steam to LOWER pressure
• High pressure trip at 16.5 MPa; low pressure trip at 12.0 MPa

PROHIBITED ACTIONS:
• Do not let pressure exceed 16.5 MPa (high pressure trip)
• Do not let pressure drop below 14.5 MPa

This is a LEARNING scenario — take your time to understand heater/spray response.`,

  hints: [
    {
      triggerId: 'HINT_START',
      triggerCondition: 'time > 5 && time < 15',
      content:
        'Try withdrawing the control rods slightly to increase power. Watch how the pressure responds to the temperature change.',
      displayMode: 'automatic',
      priority: 'info',
    },
    {
      triggerId: 'HINT_PRESSURE_RISING',
      triggerCondition: 'Ppzr > 15.8',
      content:
        'Pressure is rising above nominal. Turn on the pressurizer SPRAY to condense steam and lower pressure.',
      displayMode: 'automatic',
      priority: 'warning',
    },
    {
      triggerId: 'HINT_PRESSURE_DROPPING',
      triggerCondition: 'Ppzr < 15.2',
      content:
        'Pressure is dropping below nominal. Turn on the pressurizer HEATERS to boil water and raise pressure.',
      displayMode: 'automatic',
      priority: 'warning',
    },
    {
      triggerId: 'HINT_PRESSURE_HIGH',
      triggerCondition: 'Ppzr > 16.2',
      content:
        '⚠️ Pressure approaching high limit! Increase spray to maximum to prevent a high-pressure trip.',
      displayMode: 'automatic',
      priority: 'critical',
    },
  ],
};
