/**
 * Nuclear Reactor Educational Simulator
 * 
 * Main entry point - exports all public APIs
 */

// Types
export type {
  ReactorState,
  ControlInputs,
  ReactivityComponents,
  SimulationRecord,
  SimulationConfig,
  IntegrationMethod,
  BenchmarkResult,
} from './types';

export { NUM_PRECURSOR_GROUPS } from './types';

// Parameters
export type { ReactorParams } from './params';

export {
  DEFAULT_PARAMS,
  BETA_I,
  BETA_TOTAL,
  LAMBDA_I,
  LAMBDA_PROMPT,
  ALPHA_FUEL,
  ALPHA_COOLANT,
  TF_REFERENCE,
  TC_REFERENCE,
  ROD_WORTH_MAX,
  SCRAM_REACTIVITY,
  SCRAM_TAU,
  rodWorthCurve,
  createParams,
  SIGMA_F_MACRO,
} from './params';

// Model
export {
  ReactorModel,
  createSteadyState,
  createCriticalSteadyState,
  createColdShutdownState,
  computeCriticalRodPosition,
  computeReactivity,
  computeDopplerReactivity,
  computeModeratorReactivity,
  computeDerivatives,
  computeExternalReactivity,
} from './model';

// Guards
export {
  ValidationError,
  BoundsError,
  validateRodPosition,
  validateTimestep,
  validateControls,
  validateInitialState,
  validateParams,
  validateStateFinite,
  clamp,
  clampWithInfo,
  clampState,
} from './guards';

// Benchmarks
export {
  runSteadyHold,
  runRodInsertion,
  runRodWithdrawal,
  runScram,
  runPumpTrip,
  runRodRamp,
  runStartup,
  runAllBenchmarks,
  formatBenchmarkJSON,
  formatAllBenchmarksJSON,
  printBenchmarkSummary,
} from './benchmarks';
