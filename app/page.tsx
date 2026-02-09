"use client";

import React, { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import {
  useReactorSimulation,
  HISTORY_LENGTH,
} from "../hooks/useReactorSimulation";
import {
  TripBanner,
  TripResetControls,
  SimControlBar,
  SpeedControl,
  ControlRodSlider,
  PumpScramControls,
  BoronControl,
  PowerDisplay,
  PowerHistoryGraph,
  TemperatureMetrics,
  ReactivityPanel,
} from "../components/simulator";

export default function SimulatorPage() {
  const [learningMode, setLearningMode] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const {
    rod, pumpOn, speed,
    isRunning, isPaused,
    state, reactivity, history,
    tripActive, tripReason, rodActual,
    boronConc, boronActual,
    setRod, setPumpOn, setBoronConc, setSpeed,
    handleStart, handlePause, handleResume,
    handleStop, handleScram, handleResetTrip, handleReset,
    initializeModel,
  } = useReactorSimulation();

  // Initialize on mount
  useEffect(() => {
    try {
      setInitError(null);
      initializeModel();
    } catch (error) {
      console.error("Initialization error:", error);
      setInitError(error instanceof Error ? error.message : "Failed to initialize reactor model");
    }
  }, [initializeModel]);

  // Computed values
  const power = state ? state.P * 100 : 0.01;
  const fuelTemp = state ? state.Tf : 500;
  const coolantTemp = state ? state.Tc : 500;
  const simTime = state ? state.t : 0;
  const decayHeatPercent = state ? state.decayHeat.reduce((sum, d) => sum + d, 0) * 100 : 0;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
          50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <NavigationBar />

      <main style={container}>
        <header style={header}>
          <div style={headerRow}>
            <div style={titleContainer}>
              <img src="/logo.png" alt="U-FORCE Logo" style={logoIcon} />
              <div>
                <h1 style={title}>U-FORCE Reactor Simulator</h1>
                <p style={subtitle}>
                  Free Play Mode - Real-time point kinetics simulation
                </p>
              </div>
            </div>
            <div style={statusBadge(isRunning, isPaused, tripActive)}>
              {tripActive ? "TRIP" : isRunning ? (isPaused ? "PAUSED" : "RUNNING") : "READY"}
            </div>
          </div>
        </header>

        <TripBanner
          tripActive={tripActive}
          tripReason={tripReason}
          initError={initError}
          variant="freeplay"
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
              onReset={handleReset}
            />

            <TripResetControls
              tripActive={tripActive}
              onResetTrip={handleResetTrip}
              variant="freeplay"
            />

            <SpeedControl speed={speed} onSpeedChange={setSpeed} />

            {/* Learning Mode Toggle */}
            <div style={learningModeSection}>
              <button
                style={learningModeButton(learningMode)}
                onClick={() => setLearningMode(!learningMode)}
              >
                <span>💡 LEARNING MODE</span>
                <span style={learningMode ? statusOn : statusOff}>
                  {learningMode ? "ON" : "OFF"}
                </span>
              </button>
              {learningMode && (
                <div style={learningHint}>
                  Learning mode shows helpful tips about each control. Perfect for beginners!
                </div>
              )}
            </div>

            <ControlRodSlider
              rod={rod}
              rodActual={rodActual}
              onRodChange={setRod}
              disabled={false}
              tripActive={tripActive}
              showActiveHint
              showScramHint
            >
              {learningMode && (
                <div style={learningHint}>
                  💡 <strong>Control Rods:</strong> Absorb neutrons to control the fission chain reaction.
                  Inserting rods (lower %) reduces power. Withdrawing rods (higher %) increases power.
                  Move slowly to maintain control!
                </div>
              )}
            </ControlRodSlider>

            <PumpScramControls
              pumpOn={pumpOn}
              tripActive={tripActive}
              onPumpToggle={() => setPumpOn(v => !v)}
              onScram={handleScram}
              scramDisabled={false}
            >
              {learningMode && (
                <div style={controlGroup}>
                  <div style={learningHint}>
                    💡 <strong>Primary Pump:</strong> Circulates coolant through the reactor core to remove heat.
                    Turning OFF the pump reduces cooling efficiency - temperatures will rise!
                  </div>
                  <div style={{...learningHint, marginTop: "8px"}}>
                    💡 <strong>SCRAM:</strong> Emergency shutdown button. Instantly inserts all control rods to 0%
                    and stops the chain reaction. Use this if power or temperature gets too high!
                  </div>
                </div>
              )}
            </PumpScramControls>

            <BoronControl
              boronConc={boronConc}
              boronActual={boronActual}
              onBoronChange={setBoronConc}
            >
              {learningMode && (
                <div style={learningHint}>
                  💡 <strong>Soluble Boron:</strong> Boric acid dissolved in coolant absorbs neutrons for long-term
                  reactivity control. Increasing boron adds negative reactivity. Real PWRs use boron to compensate
                  for fuel burnup over months of operation.
                </div>
              )}
            </BoronControl>

            {/* Quick Guide */}
            <div style={hintBox}>
              <div style={hintTitle}>Quick Guide</div>
              <ul style={hintList as React.CSSProperties}>
                <li>Start simulation, then adjust rod slider in real-time</li>
                <li>Slowly withdraw rods (drag right) to increase power</li>
                <li>Watch thermal feedback stabilize the reactor</li>
                <li>All controls work during simulation - just like a real control room</li>
                <li>Protection system auto-trips at 110% power</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Displays */}
          <div style={displayColumn}>
            <PowerDisplay power={power} decayHeat={decayHeatPercent}>
              {learningMode && (
                <div style={{...learningHint, marginTop: "12px"}}>
                  💡 <strong>Reactor Power:</strong> Shows how much thermal energy the reactor is producing.
                  100% = 3000 MWth (3 billion watts). Power above 110% triggers automatic shutdown!
                </div>
              )}
            </PowerDisplay>

            <PowerHistoryGraph
              history={history}
              historyLength={HISTORY_LENGTH}
              simTime={simTime}
            />

            <TemperatureMetrics fuelTemp={fuelTemp} coolantTemp={coolantTemp}>
              {learningMode && (
                <div style={learningHint}>
                  💡 <strong>Temperatures:</strong> Fuel heats up from fission. Coolant removes this heat.
                  As temperatures rise, negative feedback reduces reactivity - this is the reactor's natural safety mechanism!
                </div>
              )}
            </TemperatureMetrics>

            <ReactivityPanel reactivity={reactivity}>
              {learningMode && (
                <div style={{...learningHint, marginTop: "12px"}}>
                  💡 <strong>Reactivity:</strong> Measures the balance of the chain reaction in "pcm" (parts per million).
                  Positive = power rising, Negative = power falling, Zero = stable.
                  External = rod position, Doppler & Moderator = temperature feedback effects.
                </div>
              )}
            </ReactivityPanel>
          </div>
        </section>
      </main>
    </>
  );
}

