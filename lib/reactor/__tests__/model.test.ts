/**
 * model.test.ts - Regression tests for the reactor model
 * Run with: npx vitest run
 */

import { describe, it, expect } from 'vitest';

import {
  ReactorModel,
  createSteadyState,
  createCriticalSteadyState,
  computeDopplerReactivity,
  computeModeratorReactivity,
} from '../model';

import {
  validateRodPosition,
  validateTimestep,
  clamp,
  ValidationError,
  BoundsError,
} from '../guards';

import {
  DEFAULT_PARAMS,
  BETA_TOTAL,
  rodWorthCurve,
  createParams,
} from '../params';

import type { ControlInputs } from '../types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createDefaultControls(overrides: Partial<ControlInputs> = {}): ControlInputs {
  return { rod: 0.5, pumpOn: true, scram: false, ...overrides };
}

// ============================================================================
// UNIT TESTS: GUARDS
// ============================================================================

describe('Guards', () => {
  describe('validateRodPosition', () => {
    it('accepts valid rod positions', () => {
      expect(() => validateRodPosition(0)).not.toThrow();
      expect(() => validateRodPosition(0.5)).not.toThrow();
      expect(() => validateRodPosition(1)).not.toThrow();
    });

    it('rejects rod position below 0', () => {
      expect(() => validateRodPosition(-0.1)).toThrow(BoundsError);
    });

    it('rejects rod position above 1', () => {
      expect(() => validateRodPosition(1.1)).toThrow(BoundsError);
    });

    it('rejects NaN rod position', () => {
      expect(() => validateRodPosition(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateTimestep', () => {
    it('accepts valid timesteps for RK4', () => {
      expect(() => validateTimestep(0.01, 'rk4', DEFAULT_PARAMS)).not.toThrow();
      expect(() => validateTimestep(0.1, 'rk4', DEFAULT_PARAMS)).not.toThrow();
    });

    it('rejects zero timestep', () => {
      expect(() => validateTimestep(0, 'rk4', DEFAULT_PARAMS)).toThrow(ValidationError);
    });

    it('rejects negative timestep', () => {
      expect(() => validateTimestep(-0.01, 'rk4', DEFAULT_PARAMS)).toThrow(ValidationError);
    });

    it('rejects too large timestep for Euler', () => {
      expect(() => validateTimestep(0.1, 'euler', DEFAULT_PARAMS)).toThrow(ValidationError);
    });
  });

  describe('clamp', () => {
    it('clamps values correctly', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(5, 0, 10)).toBe(5);
    });
  });
});

// ============================================================================
// UNIT TESTS: PARAMETERS
// ============================================================================

describe('Parameters', () => {
  it('BETA_TOTAL should be approximately 0.0065', () => {
    expect(BETA_TOTAL).toBeCloseTo(0.0065, 3);
  });

  describe('rodWorthCurve', () => {
    it('returns 0 at rod=0 and 1 at rod=1', () => {
      expect(rodWorthCurve(0)).toBeCloseTo(0, 10);
      expect(rodWorthCurve(1)).toBeCloseTo(1, 10);
    });

    it('is monotonically increasing', () => {
      let prev = -1;
      for (let x = 0; x <= 1; x += 0.1) {
        const val = rodWorthCurve(x);
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
    });
  });

  it('createParams applies overrides correctly', () => {
    const params = createParams({ lambdaPrompt: 2e-4 });
    expect(params.lambdaPrompt).toBe(2e-4);
    expect(params.alphaFuel).toBe(DEFAULT_PARAMS.alphaFuel);
  });
});

// ============================================================================
// UNIT TESTS: REACTIVITY
// ============================================================================

describe('Reactivity Calculations', () => {
  it('Doppler reactivity is zero at reference temperature', () => {
    const rho = computeDopplerReactivity(DEFAULT_PARAMS.TfRef, DEFAULT_PARAMS);
    expect(rho).toBeCloseTo(0, 10);
  });

  it('Doppler reactivity is negative above reference (negative feedback)', () => {
    const rho = computeDopplerReactivity(DEFAULT_PARAMS.TfRef + 100, DEFAULT_PARAMS);
    expect(rho).toBeLessThan(0);
  });

  it('Moderator reactivity is zero at reference temperature', () => {
    const rho = computeModeratorReactivity(DEFAULT_PARAMS.TcRef, DEFAULT_PARAMS);
    expect(rho).toBeCloseTo(0, 10);
  });

  it('Moderator reactivity is negative above reference', () => {
    const rho = computeModeratorReactivity(DEFAULT_PARAMS.TcRef + 10, DEFAULT_PARAMS);
    expect(rho).toBeLessThan(0);
  });
});

// ============================================================================
// UNIT TESTS: STEADY STATE
// ============================================================================

describe('Steady State Creation', () => {
  it('createSteadyState creates valid state at P=1.0', () => {
    const state = createSteadyState(1.0, DEFAULT_PARAMS, true);

    expect(state.t).toBe(0);
    expect(state.P).toBe(1.0);
    expect(state.C.length).toBe(6);
    expect(state.Tf).toBeGreaterThan(DEFAULT_PARAMS.TcInlet);
    expect(state.Tc).toBeGreaterThan(DEFAULT_PARAMS.TcInlet);
    expect(state.Tf).toBeGreaterThan(state.Tc);
  });

  it('createSteadyState at zero power has zero precursors', () => {
    const state = createSteadyState(0, DEFAULT_PARAMS, true);
    expect(state.P).toBe(0);
    state.C.forEach(c => expect(c).toBe(0));
  });

  it('createSteadyState rejects negative power', () => {
    expect(() => createSteadyState(-0.1, DEFAULT_PARAMS, true)).toThrow();
  });

  it('createCriticalSteadyState returns valid rod position', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    expect(state.P).toBe(1.0);
    expect(rodPosition).toBeGreaterThan(0);
    expect(rodPosition).toBeLessThan(1);
  });

  it('critical rod position gives near-zero reactivity', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);
    const controls = createDefaultControls({ rod: rodPosition });
    const reactivity = model.getReactivity(controls);
    expect(Math.abs(reactivity.rhoTotal)).toBeLessThan(1e-6);
  });
});

