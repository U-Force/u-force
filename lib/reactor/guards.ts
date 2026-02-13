/**
 * guards.ts - Runtime validation and safety checks for the reactor model
 * 
 * Provides validation functions for inputs, state bounds checking,
 * and safe clamping with optional warnings.
 */

import type { ReactorState, ControlInputs, SimulationConfig, IntegrationMethod } from './types';
import type { ReactorParams } from './params';

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a value is out of physical bounds.
 */
export class BoundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BoundsError';
  }
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validates that a number is finite (not NaN, not Infinity).
 * @throws ValidationError if value is not finite
 */
export function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new ValidationError(
      `${name} must be a finite number, got: ${value}`
    );
  }
}

/**
 * Validates that a number is within a specified range.
 * @throws BoundsError if value is outside [min, max]
 */
export function assertInRange(
  value: number, 
  min: number, 
  max: number, 
  name: string
): void {
  assertFinite(value, name);
  if (value < min || value > max) {
    throw new BoundsError(
      `${name} must be in range [${min}, ${max}], got: ${value}`
    );
  }
}

/**
 * Validates control rod position.
 * @param rod Control rod position [0, 1]
 * @throws BoundsError if rod is outside valid range
 */
export function validateRodPosition(rod: number): void {
  assertInRange(rod, 0, 1, 'Control rod position');
}

/**
 * Validates the timestep for a given integration method.
 * @param dt Timestep in seconds
 * @param method Integration method
 * @param params Reactor parameters for bounds
 * @throws ValidationError if dt is invalid
 */
export function validateTimestep(
  dt: number, 
  method: IntegrationMethod,
  params: ReactorParams
): void {
  assertFinite(dt, 'Timestep dt');
  
  if (dt <= 0) {
    throw new ValidationError(`Timestep must be positive, got: ${dt}`);
  }
  
  if (dt < params.dtMin) {
    throw new ValidationError(
      `Timestep ${dt}s is below minimum ${params.dtMin}s`
    );
  }
  
  const dtMax = method === 'euler' ? params.dtMaxEuler : params.dtMaxRk4;
  if (dt > dtMax) {
    throw new ValidationError(
      `Timestep ${dt}s exceeds maximum ${dtMax}s for ${method.toUpperCase()} method`
    );
  }
}

/**
 * Validates complete control inputs.
 * @param controls Control input object
 * @throws ValidationError or BoundsError on invalid inputs
 */
export function validateControls(controls: ControlInputs): void {
  validateRodPosition(controls.rod);

  if (typeof controls.pumpOn !== 'boolean') {
    throw new ValidationError(
      `pumpOn must be a boolean, got: ${typeof controls.pumpOn}`
    );
  }

  if (typeof controls.scram !== 'boolean') {
    throw new ValidationError(
      `scram must be a boolean, got: ${typeof controls.scram}`
    );
  }

  assertFinite(controls.boronConc, 'Boron concentration');
  if (controls.boronConc < 0) {
    throw new BoundsError(
      `Boron concentration must be non-negative, got: ${controls.boronConc}`
    );
  }

  assertInRange(controls.pressurizerHeater, 0, 1, 'Pressurizer heater');
  assertInRange(controls.pressurizerSpray, 0, 1, 'Pressurizer spray');
  assertInRange(controls.steamDump, 0, 1, 'Steam dump');
  assertInRange(controls.feedwaterFlow, 0, 1, 'Feedwater flow');
}

/**
 * Validates that reactor state contains finite values.
 * @param state Reactor state to validate
 * @throws ValidationError if any state variable is not finite
 */
export function validateStateFinite(state: ReactorState): void {
  assertFinite(state.t, 'Time t');
  assertFinite(state.P, 'Power P');
  assertFinite(state.Tf, 'Fuel temperature Tf');
  assertFinite(state.Tc, 'Coolant temperature Tc');

  state.C.forEach((c, i) => {
    assertFinite(c, `Precursor concentration C[${i}]`);
  });

  state.decayHeat.forEach((d, i) => {
    assertFinite(d, `Decay heat group D[${i}]`);
  });
}

/**
 * Validates reactor parameters are all finite and sensible.
 * @param params Parameter set to validate
 * @throws ValidationError if any parameter is invalid
 */