// ============================================================================
// PAGE-SPECIFIC STYLES (layout, header, learning mode)
// ============================================================================

const container: React.CSSProperties = {
  maxWidth: "100vw",
  minHeight: "100vh",
  margin: "0",
  padding: "16px",
  paddingTop: "76px",
  background: "#0f1419",
  position: "relative",
};

const header: React.CSSProperties = {
  marginBottom: "16px",
  background: "rgba(20, 25, 30, 0.8)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "6px",
  padding: "12px 20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  position: "relative",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const titleContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const logoIcon: React.CSSProperties = {
  width: "42px",
  height: "42px",
  filter: "brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(2000%) hue-rotate(0deg) brightness(98%) contrast(101%)",
  animation: "glow 3s ease-in-out infinite",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  margin: "0 0 2px",
  color: "#10b981",
  letterSpacing: "0px",
  textTransform: "none",
  fontFamily: "'Inter', sans-serif",
};

const subtitle: React.CSSProperties = {
  fontSize: "11px",
  color: "#6f6",
  margin: 0,
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "1px",
};

const statusBadge = (running: boolean, paused: boolean, trip: boolean): React.CSSProperties => ({
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "bold",
  letterSpacing: "0.5px",
  fontFamily: "'Inter', sans-serif",
  background: trip
    ? "rgba(239, 68, 68, 0.2)"
    : running
      ? (paused ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)")
      : "rgba(100, 116, 139, 0.2)",
  color: trip ? "#ef4444" : running ? (paused ? "#f59e0b" : "#10b981") : "#94a3b8",
  border: `1px solid ${trip ? "#ef4444" : running ? (paused ? "#f59e0b" : "#10b981") : "#64748b"}`,
  animation: trip ? "blink 0.5s infinite" : "none",
});

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "400px 1fr",
  gap: "16px",
  minHeight: "calc(100vh - 120px)",
};

