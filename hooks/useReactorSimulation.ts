"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ReactorModel,
  DEFAULT_PARAMS,
  createColdShutdownState,
  type ControlInputs,
  type ReactorState,
  type ReactivityComponents,
} from "../lib/reactor";

const DT = 0.01; // 10ms timestep for smooth simulation
const HISTORY_LENGTH = 500; // 5 seconds of history at 100 samples/s
const ROD_SPEED = 0.05; // 5%/second max rod movement rate
const BORON_RATE = 10; // 10 ppm/second max boron change rate
const HEATER_RATE = 0.5; // 50%/second max heater ramp rate
const SPRAY_RATE = 0.5; // 50%/second max spray ramp rate
const STEAM_DUMP_RATE = 0.3; // 30%/second max steam dump ramp rate
const FEEDWATER_RATE = 0.1; // 10%/second max feedwater ramp rate

export { DT, HISTORY_LENGTH, ROD_SPEED, BORON_RATE, HEATER_RATE, SPRAY_RATE, STEAM_DUMP_RATE, FEEDWATER_RATE };

export interface HistoryPoint {
  t: number;
  P: number;
  Tf: number;
  Tc: number;
  rho: number;
  decayHeatPercent: number;
  Ppzr: number;
}

/** Current control snapshot passed to callbacks. */
export interface ControlSnapshot {
  rod: number;
  pumpOn: boolean;
  scram: boolean;
  tripActive: boolean;
  boronConc: number;
  pressurizerHeater: number;
  pressurizerSpray: number;
  steamDump: number;
  feedwaterFlow: number;
}

/** Callback invoked after each animation frame with the latest state. */
export type OnTickCallback = (
  state: ReactorState,
  reactivity: ReactivityComponents,
  controls: ControlSnapshot,
  simDelta: number
) => void;

export interface UseReactorSimulationOptions {
  /** Called every animation frame with updated state (for metrics, live tracking, etc.) */
  onTick?: OnTickCallback;
  /** Called when a trip fires (for metrics recording) */
  onTrip?: (state: ReactorState, reason: string, controls: ControlSnapshot) => void;
  /** Called when simulation stops. Receives the final state (or null). */
  onStop?: (finalState: ReactorState | null) => void;
}

export interface SimulationControls {
  // State
  rod: number;
  pumpOn: boolean;
  scram: boolean;
  speed: number;
  isRunning: boolean;
  isPaused: boolean;
  state: ReactorState | null;
  reactivity: ReactivityComponents | null;
  history: HistoryPoint[];
  tripActive: boolean;
  tripReason: string | null;
  rodActual: number;
  boronConc: number;
  boronActual: number;
  pressurizerHeater: number;
  pressurizerHeaterActual: number;
  pressurizerSpray: number;
  pressurizerSprayActual: number;
  steamDump: number;
  steamDumpActual: number;
  feedwaterFlow: number;
  feedwaterFlowActual: number;

  // Actions
  setRod: (v: number | ((prev: number) => number)) => void;
  setPumpOn: (v: boolean | ((prev: boolean) => boolean)) => void;
  setBoronConc: (v: number | ((prev: number) => number)) => void;
  setPressurizerHeater: (v: number | ((prev: number) => number)) => void;
  setPressurizerSpray: (v: number | ((prev: number) => number)) => void;
  setSteamDump: (v: number | ((prev: number) => number)) => void;
  setFeedwaterFlow: (v: number | ((prev: number) => number)) => void;
  setSpeed: (v: number) => void;
  handleStart: () => void;
  handlePause: () => void;
  handleResume: () => void;
  handleStop: () => void;
  handleScram: () => void;
  handleResetTrip: () => void;
  handleReset: () => void;
  initializeModel: (initialState?: ReactorState, initialRod?: number, initialSpeed?: number, initialBoron?: number) => void;
}

