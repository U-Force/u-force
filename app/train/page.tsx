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
        <header style={header}>
          <div style={headerRow}>
            <div style={titleContainer}>
              <img src="/logo.png" alt="U-FORCE Logo" style={logoIcon} />
              <div>
                <h1 style={title}>
                  {selectedScenario ? selectedScenario.name : 'U-FORCE Reactor Simulator'}
                </h1>
                <p style={subtitle}>
                  {selectedScenario
                    ? `Training Mode - ${currentRole}`
                    : 'Free Play Mode - Real-time point kinetics simulation'}
                </p>
              </div>
            </div>
            <div>
              <button style={exitButton} onClick={handleBackToSelector}>
                ← EXIT
              </button>
            </div>
          </div>
        </header>

        <TripBanner
          tripActive={tripActive}
          tripReason={tripReason}
          variant="training"
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
            />

            <PumpScramControls
              pumpOn={pumpOn}
              tripActive={tripActive}
              onPumpToggle={() => setPumpOn(v => !v)}
              onScram={handleScram}
              pumpDisabled={!permissions.canControlPump}
              scramDisabled={!permissions.canScram}
            />

            <BoronControl
              boronConc={boronConc}
              boronActual={boronActual}
              onBoronChange={setBoronConc}
              disabled={!permissions.canControlBoron}
            />
          </div>

          {/* Center Column - Displays */}
          <div style={displayColumn}>
            <PowerDisplay power={power} decayHeat={decayHeatPercent} />

            <PowerHistoryGraph
              history={history}
              historyLength={HISTORY_LENGTH}
              simTime={simTime}
            />

            <TemperatureMetrics fuelTemp={fuelTemp} coolantTemp={coolantTemp} />

            <ReactivityPanel reactivity={reactivity} />
          </div>

          {/* Right Column - Mission Objectives (only in training mode) */}
          {selectedScenario && state && (
            <div style={objectivesColumn}>
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
        </section>
      </main>
    </>
  );
}

// ============================================================================
// PAGE-SPECIFIC STYLES (layout, header, training-specific elements)
// ============================================================================

const container: React.CSSProperties = {
  maxWidth: "100vw",
  minHeight: "100vh",
  margin: "0",
  padding: "20px",
  paddingTop: "80px",
  background: "#0f1419",
  position: "relative",
};

const header: React.CSSProperties = {
  marginBottom: "20px",
  background: "rgba(20, 25, 30, 0.8)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "8px",
  padding: "16px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  position: "relative",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const titleContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const logoIcon: React.CSSProperties = {
  width: "40px",
  height: "40px",
  filter: "brightness(0) saturate(100%) invert(40%) sepia(98%) saturate(2000%) hue-rotate(200deg)",
};

const title: React.CSSProperties = {
  fontSize: "20px",
  margin: "0 0 4px",
  color: "#10b981",
  fontWeight: "600",
  fontFamily: "'Inter', sans-serif",
};

const subtitle: React.CSSProperties = {
  fontSize: "13px",
  margin: 0,
  fontFamily: "'Inter', sans-serif",
  color: "#6ee7b7",
  fontWeight: "400",
};

const exitButton: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
  fontFamily: "'Inter', sans-serif",
  background: "rgba(20, 25, 30, 0.6)",
  color: "#6ee7b7",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  cursor: "pointer",
  transition: "all 0.2s",
};

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "400px 1fr 380px",
  gap: "16px",
  minHeight: "calc(100vh - 120px)",
};

const controlColumn: React.CSSProperties = {
  background: "rgba(20, 25, 30, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  position: "relative",
};

const objectivesColumn: React.CSSProperties = {
  background: "rgba(20, 25, 30, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "8px",
  padding: "0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  position: "relative",
  overflow: "hidden",
};

const displayColumn: React.CSSProperties = {
  background: "rgba(20, 25, 30, 0.6)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
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
  letterSpacing: "0px",
  color: "#6ee7b7",
  fontWeight: "bold",
  fontFamily: "'Inter', sans-serif",
  textTransform: "none",
  flex: 1,
};