const controlColumn: React.CSSProperties = {
  background: "rgba(20, 25, 30, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  position: "relative",
};

const displayColumn: React.CSSProperties = {
  background: "rgba(20, 25, 30, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "6px",
  padding: "20px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  position: "relative",
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  padding: "8px 12px",
  background: "rgba(15, 20, 25, 0.4)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "6px",
};

const panelIndicator = (active: boolean): React.CSSProperties => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: active ? "#10b981" : "#374151",
  boxShadow: active ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
  border: active ? "2px solid #6ee7b7" : "2px solid #4b5563",
});

const panelTitle: React.CSSProperties = {
  fontSize: "13px",
  letterSpacing: "0.5px",
  color: "#6ee7b7",
  fontWeight: "bold",
  fontFamily: "'Inter', sans-serif",
  textTransform: "none",
  flex: 1,
};

const learningModeSection: React.CSSProperties = {
  marginBottom: "16px",
  padding: "12px",
  background: "rgba(0, 255, 170, 0.05)",
  border: "1px solid rgba(0, 255, 170, 0.2)",
  borderRadius: "6px",
};

const learningModeButton = (active: boolean): React.CSSProperties => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  borderRadius: "3px",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "1.5px",
  fontFamily: "'Inter', sans-serif",
  textTransform: "none",
  cursor: "pointer",
  border: active ? "2px solid #6ee7b7" : "2px solid #444",
  background: active
    ? "linear-gradient(180deg, rgba(0, 255, 170, 0.2) 0%, rgba(0, 255, 170, 0.1) 100%)"
    : "linear-gradient(180deg, #333 0%, #222 100%)",
  color: active ? "#6ee7b7" : "#888",
  boxShadow: active
    ? "0 0 15px rgba(0, 255, 170, 0.4), 0 4px 0 rgba(0,0,0,0.3)"
    : "0 4px 0 rgba(0,0,0,0.3)",
  transition: "all 0.2s",
});

const learningHint: React.CSSProperties = {
  marginTop: "12px",
  padding: "10px",
  background: "rgba(0, 255, 170, 0.1)",
  border: "1px solid rgba(0, 255, 170, 0.3)",
  borderRadius: "3px",
  fontSize: "11px",
  color: "#6ee7b7",
  lineHeight: 1.6,
  fontFamily: "'Inter', sans-serif",
};

const statusOn: React.CSSProperties = {
  fontSize: "12px",
  color: "#10b981",
  fontWeight: "bold",
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "1px",
};

const statusOff: React.CSSProperties = {
  fontSize: "12px",
  color: "#ff5555",
  fontWeight: "bold",
  fontFamily: "'Inter', sans-serif",
  letterSpacing: "1px",
};

const controlGroup: React.CSSProperties = {
  marginBottom: "16px",
};

const hintBox: React.CSSProperties = {
  padding: "12px",
  borderRadius: "6px",
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
