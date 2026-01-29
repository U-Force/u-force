# Reduced-Order Nuclear Reactor Educational Simulator

A TypeScript implementation of a reduced-order point kinetics model coupled with a lumped-parameter thermal-hydraulic model for educational simulation of a PWR-like thermal reactor.

**⚠️ DISCLAIMER**: This is an educational tool only. It is NOT suitable for plant operation, safety analysis, or any real-world nuclear engineering decisions.

## Overview

This simulator models the core physics of a Pressurized Water Reactor (PWR) using simplified equations that capture the essential dynamics while remaining computationally tractable and numerically stable.

## State Variables

The reactor state vector consists of:

| Variable | Symbol | Units | Description |
|----------|--------|-------|-------------|
| Time | `t` | s | Simulation time |
| Power | `P` | unitless | Normalized reactor power (1.0 = nominal full power) |
| Precursors | `C[i]` | unitless | Delayed neutron precursor concentrations (6 groups) |
| Fuel Temperature | `Tf` | K | Lumped average fuel temperature |
| Coolant Temperature | `Tc` | K | Lumped average coolant temperature |

### Control Inputs

| Input | Type | Range | Description |
|-------|------|-------|-------------|
| `rod` | number | [0, 1] | Control rod position (0 = fully inserted, 1 = fully withdrawn) |
| `pumpOn` | boolean | - | Primary coolant pump status |
| `scram` | boolean | - | Emergency shutdown signal |

## Physics Model

### Point Kinetics Equations

The neutron population dynamics are modeled using the standard point kinetics equations:

```
dP/dt = ((ρ - β)/Λ) * P + Σ(λᵢ * Cᵢ)
dCᵢ/dt = (βᵢ/Λ) * P - λᵢ * Cᵢ
```

Where:
- `ρ` = total reactivity [Δk/k]
- `β` = total delayed neutron fraction (~0.0065 for U-235)
- `βᵢ` = delayed neutron fraction for group i
- `Λ` = prompt neutron generation time (~0.1 ms for thermal PWR)
- `λᵢ` = decay constant for precursor group i

### Reactivity Model

Total reactivity is computed as the sum of external and feedback components:

```
ρ = ρ_ext(rod, scram, t) + ρ_Doppler(Tf) + ρ_mod(Tc)
```

Where:
- `ρ_Doppler = αf * (Tf - Tf_ref)` — Fuel temperature (Doppler) feedback
- `ρ_mod = αc * (Tc - Tc_ref)` — Moderator temperature feedback
- `ρ_ext` = Control rod worth + scram insertion (time-dependent)

### Thermal Model

Lumped-parameter energy balance equations:

```
dTf/dt = (P * P_nom - h_fc * (Tf - Tc)) / (m_f * c_f)
dTc/dt = (h_fc * (Tf - Tc) - h_cool * (Tc - Tc_in)) / (m_c * c_c)
```

Where:
- `P_nom` = nominal thermal power (3000 MW_th)
- `h_fc` = fuel-to-coolant heat transfer coefficient × area
- `h_cool` = coolant-to-sink heat transfer (depends on pump status)
- `m_f, c_f` = fuel mass and specific heat
- `m_c, c_c` = coolant mass and specific heat

## Installation

```bash
# Install dependencies
npm install

# Or with specific packages
npm install typescript vitest @types/node
```

## Running Tests

```bash
# Run all tests
npx vitest run

# Run tests with coverage
npx vitest run --coverage

# Run tests in watch mode
npx vitest
```

## Running Benchmarks

```bash
# Compile TypeScript
npx tsc

# Run benchmarks
node dist/benchmarks.js

# Output as JSON
node dist/benchmarks.js --json
```

Or run directly with ts-node:

```bash
npx ts-node core/model/benchmarks.ts
npx ts-node core/model/benchmarks.ts --json
```

## Usage Example

```typescript
import {
  ReactorModel,
  createCriticalSteadyState,
} from './core/model/model';
import { DEFAULT_PARAMS } from './core/model/params';

// Create initial steady state at full power
const { state, rodPosition } = createCriticalSteadyState(1.0, DEFAULT_PARAMS, true);
const model = new ReactorModel(state, DEFAULT_PARAMS);

// Define control inputs
const controls = {
  rod: rodPosition,
  pumpOn: true,
  scram: false,
};

// Run simulation
const dt = 0.05; // 50 ms timestep
const duration = 60; // 60 seconds
const records = model.run(duration, dt, controls);

// Access results
console.log(`Final power: ${records[records.length - 1].P}`);
console.log(`Final Tf: ${records[records.length - 1].Tf} K`);
```