// ============================================================================
// REGRESSION TEST 1: STEADY HOLD
// ============================================================================

describe('Regression: Steady Hold', () => {
  it('maintains power near 1.0 for 30 seconds', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);
    const controls = createDefaultControls({ rod: rodPosition });

    const records = model.run(30, 0.05, controls);

    // Power should stay within ±2% of nominal
    for (const record of records) {
      expect(record.P).toBeGreaterThan(0.98);
      expect(record.P).toBeLessThan(1.02);
    }

    // Final power should be very close to initial
    const finalP = records[records.length - 1].P;
    expect(finalP).toBeCloseTo(1.0, 1);
  });

  it('maintains bounded temperatures', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);
    const controls = createDefaultControls({ rod: rodPosition });

    const records = model.run(30, 0.05, controls);
    const initialTf = records[0].Tf;
    const initialTc = records[0].Tc;

    for (const record of records) {
      expect(Math.abs(record.Tf - initialTf)).toBeLessThan(5);
      expect(Math.abs(record.Tc - initialTc)).toBeLessThan(5);
    }
  });
});

// ============================================================================
// REGRESSION TEST 2: ROD INSERTION DECREASES POWER
// ============================================================================

describe('Regression: Rod Insertion Decreases Power', () => {
  it('decreases power when rod is inserted', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const stepTime = 2;
    const rodStep = 0.1;
    const newRodPosition = Math.max(0, rodPosition - rodStep);

    const controls = (t: number): ControlInputs => ({
      rod: t < stepTime ? rodPosition : newRodPosition,
      pumpOn: true,
      scram: false,
    });

    const records = model.run(20, 0.05, controls, 0.5);

    const powerAtStart = records.find(r => r.t >= 0)!.P;
    const powerAfterStep = records.find(r => r.t >= 5)!.P;
    const powerFinal = records[records.length - 1].P;

    expect(powerAfterStep).toBeLessThan(powerAtStart);
    expect(powerFinal).toBeLessThan(powerAtStart);
  });

  it('shows prompt drop followed by delayed decay', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const stepTime = 1;
    const newRodPosition = rodPosition - 0.15;

    const controls = (t: number): ControlInputs => ({
      rod: t < stepTime ? rodPosition : newRodPosition,
      pumpOn: true,
      scram: false,
    });

    const records = model.run(30, 0.02, controls, 0.1);

    const preStepP = records.filter(r => r.t < stepTime).pop()!.P;
    const immediatePost = records.find(r => r.t >= stepTime + 0.2)!;
    const laterPost = records.find(r => r.t >= stepTime + 5)!;

    // Prompt drop should be noticeable
    expect(immediatePost.P).toBeLessThan(preStepP * 0.95);
    // Further decay from delayed neutrons
    expect(laterPost.P).toBeLessThan(immediatePost.P);
  });
});

// ============================================================================
// REGRESSION TEST 3: SCRAM
// ============================================================================

describe('Regression: Scram', () => {
  it('rapidly reduces power below 20% within 5 seconds', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const scramTime = 2;
    const controls = (t: number): ControlInputs => ({
      rod: rodPosition,
      pumpOn: true,
      scram: t >= scramTime,
    });

    const records = model.run(15, 0.02, controls, 0.1);

    // Find power at scramTime + 5 seconds
    const powerAfter5s = records.find(r => r.t >= scramTime + 5)!.P;
    expect(powerAfter5s).toBeLessThan(0.2);
  });

  it('shows slower tail from delayed neutrons after initial drop', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const scramTime = 1;
    const controls = (t: number): ControlInputs => ({
      rod: rodPosition,
      pumpOn: true,
      scram: t >= scramTime,
    });

    const records = model.run(60, 0.05, controls, 0.5);

    // Power at different times after scram
    const p5s = records.find(r => r.t >= scramTime + 5)!.P;
    const p10s = records.find(r => r.t >= scramTime + 10)!.P;
    const p30s = records.find(r => r.t >= scramTime + 30)!.P;

    // Should still be decaying (delayed neutron tail)
    expect(p10s).toBeLessThan(p5s);
    expect(p30s).toBeLessThan(p10s);

    // But decay rate slows down (not linear)
    const rate1 = (p5s - p10s) / 5;
    const rate2 = (p10s - p30s) / 20;
    expect(rate1).toBeGreaterThan(rate2);
  });
});

