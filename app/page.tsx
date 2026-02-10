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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [displaysExpanded, setDisplaysExpanded] = useState(true);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          background: #000;
          margin: 0;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
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
        {/* Top Status Bar */}
        <div style={topBar}>
          <div style={topBarLeft}>
            <img src="/logo.png" alt="U-FORCE" style={topBarLogo} />
            <div>
              <div style={topBarTitle}>U-FORCE Reactor Simulator</div>
              <div style={topBarSubtitle}>Free Play Mode</div>
            </div>
          </div>
          <div style={statusBadge(isRunning, isPaused, tripActive)}>
            {tripActive ? "⚠ TRIP" : isRunning ? (isPaused ? "⏸ PAUSED" : "▶ RUNNING") : "● READY"}
          </div>
        </div>

        {/* Trip Banner */}
        {(tripActive || initError) && (
          <div style={tripBannerOverlay}>
            <TripBanner
              tripActive={tripActive}
              tripReason={tripReason}
              initError={initError}
              variant="freeplay"
            />
          </div>
        )}

        {/* Three Column Layout: Left Controls | Center Displays | Right Controls */}
        <div style={mainLayout}>
          {/* LEFT PANEL - Primary Controls */}
          <div style={leftPanel}>
            <div style={panelHeader}>
              <span style={panelTitle}>PRIMARY CONTROLS</span>
            </div>

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
          </div>

          {/* CENTER PANEL - Main Displays (Control Board) */}
          <div style={centerPanel}>
            <div style={controlBoardHeader}>
              <div style={controlBoardTitle}>REACTOR CONTROL BOARD</div>
              <div style={controlBoardSubtitle}>Main Instrumentation Panel</div>
            </div>

            <div style={displayGrid}>
              {/* Top Row - Power Display */}
              <div style={gridFullWidth}>
                <PowerDisplay power={power} decayHeat={decayHeatPercent}>
                  {learningMode && (
                    <div style={{...learningHint, marginTop: "12px"}}>
                      💡 <strong>Reactor Power:</strong> Shows how much thermal energy the reactor is producing.
                      100% = 3000 MWth (3 billion watts). Power above 110% triggers automatic shutdown!
                    </div>
                  )}
                </PowerDisplay>
              </div>

              {/* Middle Row - Power History */}
              <div style={gridFullWidth}>
                <PowerHistoryGraph
                  history={history}
                  historyLength={HISTORY_LENGTH}
                  simTime={simTime}
                />
              </div>

              {/* Bottom Row - Temperature and Reactivity */}
              <div style={gridHalfWidth}>
                <TemperatureMetrics fuelTemp={fuelTemp} coolantTemp={coolantTemp}>
                  {learningMode && (
                    <div style={learningHint}>
                      💡 <strong>Temperatures:</strong> Fuel heats up from fission. Coolant removes this heat.
                      As temperatures rise, negative feedback reduces reactivity - this is the reactor's natural safety mechanism!
                    </div>
                  )}
                </TemperatureMetrics>
              </div>

              <div style={gridHalfWidth}>
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
            </div>
          </div>

          {/* RIGHT PANEL - Status & Information */}
          <div style={rightPanel}>
            <div style={panelHeader}>
              <span style={panelTitle}>STATUS & INFO</span>
            </div>

            {/* Quick Status Cards */}
            <div style={statusCardsContainer}>
              <div style={statusCard}>
                <div style={statusCardLabel}>POWER LEVEL</div>
                <div style={statusCardValue(power > 100 ? 'danger' : power > 80 ? 'warning' : 'normal')}>
                  {power.toFixed(1)}%
                </div>
              </div>

              <div style={statusCard}>
                <div style={statusCardLabel}>FUEL TEMP</div>
                <div style={statusCardValue(fuelTemp > 1600 ? 'danger' : fuelTemp > 1200 ? 'warning' : 'normal')}>
                  {fuelTemp.toFixed(0)} K
                </div>
              </div>

              <div style={statusCard}>
                <div style={statusCardLabel}>COOLANT TEMP</div>
                <div style={statusCardValue(coolantTemp > 600 ? 'danger' : coolantTemp > 550 ? 'warning' : 'normal')}>
                  {coolantTemp.toFixed(0)} K
                </div>
              </div>

              <div style={statusCard}>
                <div style={statusCardLabel}>SIM TIME</div>
                <div style={statusCardValue('normal')}>
                  {Math.floor(simTime / 60)}:{(simTime % 60).toFixed(0).padStart(2, '0')}
                </div>
              </div>

              <div style={statusCard}>
                <div style={statusCardLabel}>ROD POSITION</div>
                <div style={statusCardValue('normal')}>
                  {(rodActual * 100).toFixed(1)}%
                </div>
              </div>

              <div style={statusCard}>
                <div style={statusCardLabel}>PUMP STATUS</div>
                <div style={statusCardValue(pumpOn ? 'normal' : 'danger')}>
                  {pumpOn ? 'RUNNING' : 'OFF'}
                </div>
              </div>
            </div>

            {/* Quick Guide */}
            <div style={hintBox}>
              <div style={hintTitle}>💡 QUICK GUIDE</div>
              <ul style={hintList as React.CSSProperties}>
                <li>Start simulation, then adjust controls</li>
                <li>Withdraw rods slowly to increase power</li>
                <li>Monitor feedback effects</li>
                <li>SCRAM available for emergencies</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ============================================================================