export function validateParams(params: ReactorParams): void {
  // Neutronics
  if (params.betaI.length !== params.lambdaI.length) {
    throw new ValidationError(
      `betaI length (${params.betaI.length}) must match lambdaI length (${params.lambdaI.length})`
    );
  }
  
  params.betaI.forEach((b, i) => {
    assertFinite(b, `betaI[${i}]`);
    if (b < 0) {
      throw new ValidationError(`betaI[${i}] must be non-negative, got: ${b}`);
    }
  });
  
  params.lambdaI.forEach((l, i) => {
    assertFinite(l, `lambdaI[${i}]`);
    if (l <= 0) {
      throw new ValidationError(`lambdaI[${i}] must be positive, got: ${l}`);
    }
  });
  
  assertFinite(params.lambdaPrompt, 'lambdaPrompt');
  if (params.lambdaPrompt <= 0) {
    throw new ValidationError(
      `lambdaPrompt must be positive, got: ${params.lambdaPrompt}`
    );
  }
  
  // Reactivity coefficients (can be negative)
  assertFinite(params.alphaFuel, 'alphaFuel');
  assertFinite(params.alphaCoolant, 'alphaCoolant');
  
  // Reference temperatures
  assertFinite(params.TfRef, 'TfRef');
  assertFinite(params.TcRef, 'TcRef');
  
  // Thermal parameters (must be positive)
  const positiveParams = [
    ['massFuel', params.massFuel],
    ['massCoolant', params.massCoolant],
    ['cpFuel', params.cpFuel],
    ['cpCoolant', params.cpCoolant],
    ['hFuelCoolant', params.hFuelCoolant],
    ['hCoolantSinkPumpOn', params.hCoolantSinkPumpOn],
    ['hCoolantSinkPumpOff', params.hCoolantSinkPumpOff],
    ['powerNominal', params.powerNominal],
  ] as const;
  
  for (const [name, value] of positiveParams) {
    assertFinite(value, name);
    if (value <= 0) {
      throw new ValidationError(`${name} must be positive, got: ${value}`);
    }
  }
  
  assertFinite(params.TcInlet, 'TcInlet');
  
  // Limits
  if (params.PMin < 0) {
    throw new ValidationError(`PMin must be non-negative, got: ${params.PMin}`);
  }
  if (params.PMax <= params.PMin) {
    throw new ValidationError(
      `PMax (${params.PMax}) must be greater than PMin (${params.PMin})`
    );
  }
}

// ============================================================================
// STATE CLAMPING
// ============================================================================

/**
 * Result of a clamping operation.
 */
export interface ClampResult {
  /** The clamped value */
  value: number;
  /** Whether clamping was applied */
  clamped: boolean;
  /** Original value before clamping */
  original: number;
  /** Which bound was hit, if any */
  bound?: 'min' | 'max';
}

/**
 * Clamps a value to a specified range with tracking.
 */
export function clampWithInfo(
  value: number, 
  min: number, 
  max: number
): ClampResult {
  if (value < min) {
    return { value: min, clamped: true, original: value, bound: 'min' };
  }
  if (value > max) {
    return { value: max, clamped: true, original: value, bound: 'max' };
  }
  return { value, clamped: false, original: value };
}

/**
 * Simple clamp without tracking.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamps reactor state to safe bounds and optionally emits warnings.
 * 
 * @param state State to clamp (modified in place)
 * @param params Parameters defining bounds
 * @param config Simulation config for warning options
 * @returns Object indicating which variables were clamped
 */