export function useReactorSimulation(
  options: UseReactorSimulationOptions = {}
): SimulationControls {
  const { onTick, onTrip, onStop } = options;

  // Control states
  const [rod, setRod] = useState(0.0);
  const [pumpOn, setPumpOn] = useState(true);
  const [scram, setScram] = useState(false);
  const [speed, setSpeed] = useState(0.5);
  const [boronConc, setBoronConc] = useState(0);
  const [boronActual, setBoronActual] = useState(0);
  const [pressurizerHeater, setPressurizerHeater] = useState(0);
  const [pressurizerHeaterActual, setPressurizerHeaterActual] = useState(0);
  const [pressurizerSpray, setPressurizerSpray] = useState(0);
  const [pressurizerSprayActual, setPressurizerSprayActual] = useState(0);
  const [steamDump, setSteamDump] = useState(0);
  const [steamDumpActual, setSteamDumpActual] = useState(0);
  const [feedwaterFlow, setFeedwaterFlow] = useState(1);
  const [feedwaterFlowActual, setFeedwaterFlowActual] = useState(1);

  // Simulation states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [state, setState] = useState<ReactorState | null>(null);
  const [reactivity, setReactivity] = useState<ReactivityComponents | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [tripActive, setTripActive] = useState(false);
  const [tripReason, setTripReason] = useState<string | null>(null);
  const [rodActual, setRodActual] = useState(0.0);

  // Refs for animation
  const modelRef = useRef<ReactorModel | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  // Refs for real-time controls (avoid stale closures)
  const rodRef = useRef(rod);
  const pumpRef = useRef(pumpOn);
  const scramRef = useRef(scram);
  const tripActiveRef = useRef(tripActive);
  const rodActualRef = useRef(0.0);
  const boronRef = useRef(boronConc);
  const boronActualRef = useRef(0.0);
  const heaterRef = useRef(pressurizerHeater);
  const heaterActualRef = useRef(0.0);
  const sprayRef = useRef(pressurizerSpray);
  const sprayActualRef = useRef(0.0);
  const steamDumpRef = useRef(steamDump);
  const steamDumpActualRef = useRef(0.0);
  const feedwaterRef = useRef(feedwaterFlow);
  const feedwaterActualRef = useRef(1.0);

  // Keep callback refs fresh
  const onTickRef = useRef(onTick);
  const onTripRef = useRef(onTrip);
  const onStopRef = useRef(onStop);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onTripRef.current = onTrip; }, [onTrip]);
  useEffect(() => { onStopRef.current = onStop; }, [onStop]);

  // Keep refs in sync with state
  useEffect(() => { tripActiveRef.current = tripActive; }, [tripActive]);
  useEffect(() => { rodRef.current = rod; }, [rod]);
  useEffect(() => { pumpRef.current = pumpOn; }, [pumpOn]);
  useEffect(() => { scramRef.current = scram; }, [scram]);
  useEffect(() => { boronRef.current = boronConc; }, [boronConc]);
  useEffect(() => { heaterRef.current = pressurizerHeater; }, [pressurizerHeater]);
  useEffect(() => { sprayRef.current = pressurizerSpray; }, [pressurizerSpray]);
  useEffect(() => { steamDumpRef.current = steamDump; }, [steamDump]);
  useEffect(() => { feedwaterRef.current = feedwaterFlow; }, [feedwaterFlow]);

  // Protection system check
  const checkTrips = useCallback(
    (currentState: ReactorState): { trip: boolean; reason: string | null } => {
      if (currentState.P > 1.1) {
        return { trip: true, reason: "HIGH POWER >110%" };
      }
      if (currentState.Tf > 1800) {
        return { trip: true, reason: "HIGH FUEL TEMP >1800K" };
      }
      if (currentState.Tc > 620) {
        return { trip: true, reason: "HIGH COOLANT TEMP >620K" };
      }
      if (currentState.Ppzr > 16.5) {
        return { trip: true, reason: "HIGH PRESSURE >16.5 MPa" };
      }
      if (currentState.Ppzr < 12.0) {
        return { trip: true, reason: "LOW PRESSURE <12.0 MPa" };
      }
      return { trip: false, reason: null };
    },
    []
  );

  // Initialize model
  const initializeModel = useCallback(
    (initialState?: ReactorState, initialRod?: number, initialSpeed?: number, initialBoron?: number) => {
      const reactorState = initialState ?? createColdShutdownState(DEFAULT_PARAMS);
      const rodPos = initialRod ?? 0.0;
      const boron = initialBoron ?? 0;

      modelRef.current = new ReactorModel(reactorState, DEFAULT_PARAMS);
      setState(reactorState);
      setRod(rodPos);
      rodRef.current = rodPos;
      rodActualRef.current = rodPos;
      setRodActual(rodPos);
      setBoronConc(boron);
      boronRef.current = boron;
      boronActualRef.current = boron;
      setBoronActual(boron);
      setScram(false);
      scramRef.current = false;
      setPumpOn(true);
      pumpRef.current = true;
      setPressurizerHeater(0);
      heaterRef.current = 0;
      heaterActualRef.current = 0;
      setPressurizerHeaterActual(0);
      setPressurizerSpray(0);
      sprayRef.current = 0;
      sprayActualRef.current = 0;
      setPressurizerSprayActual(0);
      setSteamDump(0);
      steamDumpRef.current = 0;
      steamDumpActualRef.current = 0;
      setSteamDumpActual(0);
      setFeedwaterFlow(1);
      feedwaterRef.current = 1;
      feedwaterActualRef.current = 1;
      setFeedwaterFlowActual(1);
      setTripActive(false);
      tripActiveRef.current = false;
      setTripReason(null);

      const totalDecayHeat = reactorState.decayHeat.reduce((sum, d) => sum + d, 0);
      setHistory([
        {
          t: 0,
          P: reactorState.P,
          Tf: reactorState.Tf,
          Tc: reactorState.Tc,
          rho: 0,
          decayHeatPercent: totalDecayHeat * 100,
          Ppzr: reactorState.Ppzr,
        },
      ]);

      if (initialSpeed !== undefined) {
        setSpeed(initialSpeed);
      }

      const controls: ControlInputs = {
        rod: rodPos, pumpOn: true, scram: false, boronConc: boron,
        pressurizerHeater: 0, pressurizerSpray: 0, steamDump: 0, feedwaterFlow: 1,
      };
      const rho = modelRef.current.getReactivity(controls);
      setReactivity(rho);
    },
    []
  );

  // Animation loop
  const tick = useCallback(
    (timestamp: number) => {
      if (!modelRef.current) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isPaused) {
        lastTimeRef.current = 0;
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const simDelta = (deltaMs / 1000) * speed;
      accumulatedRef.current += simDelta;

      const stepsNeeded = Math.floor(accumulatedRef.current / DT);
      accumulatedRef.current -= stepsNeeded * DT;

      // Rate-limit rod movement
      const rodTarget = rodRef.current;
      const rodActualNow = rodActualRef.current;
      const maxDelta = ROD_SPEED * simDelta;
      rodActualRef.current =
        rodActualNow +
        Math.max(-maxDelta, Math.min(maxDelta, rodTarget - rodActualNow));

      // Rate-limit boron changes
      const boronTarget = boronRef.current;
      const boronActualNow = boronActualRef.current;
      const maxBoronDelta = BORON_RATE * simDelta;
      boronActualRef.current =
        boronActualNow +
        Math.max(-maxBoronDelta, Math.min(maxBoronDelta, boronTarget - boronActualNow));

      // Rate-limit pressurizer heater
      const heaterTarget = heaterRef.current;
      const maxHeaterDelta = HEATER_RATE * simDelta;
      heaterActualRef.current =
        heaterActualRef.current +
        Math.max(-maxHeaterDelta, Math.min(maxHeaterDelta, heaterTarget - heaterActualRef.current));

      // Rate-limit pressurizer spray
      const sprayTarget = sprayRef.current;
      const maxSprayDelta = SPRAY_RATE * simDelta;
      sprayActualRef.current =
        sprayActualRef.current +
        Math.max(-maxSprayDelta, Math.min(maxSprayDelta, sprayTarget - sprayActualRef.current));

      // Rate-limit steam dump
      const steamDumpTarget = steamDumpRef.current;
      const maxSteamDumpDelta = STEAM_DUMP_RATE * simDelta;
      steamDumpActualRef.current =
        steamDumpActualRef.current +
        Math.max(-maxSteamDumpDelta, Math.min(maxSteamDumpDelta, steamDumpTarget - steamDumpActualRef.current));

      // Rate-limit feedwater flow
      const feedwaterTarget = feedwaterRef.current;
      const maxFeedwaterDelta = FEEDWATER_RATE * simDelta;
      feedwaterActualRef.current =
        feedwaterActualRef.current +
        Math.max(-maxFeedwaterDelta, Math.min(maxFeedwaterDelta, feedwaterTarget - feedwaterActualRef.current));

      let currentScram = scramRef.current;
      const controls: ControlInputs = {
        rod: rodActualRef.current,
        pumpOn: pumpRef.current,
        scram: currentScram,
        boronConc: boronActualRef.current,
        pressurizerHeater: heaterActualRef.current,
        pressurizerSpray: sprayActualRef.current,
        steamDump: steamDumpActualRef.current,
        feedwaterFlow: feedwaterActualRef.current,
      };

      try {
        for (let i = 0; i < stepsNeeded; i++) {
          const newState = modelRef.current.step(DT, {
            ...controls,
            scram: currentScram,
          });

          if (!tripActiveRef.current && !currentScram) {
            const { trip, reason } = checkTrips(newState);
            if (trip) {
              setTripActive(true);
              tripActiveRef.current = true;
              setTripReason(reason);
              setScram(true);
              scramRef.current = true;
              setRod(0);
              rodRef.current = 0;
              rodActualRef.current = 0;
              currentScram = true;

              onTripRef.current?.(newState, reason!, {
                rod: rodRef.current,
                pumpOn: pumpRef.current,
                scram: true,
                tripActive: true,
                boronConc: boronActualRef.current,
                pressurizerHeater: heaterActualRef.current,
                pressurizerSpray: sprayActualRef.current,
                steamDump: steamDumpActualRef.current,
                feedwaterFlow: feedwaterActualRef.current,
              });
            }
          }
        }
      } catch (error) {
        console.error("Simulation error:", error);
        setTripActive(true);
        tripActiveRef.current = true;
        setTripReason("SIMULATION ERROR");
        setScram(true);
        scramRef.current = true;
        setRod(0);
        rodRef.current = 0;
        rodActualRef.current = 0;
        handleStop();
        return;
      }

      const currentState = modelRef.current.getState();
      const currentReactivity = modelRef.current.getReactivity(controls);

      setState(currentState);
      setReactivity(currentReactivity);
      setRodActual(rodActualRef.current);
      setBoronActual(boronActualRef.current);
      setPressurizerHeaterActual(heaterActualRef.current);
      setPressurizerSprayActual(sprayActualRef.current);
      setSteamDumpActual(steamDumpActualRef.current);
      setFeedwaterFlowActual(feedwaterActualRef.current);

      // Notify consumer
      onTickRef.current?.(currentState, currentReactivity, {
        rod: rodRef.current,
        pumpOn: pumpRef.current,
        scram: scramRef.current,
        tripActive: tripActiveRef.current,
        boronConc: boronActualRef.current,
        pressurizerHeater: heaterActualRef.current,
        pressurizerSpray: sprayActualRef.current,
        steamDump: steamDumpActualRef.current,
        feedwaterFlow: feedwaterActualRef.current,
      }, simDelta);

      // Update history
      const totalDH = currentState.decayHeat.reduce((sum, d) => sum + d, 0);
      setHistory((prev) => {
        const newPoint: HistoryPoint = {
          t: currentState.t,
          P: currentState.P,
          Tf: currentState.Tf,
          Tc: currentState.Tc,
          rho: currentReactivity.rhoTotal,
          decayHeatPercent: totalDH * 100,
          Ppzr: currentState.Ppzr,
        };
        const updated = [...prev, newPoint];
        return updated.slice(-HISTORY_LENGTH);
      });

      animationRef.current = requestAnimationFrame(tick);
    },
    [isPaused, speed, checkTrips]
  );

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    lastTimeRef.current = 0;
  }, []);

  const handleStop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    const finalState = modelRef.current?.getState() ?? null;
    onStopRef.current?.(finalState);
  }, []);

  const handleScram = useCallback(() => {
    setScram(true);
    scramRef.current = true;
    setRod(0);
    rodRef.current = 0;
    rodActualRef.current = 0;
    setTripActive(true);
    tripActiveRef.current = true;
    setTripReason("MANUAL SCRAM");
  }, []);

  const handleResetTrip = useCallback(() => {
    setScram(false);
    scramRef.current = false;
    setTripActive(false);
    tripActiveRef.current = false;
    setTripReason(null);
  }, []);

  const handleReset = useCallback(() => {
    handleStop();
    initializeModel();
  }, [handleStop, initializeModel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    rod,
    pumpOn,
    scram,
    speed,
    isRunning,
    isPaused,
    state,
    reactivity,
    history,
    tripActive,
    tripReason,
    rodActual,
    boronConc,
    boronActual,
    pressurizerHeater,
    pressurizerHeaterActual,
    pressurizerSpray,
    pressurizerSprayActual,
    steamDump,
    steamDumpActual,
    feedwaterFlow,
    feedwaterFlowActual,
    setRod,
    setPumpOn,
    setBoronConc,
    setPressurizerHeater,
    setPressurizerSpray,
    setSteamDump,
    setFeedwaterFlow,
    setSpeed,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleScram,
    handleResetTrip,
    handleReset,
    initializeModel,
  };
}