// STYLES - Control Room Layout
// ============================================================================

const container: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: 'linear-gradient(180deg, #0a0f14 0%, #121820 100%)',
};

const topBar: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '60px',
  background: 'rgba(10, 15, 20, 0.95)',
  borderBottom: '2px solid rgba(16, 185, 129, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  zIndex: 100,
  boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
};

const topBarLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const topBarLogo: React.CSSProperties = {
  width: '36px',
  height: '36px',
  filter: 'brightness(0) saturate(100%) invert(60%) sepia(98%) saturate(2000%) hue-rotate(0deg) brightness(98%) contrast(101%)',
};

const topBarTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#10b981',
  fontFamily: "'Inter', sans-serif",
  margin: 0,
  letterSpacing: '0.5px',
};

const topBarSubtitle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6ee7b7',
  fontFamily: "'Inter', sans-serif",
  opacity: 0.8,
  letterSpacing: '0.5px',
};

const statusBadge = (running: boolean, paused: boolean, trip: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  fontFamily: "'Inter', sans-serif",
  background: trip
    ? 'rgba(239, 68, 68, 0.2)'
    : running
      ? (paused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)')
      : 'rgba(100, 116, 139, 0.2)',
  color: trip ? '#ef4444' : running ? (paused ? '#f59e0b' : '#10b981') : '#94a3b8',
  border: `2px solid ${trip ? '#ef4444' : running ? (paused ? '#f59e0b' : '#10b981') : '#64748b'}`,
  animation: trip ? 'blink 0.5s infinite' : 'none',
  boxShadow: trip ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
});

const tripBannerOverlay: React.CSSProperties = {
  position: 'fixed',
  top: '70px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 90,
  maxWidth: '800px',
  width: '90%',
};

const mainLayout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr 320px',
  gap: '16px',
  padding: '16px',
  paddingTop: '76px',
  height: 'calc(100vh - 60px)',
  marginTop: '60px',
};

const leftPanel: React.CSSProperties = {
  background: 'rgba(15, 20, 25, 0.8)',
  border: '2px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '8px',
  padding: '16px',
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
};

const centerPanel: React.CSSProperties = {
  background: 'rgba(15, 20, 25, 0.6)',
  border: '2px solid rgba(16, 185, 129, 0.4)',
  borderRadius: '8px',
  padding: '20px',
  overflowY: 'auto',
  boxShadow: '0 4px 30px rgba(0,0,0,0.5), inset 0 0 60px rgba(16, 185, 129, 0.05)',
};

