"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createCriticalSteadyState,
  DEFAULT_PARAMS,
} from "../../lib/reactor";
import { useReactorSimulation, HISTORY_LENGTH } from "../../hooks/useReactorSimulation";
import {
  TripBanner,
  SimControlBar,
  SpeedControl,
  ControlRodSlider,
  PumpScramControls,
  BoronControl,
  PowerDisplay,
  PowerHistoryGraph,
  TemperatureMetrics,
  ReactivityPanel,
} from "../../components/simulator";

export default function SimulatorPage() {
  const {
    rod, setRod, pumpOn, setPumpOn, speed, setSpeed,
    isRunning, isPaused, state, reactivity, history,
    tripActive, tripReason, rodActual,
    boronConc, boronActual, setBoronConc,
    handleStart, handlePause, handleResume, handleStop, handleScram,
    initializeModel,
  } = useReactorSimulation();

  // Initialize with critical steady state (not cold shutdown)
  const initCritical = useCallback(() => {
    const { state: initialState, rodPosition } = createCriticalSteadyState(
      0.2, DEFAULT_PARAMS, true
    );
    initializeModel(initialState, rodPosition, 1);
  }, [initializeModel]);

  useEffect(() => {
    initCritical();
  }, [initCritical]);

  // Override reset to reinitialize with critical state
  const handleResetSim = useCallback(() => {
    handleStop();
    initCritical();
  }, [handleStop, initCritical]);

  // Computed values
  const power = state ? state.P * 100 : 100;
  const fuelTemp = state ? state.Tf : 600;
  const coolantTemp = state ? state.Tc : 560;
  const simTime = state ? state.t : 0;
  const decayHeatPercent = state ? state.decayHeat.reduce((sum, d) => sum + d, 0) * 100 : 0;

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <main style={container}>
        <header style={header}>
          <div style={breadcrumbs}>
            <Link href="/" style={breadcrumbLink}>HOME</Link>
            <span style={breadcrumbSeparator}>/</span>
            <span style={breadcrumbCurrent}>SIMULATOR</span>
          </div>
          <div style={headerRow}>
            <div>
              <h1 style={title}>Core Reactor Simulator</h1>
              <p style={subtitle}>
                Real-time point kinetics simulation with thermal feedback
              </p>
            </div>
            <div style={statusBadge(isRunning, isPaused, tripActive)}>
              {tripActive ? "TRIP" : isRunning ? (isPaused ? "PAUSED" : "RUNNING") : "READY"}
            </div>
          </div>
        </header>

        <TripBanner
          tripActive={tripActive}
          tripReason={tripReason}
          variant="legacy"
        />

        <section style={layout}>
          {/* Left Column - Controls */}
          <div style={controlColumn}>
            <div style={panelHeader}>
              <div style={panelIndicator(isRunning && !isPaused)} />
              <span style={panelTitle}>CORE INPUTS</span>
            </div>

            <SimControlBar
              isRunning={isRunning}
              isPaused={isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onReset={handleResetSim}
              colorTheme="orange"
            />

            <SpeedControl speed={speed} onSpeedChange={setSpeed} colorTheme="orange" />

            <ControlRodSlider
              rod={rod}
              rodActual={rodActual}
              onRodChange={setRod}
              disabled={tripActive}
              tripActive={tripActive}
              colorTheme="orange"
            />

            <PumpScramControls
              pumpOn={pumpOn}
              tripActive={tripActive}
              onPumpToggle={() => setPumpOn(v => !v)}
              onScram={handleScram}
              scramDisabled={tripActive}
              colorTheme="orange"
            />

            <BoronControl
              boronConc={boronConc}
              boronActual={boronActual}
              onBoronChange={setBoronConc}
              colorTheme="orange"
            />

            {/* Quick Guide */}
            <div style={hintBox}>
              <div style={hintTitle}>Quick Guide</div>
              <ul style={hintList as React.CSSProperties}>
                <li>Start simulation, then slowly withdraw rods to increase power</li>
                <li>Watch thermal feedback stabilize the reactor</li>
                <li>Trip pump to see coolant temperature rise</li>
                <li>Protection system auto-trips at 110% power</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Displays */}
          <div style={displayColumn}>
            <PowerDisplay power={power} decayHeat={decayHeatPercent} colorTheme="orange" />
            <PowerHistoryGraph
              history={history}
              historyLength={HISTORY_LENGTH}
              simTime={simTime}
              colorTheme="orange"
            />
            <TemperatureMetrics fuelTemp={fuelTemp} coolantTemp={coolantTemp} colorTheme="orange" />
            <ReactivityPanel reactivity={reactivity} colorTheme="orange" />
          </div>
        </section>
      </main>
    </>
  );
}

// ============================================================================
// PAGE-SPECIFIC STYLES (layout, header, breadcrumbs)
// ============================================================================

const container: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "24px",
};

const header: React.CSSProperties = {
  marginBottom: "20px",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const breadcrumbs: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  fontSize: "11px",
  letterSpacing: "1px",
  color: "#888",
  marginBottom: "8px",
};

const breadcrumbLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#ff9900",
};

const breadcrumbSeparator: React.CSSProperties = { opacity: 0.6 };
const breadcrumbCurrent: React.CSSProperties = { color: "#aaa" };

const title: React.CSSProperties = {
  fontSize: "28px",
  margin: "0 0 4px",
  color: "#ff9900",
  letterSpacing: "2px",
};

const subtitle: React.CSSProperties = {
  fontSize: "13px",
  color: "#888",
  margin: 0,
};

const statusBadge = (running: boolean, paused: boolean, trip: boolean): React.CSSProperties => ({
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1px",
  background: trip ? "rgba(255, 0, 0, 0.2)" : running ? (paused ? "rgba(255, 170, 0, 0.2)" : "rgba(0, 255, 0, 0.2)") : "rgba(255, 255, 255, 0.1)",
  color: trip ? "#ff5555" : running ? (paused ? "#ffaa00" : "#00ff00") : "#888",
  border: `1px solid ${trip ? "#ff0000" : running ? (paused ? "#ffaa00" : "#00ff00") : "#444"}`,
});

const layout: React.CSSProperties = {
  display: "flex",
  gap: "24px",
  flexWrap: "wrap",
};

const controlColumn: React.CSSProperties = {
  flex: "1 1 320px",
  minWidth: "300px",
};

const displayColumn: React.CSSProperties = {
  flex: "2 1 500px",
  minWidth: "400px",
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
};

const panelIndicator = (active: boolean): React.CSSProperties => ({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: active ? "#00ff00" : "#444",
  boxShadow: active ? "0 0 8px #00ff00" : "none",
});

const panelTitle: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "2px",
  color: "#ff9900",
  fontWeight: "bold",
};

const hintBox: React.CSSProperties = {
  padding: "12px",
  borderRadius: "4px",
  border: "1px solid #333",
  background: "rgba(0, 0, 0, 0.4)",
};

const hintTitle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "1px",
  color: "#ff9900",
  marginBottom: "8px",
};

const hintList: React.CSSProperties = {
  margin: 0,
  paddingLeft: "16px",
  fontSize: "11px",
  color: "#888",
  lineHeight: 1.6,
};