export function clampState(
  state: ReactorState,
  params: ReactorParams,
  config?: SimulationConfig
): { P: boolean; Tf: boolean; Tc: boolean; Ppzr: boolean; C: boolean[] } {
  const warn = config?.warnOnClamp 
    ? (config.warnHandler ?? console.warn) 
    : () => {};
  
  const result = {
    P: false,
    Tf: false,
    Tc: false,
    Ppzr: false,
    C: state.C.map(() => false),
  };
  
  // Clamp power
  const pResult = clampWithInfo(state.P, params.PMin, params.PMax);
  if (pResult.clamped) {
    result.P = true;
    warn(
      `[t=${state.t.toFixed(3)}s] Power clamped from ${pResult.original.toExponential(3)} ` +
      `to ${pResult.bound} bound ${pResult.value}`
    );
    state.P = pResult.value;
  }
  
  // Clamp fuel temperature
  const tfResult = clampWithInfo(state.Tf, params.TfMin, params.TfMax);
  if (tfResult.clamped) {
    result.Tf = true;
    warn(
      `[t=${state.t.toFixed(3)}s] Fuel temp clamped from ${tfResult.original.toFixed(1)}K ` +
      `to ${tfResult.bound} bound ${tfResult.value}K`
    );
    state.Tf = tfResult.value;
  }
  
  // Clamp coolant temperature
  const tcResult = clampWithInfo(state.Tc, params.TcMin, params.TcMax);
  if (tcResult.clamped) {
    result.Tc = true;
    warn(
      `[t=${state.t.toFixed(3)}s] Coolant temp clamped from ${tcResult.original.toFixed(1)}K ` +
      `to ${tcResult.bound} bound ${tcResult.value}K`
    );
    state.Tc = tcResult.value;
  }
  
  // Clamp pressurizer pressure
  const ppzrResult = clampWithInfo(state.Ppzr, params.pzrPressureMin, params.pzrPressureMax);
  if (ppzrResult.clamped) {
    result.Ppzr = true;
    warn(
      `[t=${state.t.toFixed(3)}s] Pressurizer pressure clamped from ${ppzrResult.original.toFixed(2)} MPa ` +
      `to ${ppzrResult.bound} bound ${ppzrResult.value} MPa`
    );
    state.Ppzr = ppzrResult.value;
  }

  // Clamp precursor concentrations (must be non-negative)
  for (let i = 0; i < state.C.length; i++) {
    if (state.C[i] < 0) {
      result.C[i] = true;
      warn(
        `[t=${state.t.toFixed(3)}s] Precursor C[${i}] clamped from ${state.C[i].toExponential(3)} to 0`
      );
      state.C[i] = 0;
    }
  }

  // Clamp decay heat groups (must be non-negative)
  for (let i = 0; i < state.decayHeat.length; i++) {
    if (state.decayHeat[i] < 0) {
      warn(
        `[t=${state.t.toFixed(3)}s] Decay heat D[${i}] clamped from ${state.decayHeat[i].toExponential(3)} to 0`
      );
      state.decayHeat[i] = 0;
    }
  }

  return result;
}

// ============================================================================
// INITIAL STATE VALIDATION
// ============================================================================

/**
 * Validates that initial state is physically reasonable.
 * @param state Initial state
 * @param params Parameters
 * @throws ValidationError if state is unreasonable
 */
export function validateInitialState(
  state: ReactorState, 
  params: ReactorParams
): void {
  validateStateFinite(state);
  
  if (state.t < 0) {
    throw new ValidationError(`Initial time must be non-negative, got: ${state.t}`);
  }
  
  if (state.P < 0) {
    throw new ValidationError(`Initial power must be non-negative, got: ${state.P}`);
  }
  
  if (state.P > params.PMax) {
    throw new ValidationError(
      `Initial power ${state.P} exceeds maximum ${params.PMax}`
    );
  }
  
  if (state.Tf < params.TfMin || state.Tf > params.TfMax) {
    throw new BoundsError(
      `Initial Tf ${state.Tf}K outside bounds [${params.TfMin}, ${params.TfMax}]K`
    );
  }
  
  if (state.Tc < params.TcMin || state.Tc > params.TcMax) {
    throw new BoundsError(
      `Initial Tc ${state.Tc}K outside bounds [${params.TcMin}, ${params.TcMax}]K`
    );
  }
  
  if (state.C.length !== params.betaI.length) {
    throw new ValidationError(
      `Precursor array length (${state.C.length}) must match betaI length (${params.betaI.length})`
    );
  }
  
  for (let i = 0; i < state.C.length; i++) {
    if (state.C[i] < 0) {
      throw new ValidationError(
        `Initial precursor C[${i}] must be non-negative, got: ${state.C[i]}`
      );
    }
  }

  for (let i = 0; i < state.decayHeat.length; i++) {
    if (state.decayHeat[i] < 0) {
      throw new ValidationError(
        `Initial decay heat D[${i}] must be non-negative, got: ${state.decayHeat[i]}`
      );
    }
  }
}