// ============================================================================
// REGRESSION TEST 4: PUMP OFF HEATS COOLANT
// ============================================================================

describe('Regression: Pump Off Heats Coolant', () => {
  it('increases coolant temperature when pump is off', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const tripTime = 5;
    const controls = (t: number): ControlInputs => ({
      rod: rodPosition,
      pumpOn: t < tripTime,
      scram: false,
    });

    const records = model.run(60, 0.1, controls, 1.0);

    // Get temperature before and after pump trip
    const tcBeforeTrip = records.find(r => r.t >= tripTime - 1)!.Tc;
    const tcAfterTrip = records.find(r => r.t >= tripTime + 20)!.Tc;

    // Coolant should heat up when pump is off
    expect(tcAfterTrip).toBeGreaterThan(tcBeforeTrip);
  });

  it('has higher coolant temperature with pump off vs pump on', () => {
    // Run with pump on
    const { state: state1, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model1 = new ReactorModel(state1, DEFAULT_PARAMS);
    const records1 = model1.run(30, 0.1, { rod: rodPosition, pumpOn: true, scram: false });
    const tcPumpOn = records1[records1.length - 1].Tc;

    // Run with pump off (from same starting point, different pump status)
    const state2 = createSteadyState(1.0, DEFAULT_PARAMS, false); // steady state with pump off
    const model2 = new ReactorModel(state2, DEFAULT_PARAMS);
    const records2 = model2.run(30, 0.1, { rod: 0.8, pumpOn: false, scram: false });
    const tcPumpOff = records2[records2.length - 1].Tc;

    // Pump off should result in higher coolant temp
    expect(tcPumpOff).toBeGreaterThan(tcPumpOn);
  });
});

// ============================================================================
// NUMERICAL STABILITY TESTS
// ============================================================================

describe('Numerical Stability', () => {
  it('does not blow up with RK4 at dt=0.1', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS, { method: 'rk4' });
    const controls = createDefaultControls({ rod: rodPosition });

    const records = model.run(100, 0.1, controls);

    for (const record of records) {
      expect(Number.isFinite(record.P)).toBe(true);
      expect(Number.isFinite(record.Tf)).toBe(true);
      expect(Number.isFinite(record.Tc)).toBe(true);
      expect(record.P).toBeGreaterThan(0);
      expect(record.P).toBeLessThan(DEFAULT_PARAMS.PMax);
    }
  });

  it('Euler method works with small timestep', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS, { method: 'euler' });
    const controls = createDefaultControls({ rod: rodPosition });

    const records = model.run(10, 0.005, controls);

    for (const record of records) {
      expect(Number.isFinite(record.P)).toBe(true);
      expect(record.P).toBeGreaterThan(0.9);
      expect(record.P).toBeLessThan(1.1);
    }
  });

  it('handles rapid transients without NaN', () => {
    const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    // Rapid rod withdrawal then scram
    const controls = (t: number): ControlInputs => ({
      rod: t < 1 ? rodPosition : t < 2 ? 1.0 : rodPosition,
      pumpOn: true,
      scram: t >= 3,
    });

    const records = model.run(20, 0.02, controls);

    for (const record of records) {
      expect(Number.isNaN(record.P)).toBe(false);
      expect(Number.isNaN(record.Tf)).toBe(false);
      expect(Number.isNaN(record.Tc)).toBe(false);
    }
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('handles zero power state', () => {
    const state = createSteadyState(0, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const controls: ControlInputs = { rod: 0, pumpOn: true, scram: false };
    const records = model.run(10, 0.1, controls);

    // Power should stay at or near zero
    for (const record of records) {
      expect(record.P).toBeGreaterThanOrEqual(0);
      expect(record.P).toBeLessThan(0.01);
    }
  });

  it('handles very low power operation', () => {
    const state = createSteadyState(0.001, DEFAULT_PARAMS, true);
    const model = new ReactorModel(state, DEFAULT_PARAMS);

    const controls: ControlInputs = { rod: 0.3, pumpOn: true, scram: false };
    const records = model.run(10, 0.1, controls);

    for (const record of records) {
      expect(Number.isFinite(record.P)).toBe(true);
      expect(record.P).toBeGreaterThan(0);
    }
  });
});
