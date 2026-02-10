"use client";

import React, { useState, useRef, useCallback } from "react";
import type { ReactorState, ReactivityComponents } from "../../lib/reactor";
import {
  SCENARIOS,
  TrainingRole,
  type TrainingScenario,
  type TrainingSession,
  MetricsCollector,
  getRolePermissions,
  markScenarioCompleted,
} from "../../lib/training";
import ScenarioSelector from "../../components/ScenarioSelector";
import ScenarioBriefing from "../../components/ScenarioBriefing";
import ScenarioDebrief from "../../components/ScenarioDebrief";
import TrainingModulesSidebar from "../../components/TrainingModulesSidebar";
import NavigationBar from "../../components/NavigationBar";
import { LiveCheckpointPanel } from "../../components/LiveCheckpointPanel";
import {
  useReactorSimulation,
  HISTORY_LENGTH,
} from "../../hooks/useReactorSimulation";
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
} from "../../components/simulator";

type AppState = 'selector' | 'briefing' | 'running' | 'debrief';

export default function TrainingPage() {
  // App state
  const [appState, setAppState] = useState<AppState>('selector');
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [currentRole, setCurrentRole] = useState<TrainingRole>(TrainingRole.RO);
  const [metricsCollector, setMetricsCollector] = useState<MetricsCollector | null>(null);
  const [learningMode, setLearningMode] = useState(false);

  // Real-time metrics for checkpoint evaluation
  const [liveMetrics, setLiveMetrics] = useState({
    timeElapsed: 0,
    tripCount: 0,
    scramCount: 0,
    maxPower: 0,
    maxFuelTemp: 0,
    maxCoolantTemp: 0,
    currentPower: 0,
    rodPosition: 0,
    rodWithdrawalRate: 0,
    timeToFirstCriticality: -1,
    powerChangeCount: 0,
    observationTime: 0,
    finalPower: 0,
    timeAt50Percent: 0,
    maxPowerRate: 0,
  });
  const lastRodPositionRef = useRef(0.05);
  const lastRodTimestampRef = useRef(0);
  const lastPowerRef = useRef(0);

  // Refs for metrics collector (avoid stale closures)
  const metricsCollectorRef = useRef(metricsCollector);
  metricsCollectorRef.current = metricsCollector;
  const selectedScenarioRef = useRef(selectedScenario);
  selectedScenarioRef.current = selectedScenario;

  // onTick callback for training-specific metric recording
  const handleTick = useCallback(
    (currentState: ReactorState, _reactivity: ReactivityComponents, controls: { rod: number; pumpOn: boolean; scram: boolean; tripActive: boolean }, _simDelta: number) => {
      const collector = metricsCollectorRef.current;
      const scenario = selectedScenarioRef.current;

      // Record metrics if in training mode
      if (collector) {
        collector.recordState(currentState, controls.rod, controls.pumpOn, controls.scram);
      }

      // Update live metrics for checkpoint evaluation
      if (scenario) {
        const currentPowerPercent = currentState.P * 100;

        // Calculate rod withdrawal rate
        const rodDelta = controls.rod - lastRodPositionRef.current;
        const timeDelta = currentState.t - lastRodTimestampRef.current;
        const rodRate = timeDelta > 0 ? Math.abs(rodDelta * 100 / (timeDelta / 60)) : 0;

        if (rodDelta !== 0) {
          lastRodPositionRef.current = controls.rod;
          lastRodTimestampRef.current = currentState.t;
        }

        const powerChanged = Math.abs(currentPowerPercent - lastPowerRef.current) > 5;
        if (powerChanged) {
          lastPowerRef.current = currentPowerPercent;
        }

        setLiveMetrics(prev => ({
          timeElapsed: currentState.t,
          tripCount: controls.tripActive ? prev.tripCount + (prev.tripCount === 0 ? 1 : 0) : prev.tripCount,
          scramCount: controls.scram ? prev.scramCount + (prev.scramCount === 0 ? 1 : 0) : prev.scramCount,
          maxPower: Math.max(prev.maxPower, currentPowerPercent),
          maxFuelTemp: Math.max(prev.maxFuelTemp, currentState.Tf),
          maxCoolantTemp: Math.max(prev.maxCoolantTemp, currentState.Tc),
          currentPower: currentPowerPercent,
          rodPosition: controls.rod * 100,
          rodWithdrawalRate: rodRate,
          timeToFirstCriticality:
            prev.timeToFirstCriticality === -1 && currentState.P > 0.001
              ? currentState.t
              : prev.timeToFirstCriticality,
          powerChangeCount: prev.powerChangeCount + (powerChanged ? 1 : 0),
          observationTime: currentState.t,
          finalPower: currentPowerPercent,
          timeAt50Percent: collector ? collector.getLiveMetricValue('timeAt50Percent') : 0,
          maxPowerRate: collector ? collector.getLiveMetricValue('maxPowerRate') : 0,
        }));
      }
    },
    []
  );

  const handleTrip = useCallback(
    (tripState: ReactorState, _reason: string, controls: { rod: number; pumpOn: boolean; scram: boolean; tripActive: boolean }) => {
      const collector = metricsCollectorRef.current;
      if (collector) {
        collector.recordState(tripState, 0, controls.pumpOn, true);
      }
    },
    []
  );

  const handleSimStop = useCallback((finalState: ReactorState | null) => {
    const collector = metricsCollectorRef.current;
    const scenario = selectedScenarioRef.current;

    if (collector && scenario && finalState) {
      const finalMetrics = collector.finalize(finalState, scenario);
      if (finalMetrics.success) {
        markScenarioCompleted(scenario.id);
      }
      setAppState('debrief');
    }
  }, []);

  const sim = useReactorSimulation({
    onTick: handleTick,
    onTrip: handleTrip,
    onStop: handleSimStop,
  });

  const {
    rod, pumpOn, speed,
    isRunning, isPaused,
    state, reactivity, history,
    tripActive, tripReason, rodActual,
    boronConc, boronActual,
    setRod, setPumpOn, setBoronConc, setSpeed,
    handleStart, handlePause, handleResume,
    handleStop, handleScram, handleResetTrip,
    initializeModel,
  } = sim;

  // Get role permissions
  const permissions = getRolePermissions(currentRole);

  // Scenario selection handlers
  const handleSelectScenario = (scenario: TrainingScenario) => {
    setSelectedScenario(scenario);
    setCurrentRole(scenario.recommendedRole);
    setAppState('briefing');
  };

  const handleSelectFreePlay = () => {
    setSelectedScenario(null);
    setCurrentRole(TrainingRole.FREE_PLAY);
    initializeModel();
    setAppState('running');
  };

  const handleStartScenario = () => {
    if (selectedScenario) {
      initializeModel(
        selectedScenario.initialState.reactorState,
        selectedScenario.initialState.controls.rod,
        selectedScenario.initialState.timeAcceleration
      );
      const collector = new MetricsCollector(selectedScenario.id);
      setMetricsCollector(collector);
      setAppState('running');
      handleStart();
    }
  };

  const handleBackToSelector = () => {
    handleStop();
    setSelectedScenario(null);
    setMetricsCollector(null);
    setAppState('selector');
  };

  const handleRestartScenario = () => {
    if (selectedScenario) {
      setAppState('briefing');
    }
  };

  // Computed values
  const power = state ? state.P * 100 : 0;
  const fuelTemp = state ? state.Tf : 500;
  const coolantTemp = state ? state.Tc : 500;
  const simTime = state ? state.t : 0;
  const decayHeatPercent = state ? state.decayHeat.reduce((sum, d) => sum + d, 0) * 100 : 0;

  // Render based on app state
  if (appState === 'selector') {
    return (
      <>
        <NavigationBar />
        <TrainingModulesSidebar />
        <ScenarioSelector
          scenarios={SCENARIOS}
          onSelectScenario={handleSelectScenario}
          onSelectFreePlay={handleSelectFreePlay}
        />
      </>
    );
  }

  if (appState === 'briefing' && selectedScenario) {
    return (
      <>
        <NavigationBar />
        <TrainingModulesSidebar currentScenarioId={selectedScenario.id} />
        <ScenarioBriefing
          scenario={selectedScenario}
          role={currentRole}
          onStart={handleStartScenario}
          onBack={handleBackToSelector}
        />
      </>
    );
  }

  if (appState === 'debrief' && metricsCollector && selectedScenario) {
    return (
      <>
        <NavigationBar />
        <TrainingModulesSidebar currentScenarioId={selectedScenario.id} />
        <ScenarioDebrief
          metrics={metricsCollector.getMetrics()}
          scenario={selectedScenario}
          onRestart={handleRestartScenario}
          onBackToScenarios={handleBackToSelector}
        />
      </>
    );
  }

  // Running state - show simulator
  return (
    <>
      <NavigationBar />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          background: #0f1419;
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <main style={container}>
        {/* Top Status Bar */}
        <div style={topBar}>
          <div style={topBarLeft}>
            <img src="/logo.png" alt="U-FORCE" style={topBarLogo} />
            <div>
              <div style={topBarTitle}>
                {selectedScenario ? selectedScenario.name : 'U-FORCE Reactor Simulator'}
              </div>
              <div style={topBarSubtitle}>
                {selectedScenario ? `Training Mode - ${currentRole}` : 'Free Play Mode'}
              </div>
            </div>
          </div>
          <button style={exitButton} onClick={handleBackToSelector}>
            ← EXIT SCENARIO
          </button>
        </div>

        {/* Trip Banner */}
        {tripActive && (
          <div style={tripBannerOverlay}>
            <TripBanner
              tripActive={tripActive}
              tripReason={tripReason}
              variant="training"
            />
          </div>
        )}

        {/* Three Column Layout: Left Controls | Center Displays | Right Objectives */}
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
                  Learning mode shows helpful tips about each control and how it affects the reactor!
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
            />

            <TripResetControls
              tripActive={tripActive}
              onResetTrip={handleResetTrip}
              variant="training"
            />

            <SpeedControl speed={speed} onSpeedChange={setSpeed} />

            <ControlRodSlider
              rod={rod}
              rodActual={rodActual}
              onRodChange={setRod}
              disabled={!permissions.canControlRods}
              tripActive={tripActive}
              showActiveHint={permissions.canControlRods}
              showScramHint={permissions.canControlRods}
              disabledMessage={!permissions.canControlRods ? "Rod control disabled for this role" : undefined}
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
              pumpDisabled={!permissions.canControlPump}
              scramDisabled={!permissions.canScram}
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
              disabled={!permissions.canControlBoron}
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

          {/* RIGHT PANEL - Mission Objectives */}
          {selectedScenario && state && (
            <div style={rightPanel}>
              <LiveCheckpointPanel
                objectives={selectedScenario.objectives}
                reactorState={state}
                currentMetrics={liveMetrics}
                onObjectiveComplete={(objectiveId) => {
                  if (metricsCollector) {
                    metricsCollector.completeObjective(objectiveId);
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ============================================================================
// STYLES - Control Room Layout (Training Mode)
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

const exitButton: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  fontFamily: "'Inter', sans-serif",
  background: 'rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  border: '2px solid #ef4444',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

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
  border: '2px solid rgba(255, 153, 0, 0.4)',
  borderRadius: '8px',
  padding: '0',
  overflowY: 'auto',
  boxShadow: '0 4px 20px rgba(255, 153, 0, 0.2)',
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