## Parameter Tuning Guide

### Reactivity Coefficients

| Parameter | Symbol | Typical Range | Effect |
|-----------|--------|---------------|--------|
| `alphaFuel` | αf | -5 to -2 pcm/K | Doppler feedback strength. More negative = stronger negative feedback = more stable. |
| `alphaCoolant` | αc | -50 to -5 pcm/K | Moderator feedback. Usually negative in PWRs. |

**Tuning tips:**
- If power oscillates too much, increase the magnitude of negative feedback coefficients
- If the reactor responds too slowly to rod changes, decrease feedback magnitude
- Typical values for PWR: αf ≈ -2.5 pcm/K, αc ≈ -15 pcm/K

### Kinetics Parameters

| Parameter | Symbol | Typical Value | Effect |
|-----------|--------|---------------|--------|
| `lambdaPrompt` | Λ | 10⁻⁴ to 10⁻⁵ s | Prompt neutron generation time. Smaller = faster response. |
| `betaI` | βᵢ | See params.ts | Delayed neutron fractions. Standard 6-group data for U-235. |
| `lambdaI` | λᵢ | See params.ts | Precursor decay constants. Standard 6-group data. |

**Tuning tips:**
- `Λ` is typically fixed by the moderator type (water ≈ 0.1 ms)
- Don't modify `βᵢ` or `λᵢ` unless modeling different fuel
- Total β ≈ 0.0065 for U-235

### Thermal Parameters

| Parameter | Typical Value | Effect |
|-----------|---------------|--------|
| `hFuelCoolant` | 25 MW/K | Heat transfer fuel → coolant. Higher = faster fuel cooling. |
| `hCoolantSinkPumpOn` | 30 MW/K | Heat removal with pump. Higher = better cooling. |
| `hCoolantSinkPumpOff` | 5 MW/K | Heat removal without pump (natural circulation). |
| `massFuel`, `cpFuel` | 80 t, 300 J/kg/K | Fuel thermal inertia. Higher = slower response. |
| `massCoolant`, `cpCoolant` | 25 t, 5500 J/kg/K | Coolant thermal inertia. |

**Tuning tips:**
- If temperatures change too quickly, increase thermal masses
- If pump trip doesn't cause enough temperature rise, decrease `hCoolantSinkPumpOff`
- Balance `hFuelCoolant` with `hCoolantSinkPumpOn` for realistic lag

### Control Rod Parameters

| Parameter | Typical Value | Effect |
|-----------|---------------|--------|
| `rodWorthMax` | 5000 pcm | Total rod worth. Higher = more control authority. |
| `scramReactivity` | -8000 pcm | Scram shutdown margin. More negative = faster shutdown. |
| `scramTau` | 1.0 s | Scram insertion time constant. Smaller = faster scram. |

## File Structure

```
core/model/
├── types.ts        # Type definitions
├── params.ts       # Physical parameters and defaults
├── guards.ts       # Validation and safety checks
├── model.ts        # Core simulation model
├── benchmarks.ts   # Benchmark scenarios
├── __tests__/
│   └── model.test.ts  # Regression tests
└── README.md       # This file
```

## Key Assumptions

1. **Point kinetics approximation**: Spatial neutron distribution is ignored; the reactor is treated as a single point.

2. **Lumped thermal model**: Fuel and coolant temperatures are averaged over the entire core.

3. **Constant inlet temperature**: The coolant inlet temperature is assumed constant.

4. **Simplified feedback**: Only Doppler and moderator temperature coefficients are modeled.

5. **No decay heat**: After shutdown, fission product decay heat is not modeled (power can go to zero).

6. **No xenon/samarium**: Fission product poisoning is not included.

7. **Instantaneous rod worth**: Rod worth changes instantly with position (no rod drop dynamics).

## Numerical Methods

Two integration methods are available:

1. **RK4 (default)**: Fourth-order Runge-Kutta. Stable for dt ≤ 0.2 s.
2. **Euler**: First-order explicit. Requires dt ≤ 0.01 s for stability.

RK4 is strongly recommended for all applications.

## Safety Guards

The model includes runtime safety checks:
- Rod position must be in [0, 1]
- Power is clamped to [P_min, P_max] with optional warnings
- Temperatures are clamped to safe ranges
- Timestep bounds are enforced based on integration method
- All parameters must be finite numbers

## License

Educational use only. See main project license.