const rightPanel: React.CSSProperties = {
  background: 'rgba(15, 20, 25, 0.8)',
  border: '2px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '8px',
  padding: '16px',
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
};

const panelHeader: React.CSSProperties = {
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
};

const panelTitle: React.CSSProperties = {
  fontSize: '13px',
  letterSpacing: '1.5px',
  color: '#6ee7b7',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

const controlBoardHeader: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '3px solid rgba(16, 185, 129, 0.4)',
};

const controlBoardTitle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#10b981',
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '2px',
  marginBottom: '4px',
  textTransform: 'uppercase',
};

const controlBoardSubtitle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6ee7b7',
  fontFamily: "'Inter', sans-serif",
  opacity: 0.7,
  letterSpacing: '1px',
};

const displayGrid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const gridFullWidth: React.CSSProperties = {
  width: '100%',
};

const gridHalfWidth: React.CSSProperties = {
  width: '100%',
  display: 'inline-block',
};

const statusCardsContainer: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '12px',
  marginBottom: '16px',
};

const statusCard: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '6px',
  padding: '12px',
};

const statusCardLabel: React.CSSProperties = {
  fontSize: '9px',
  color: '#6ee7b7',
  letterSpacing: '1px',
  marginBottom: '6px',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 'bold',
};

const statusCardValue = (status: 'normal' | 'warning' | 'danger'): React.CSSProperties => ({
  fontSize: '16px',
  color: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981',
  fontWeight: 'bold',
  fontFamily: "'Share Tech Mono', monospace",
});

const hintBox: React.CSSProperties = {
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid rgba(255, 153, 0, 0.4)',
  background: 'rgba(255, 153, 0, 0.1)',
  marginTop: '16px',
};

const hintTitle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '1px',
  color: '#ff9900',
  marginBottom: '8px',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
};

const hintList: React.CSSProperties = {
  margin: 0,
  paddingLeft: '16px',
  fontSize: '10px',
  color: '#ccc',
  lineHeight: 1.8,
};

const learningModeSection: React.CSSProperties = {
  marginBottom: '16px',
  padding: '12px',
  background: 'rgba(0, 255, 170, 0.08)',
  border: '1px solid rgba(0, 255, 170, 0.3)',
  borderRadius: '6px',
};

const learningModeButton = (active: boolean): React.CSSProperties => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  fontFamily: "'Inter', sans-serif",
  cursor: 'pointer',
  border: active ? '2px solid #6ee7b7' : '2px solid #444',
  background: active
    ? 'linear-gradient(180deg, rgba(0, 255, 170, 0.2) 0%, rgba(0, 255, 170, 0.1) 100%)'
    : 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
  color: active ? '#6ee7b7' : '#888',
  boxShadow: active
    ? '0 0 15px rgba(0, 255, 170, 0.4), 0 4px 0 rgba(0,0,0,0.3)'
    : '0 4px 0 rgba(0,0,0,0.3)',
  transition: 'all 0.2s',
});

const learningHint: React.CSSProperties = {
  marginTop: '12px',
  padding: '10px 12px',
  background: 'rgba(0, 255, 170, 0.1)',
  border: '1px solid rgba(0, 255, 170, 0.3)',
  borderRadius: '4px',
  fontSize: '11px',
  color: '#6ee7b7',
  lineHeight: 1.6,
  fontFamily: "'Inter', sans-serif",
};

const statusOn: React.CSSProperties = {
  fontSize: '12px',
  color: '#10b981',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '1px',
};

const statusOff: React.CSSProperties = {
  fontSize: '12px',
  color: '#ff5555',
  fontWeight: 'bold',
  fontFamily: "'Inter', sans-serif",
  letterSpacing: '1px',
};

const controlGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
