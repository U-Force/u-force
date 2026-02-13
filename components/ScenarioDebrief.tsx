"use client";

import React from 'react';
import type { PerformanceMetrics, TrainingScenario } from '../lib/training/types';
import { COLORS, FONTS, FONT_SIZES, RADIUS, BLUR } from '../lib/workbench/theme';

interface ScenarioDebriefProps {
  metrics: PerformanceMetrics;
  scenario: TrainingScenario;
  onRestart: () => void;
  onBackToScenarios: () => void;
}

export default function ScenarioDebrief({
  metrics,
  scenario,
  onRestart,
  onBackToScenarios,
}: ScenarioDebriefProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return COLORS.emerald;
    if (score >= 75) return COLORS.amber;
    if (score >= 60) return '#ff9900';
    return COLORS.red;
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 75) return 'GOOD';
    if (score >= 60) return 'SATISFACTORY';
    return 'NEEDS IMPROVEMENT';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const scoreColor = getScoreColor(metrics.score);
  const scoreGrade = getScoreGrade(metrics.score);

  // ── Structured Instructor Analysis ──
  interface FeedbackCategory {
    title: string;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    points: string[];
  }

  const analysisCategories: FeedbackCategory[] = [];

  // Rating priority: excellent > good > fair > poor
  const RATING_ORDER: FeedbackCategory['rating'][] = ['excellent', 'good', 'fair', 'poor'];
  /** Downgrade rating: only goes worse, never improves */
  function downgrade(current: FeedbackCategory['rating'], to: FeedbackCategory['rating']): FeedbackCategory['rating'] {
    return RATING_ORDER.indexOf(to) > RATING_ORDER.indexOf(current) ? to : current;
  }
  /** Upgrade rating: only goes better, never worsens */
  function upgrade(current: FeedbackCategory['rating'], to: FeedbackCategory['rating']): FeedbackCategory['rating'] {
    return RATING_ORDER.indexOf(to) < RATING_ORDER.indexOf(current) ? to : current;
  }

  // 1. Reactor Operations
  {
    const items: string[] = [];
    let rating: FeedbackCategory['rating'] = 'good';
    const finalPowerPct = metrics.finalPower * 100;

    if (metrics.rodMovements.length === 0) {
      items.push('No rod movements were recorded — did you use the control rods?');
      rating = downgrade(rating, 'poor');
    } else if (metrics.rodMovements.length <= 5) {
      items.push('Minimal rod adjustments — controlled and deliberate approach.');
    } else if (metrics.rodMovements.length <= 20) {
      items.push(`${metrics.rodMovements.length} rod adjustments made. Consider smoother, fewer movements for steadier control.`);
    } else {
      items.push(`${metrics.rodMovements.length} rod adjustments is excessive. Frequent hunting causes power oscillations.`);
      rating = downgrade(rating, 'fair');
    }

    if (metrics.timeToFirstAction > 0 && metrics.timeToFirstAction <= 10) {
      items.push(`Quick initial response at ${metrics.timeToFirstAction.toFixed(1)}s — good situational awareness.`);
    } else if (metrics.timeToFirstAction > 30) {
      items.push(`Response time of ${metrics.timeToFirstAction.toFixed(1)}s is slow. In a real plant, delays increase transient severity.`);
      rating = downgrade(rating, 'fair');
    }

    // Check scenario-specific power targets
    const hasPowerObjective = scenario.objectives.some(o =>
      o.assessmentCriteria.some(c => c.metric === 'finalPower')
    );
    if (hasPowerObjective) {
      const powerCriteria = scenario.objectives
        .flatMap(o => o.assessmentCriteria)
        .find(c => c.metric === 'finalPower');
      if (powerCriteria) {
        if (powerCriteria.target.includes('-')) {
          const [lo, hi] = powerCriteria.target.split('-').map(Number);
          if (finalPowerPct >= lo && finalPowerPct <= hi) {
            items.push(`Final power of ${finalPowerPct.toFixed(1)}% is within the ${lo}-${hi}% target — well done.`);
            rating = upgrade(rating, 'excellent');
          } else {
            items.push(`Final power of ${finalPowerPct.toFixed(1)}% missed the ${lo}-${hi}% target. Aim for gradual rod withdrawal with time to stabilize.`);
            rating = downgrade(rating, 'fair');
          }
        } else if (powerCriteria.target.startsWith('<')) {
          const limit = Number(powerCriteria.target.slice(1));
          if (finalPowerPct < limit) {
            items.push(`Power kept below ${limit}% target.`);
          } else {
            items.push(`Power exceeded ${limit}% target — insert rods earlier to prevent overshoot.`);
            rating = downgrade(rating, 'fair');
          }
        }
      }
    }

    if (items.length > 0) {
      analysisCategories.push({ title: 'Reactor Operations', rating, points: items });
    }
  }

  // 2. Pressure Management (if scenario involves pressure)
  {
    const hasPressureObj = scenario.objectives.some(o =>
      o.assessmentCriteria.some(c => ['maxPressure', 'minPressure', 'finalPressure'].includes(c.metric))
    );
    if (hasPressureObj) {
      const items: string[] = [];
      let rating: FeedbackCategory['rating'] = 'good';

      // We don't have heater/spray action counts in metrics, but we can infer from pressure behavior
      const pressureCriteria = scenario.objectives
        .flatMap(o => o.assessmentCriteria)
        .filter(c => ['maxPressure', 'minPressure', 'finalPressure'].includes(c.metric));

      let pressureOk = true;
      for (const crit of pressureCriteria) {
        if (crit.metric === 'finalPressure' && crit.target.includes('-')) {
          const [lo, hi] = crit.target.split('-').map(Number);
          // We can't directly see finalPressure here, but we know from metrics.feedback
          items.push(`Target pressure band: ${lo}-${hi} MPa. Use spray when pressure rises above ${((lo + hi) / 2 + 0.3).toFixed(1)} MPa and heaters when it drops below ${((lo + hi) / 2 - 0.3).toFixed(1)} MPa.`);
        }
        if (crit.metric === 'maxPressure' && crit.target.startsWith('<')) {
          const limit = Number(crit.target.slice(1));
          items.push(`Maximum pressure must stay below ${limit} MPa. Anticipate pressure rises during power increases and apply spray proactively.`);
        }
        if (crit.metric === 'minPressure' && crit.target.startsWith('>')) {
          const limit = Number(crit.target.slice(1));
          items.push(`Minimum pressure must stay above ${limit} MPa. Cooldowns cause pressure to drop — use heaters to maintain the steam bubble.`);
        }
      }

      // Check if a pressure trip happened
      const pressureTrip = metrics.feedback.some(f => f.includes('trip'));
      if (pressureTrip && metrics.tripCount > 0) {
        items.push('A pressure excursion caused a reactor trip. Start corrective action earlier — spray and heaters take time to respond.');
        rating = downgrade(rating, 'poor');
        pressureOk = false;
      }

      if (pressureOk && metrics.tripCount === 0) {
        items.push('Pressure remained within safe limits — good pressurizer management.');
        rating = upgrade(rating, 'excellent');
      }

      items.push('TIP: In a real PWR, pressurizer response lags temperature changes by 10-30 seconds. Always act before the parameter reaches its limit.');

      analysisCategories.push({ title: 'Pressure Management', rating, points: items });
    }
  }

  // 3. Thermal Performance
  {
    const items: string[] = [];
    let rating: FeedbackCategory['rating'] = 'good';

    if (metrics.finalFuelTemp > 1500) {
      items.push(`Peak fuel temperature of ${metrics.finalFuelTemp.toFixed(0)} K is dangerously high. UO2 melting point is ~3100 K; damage begins well below that.`);
      rating = downgrade(rating, 'poor');
    } else if (metrics.finalFuelTemp > 1000) {
      items.push(`Peak fuel temperature of ${metrics.finalFuelTemp.toFixed(0)} K is elevated. Slower power changes reduce thermal stress.`);
      rating = downgrade(rating, 'fair');
    } else if (metrics.finalFuelTemp > 500) {
      items.push(`Fuel temperature of ${metrics.finalFuelTemp.toFixed(0)} K is within normal operating range.`);
    }

    if (metrics.finalCoolantTemp > 600) {
      items.push(`Coolant temperature of ${metrics.finalCoolantTemp.toFixed(0)} K approaches boiling. Risk of departure from nucleate boiling (DNB).`);
      rating = downgrade(rating, 'poor');
    } else if (metrics.finalCoolantTemp > 580) {
      items.push(`Coolant temperature of ${metrics.finalCoolantTemp.toFixed(0)} K is above normal. Ensure adequate heat removal through feedwater and steam dump.`);
      rating = downgrade(rating, 'fair');
    } else if (metrics.finalCoolantTemp > 300) {
      items.push('Coolant temperature well controlled throughout the scenario.');
      rating = upgrade(rating, 'excellent');
    }

    // Check for temperature-related objectives
    const hasTempObj = scenario.objectives.some(o =>
      o.assessmentCriteria.some(c => c.metric === 'maxFuelTemp' || c.metric === 'maxCoolantTemp')
    );
    if (hasTempObj) {
      items.push('TIP: Negative temperature feedback (Doppler effect) is your ally — it naturally limits power excursions. But it works best when you give it time to act.');
    }

    if (items.length > 0) {
      analysisCategories.push({ title: 'Thermal Performance', rating, points: items });
    }
  }

  // 4. Safety Awareness
  {
    const items: string[] = [];
    let rating: FeedbackCategory['rating'] = 'excellent';

    if (metrics.tripCount === 0 && metrics.safetyLimitViolations.length === 0) {
      items.push('No trips or safety violations — excellent safety awareness.');
    } else {
      if (metrics.tripCount > 0) {
        items.push(`${metrics.tripCount} reactor trip(s) occurred. Each trip subjects the plant to thermal and mechanical transients that reduce equipment life.`);
        rating = downgrade(rating, 'poor');
      }
      if (metrics.safetyLimitViolations.length > 0) {
        for (const v of metrics.safetyLimitViolations.slice(0, 3)) {
          const paramName = v.parameter === 'power' ? 'Reactor Power' :
            v.parameter === 'fuelTemp' ? 'Fuel Temperature' :
            v.parameter === 'coolantTemp' ? 'Coolant Temperature' : v.parameter;
          items.push(`${paramName} exceeded its limit at t=${v.timestamp.toFixed(0)}s. Monitor trend indicators to catch rising parameters before they reach trip setpoints.`);
        }
        rating = downgrade(rating, 'poor');
      }
    }

    if (metrics.scramCount > 0) {
      items.push(`SCRAM was initiated ${metrics.scramCount} time(s). While SCRAM is the correct response to an emergency, the goal is to prevent the emergency in the first place.`);
      rating = downgrade(rating, 'fair');
    }

    items.push(metrics.tripCount === 0
      ? 'Continue practicing to maintain this level of safety discipline.'
      : 'RECOMMENDATION: Practice this scenario at a slower time acceleration and focus on monitoring trends before they become alarms.');

    analysisCategories.push({ title: 'Safety Awareness', rating, points: items });
  }

  // 5. Recommendations
  {
    const items: string[] = [];

    if (!metrics.success) {
      items.push('Retry this scenario — focus on the failed objectives and apply the feedback above.');
    }

    if (metrics.score >= 90) {
      items.push('Outstanding performance. Consider advancing to higher-difficulty scenarios.');
    } else if (metrics.score >= 70) {
      items.push('Solid performance with room for refinement. Try again to achieve 90+.');
    } else if (metrics.score >= 45) {
      items.push('Review the briefing carefully before your next attempt. Focus on one objective at a time.');
    } else {
      items.push('Start with the scenario briefing and hints. Consider practicing individual controls in Free Play mode before retrying.');
    }

    // Scenario-specific tips
    if (scenario.id.includes('PZR')) {
      items.push('Practice adjusting heaters and spray in Free Play mode to build muscle memory for pressure control.');
    }
    if (scenario.id.includes('STEAMDUMP')) {
      items.push('Remember: open dump valves first, then insert rods. Closing dump valves too early causes temperature spikes.');
    }
    if (scenario.id.includes('SECONDARY')) {
      items.push('Multi-system coordination improves with repetition. Try managing just pressure first, then add steam dump timing.');
    }
    if (scenario.id.includes('FEEDWATER') || scenario.id.includes('FW')) {
      items.push('Loss of feedwater is time-critical. Practice recognizing the temperature trend and initiating power reduction within 15 seconds.');
    }

    analysisCategories.push({ title: 'Next Steps', rating: metrics.score >= 70 ? 'good' : 'fair', points: items });
  }

  const getRatingColor = (rating: FeedbackCategory['rating']): string => {
    switch (rating) {
      case 'excellent': return COLORS.emerald;
      case 'good': return COLORS.blue;
      case 'fair': return COLORS.amber;
      case 'poor': return COLORS.red;
    }
  };

  const getRatingLabel = (rating: FeedbackCategory['rating']): string => {
    switch (rating) {
      case 'excellent': return 'EXCELLENT';
      case 'good': return 'GOOD';
      case 'fair': return 'NEEDS WORK';
      case 'poor': return 'CRITICAL';
    }
  };

  // Derive what went right and wrong
  const rightItems: string[] = [];
  const wrongItems: string[] = [];

  // Objectives
  const completedObjectives = scenario.objectives.filter(obj =>
    metrics.objectivesCompleted.includes(obj.id)
  );
  const failedObjectives = scenario.objectives.filter(obj =>
    !metrics.objectivesCompleted.includes(obj.id)
  );

  completedObjectives.forEach(obj =>
    rightItems.push(obj.description)
  );
  failedObjectives.forEach(obj =>
    wrongItems.push(`Objective not met: ${obj.description}`)
  );

  // Safety
  if (metrics.tripCount === 0 && metrics.safetyLimitViolations.length === 0) {
    rightItems.push('No safety limit violations or reactor trips');
  }
  if (metrics.tripCount > 0) {
    wrongItems.push(`${metrics.tripCount} automatic reactor trip(s) occurred`);
  }
  if (metrics.safetyLimitViolations.length > 0) {
    wrongItems.push(`${metrics.safetyLimitViolations.length} safety limit violation(s) detected`);
  }

  // Timing
  if (metrics.timeToFirstAction > 0 && metrics.timeToFirstAction <= 15) {
    rightItems.push(`Fast initial response (${metrics.timeToFirstAction.toFixed(1)}s)`);
  } else if (metrics.timeToFirstAction > 30) {
    wrongItems.push(`Slow initial response (${metrics.timeToFirstAction.toFixed(1)}s) — aim for under 15s`);
  }

  // Procedure compliance
  if (metrics.procedureStepsSkipped === 0 && metrics.procedureStepsCompleted > 0) {
    rightItems.push(`All ${metrics.procedureStepsCompleted} procedure steps followed`);
  }
  if (metrics.procedureStepsSkipped > 0) {
    wrongItems.push(`${metrics.procedureStepsSkipped} procedure step(s) skipped`);
  }
  if (metrics.procedureStepsOutOfOrder > 0) {
    wrongItems.push(`${metrics.procedureStepsOutOfOrder} step(s) performed out of order`);
  }

  // Temperature performance
  if (metrics.finalFuelTemp < 1200) {
    rightItems.push('Fuel temperature stayed within safe operating range');
  }
  if (metrics.finalCoolantTemp < 590) {
    rightItems.push('Coolant temperature well controlled');
  }

  // Score breakdown matching the scoring model in metrics.ts
  const totalObjectives = scenario.objectives.length;
  const objectivePoints = totalObjectives > 0
    ? Math.round((completedObjectives.length / totalObjectives) * 70)
    : 70;
  let safetyPoints = 20;
  safetyPoints -= metrics.tripCount * 10;
  safetyPoints -= metrics.safetyLimitViolations.length * 7;
  safetyPoints = Math.max(0, safetyPoints);
  const procedurePenalty = metrics.procedureStepsSkipped * 3;

  // SVG score ring calculations
  const ringRadius = 58;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (metrics.score / 100) * ringCircumference;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        * { box-sizing: border-box; }
        body { background: #060a0f; margin: 0; }
        @keyframes scoreReveal {
          from { stroke-dashoffset: ${ringCircumference}; }
          to { stroke-dashoffset: ${ringOffset}; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={shell}>
        {/* Top bar */}
        <div style={topBar}>
          <div style={topBarLeft}>
            <img src="/logo.png" alt="U-FORCE" style={topBarLogo} />
            <span style={topBarBrand}>U-FORCE</span>
            <span style={topBarSub}>MISSION DEBRIEF</span>
          </div>
        </div>

        <div style={scrollArea}>
          <div style={container}>

            {/* ── Hero: Score Ring + Result ── */}
            <div style={heroSection}>
              <div style={scoreRingWrap}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    cx="70" cy="70" r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="70" cy="70" r={ringRadius}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 70 70)"
                    style={{
                      animation: 'scoreReveal 1.2s ease-out forwards',
                      filter: `drop-shadow(0 0 8px ${scoreColor}60)`,
                    }}
                  />
                </svg>
                <div style={scoreCenter}>
                  <div style={scoreBig(scoreColor)}>{metrics.score.toFixed(0)}</div>
                  <div style={scoreOutOf}>/100</div>
                </div>
              </div>

              <div style={heroInfo}>
                <div style={heroBanner(metrics.success)}>
                  <span style={heroBannerIcon}>{metrics.success ? '✓' : '✗'}</span>
                  {metrics.success ? 'MISSION PASSED' : 'MISSION FAILED'}
                </div>
                <h1 style={heroScenarioName}>{scenario.name}</h1>
                <div style={heroGrade(scoreColor)}>
                  {scoreGrade}
                </div>
                <div style={heroMeta}>
                  <span>{formatDuration(metrics.duration)}</span>
                  <span style={heroMetaDot} />
                  <span>{completedObjectives.length}/{scenario.objectives.length} objectives</span>
                  <span style={heroMetaDot} />
                  <span>Difficulty {scenario.difficulty}/4</span>
                </div>
              </div>
            </div>

            {/* ── What Went Right / Wrong ── */}
            <div style={twoCol}>
              {rightItems.length > 0 && (
                <div style={rightWrongCard('right')}>
                  <div style={rwHeader('right')}>WHAT WENT RIGHT</div>
                  {rightItems.map((item, i) => (
                    <div key={i} style={rwItem}>
                      <span style={rwIcon('right')}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              {wrongItems.length > 0 && (
                <div style={rightWrongCard('wrong')}>
                  <div style={rwHeader('wrong')}>WHAT WENT WRONG</div>
                  {wrongItems.map((item, i) => (
                    <div key={i} style={rwItem}>
                      <span style={rwIcon('wrong')}>✗</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              {wrongItems.length === 0 && (
                <div style={rightWrongCard('right')}>
                  <div style={rwHeader('right')}>WHAT WENT WRONG</div>
                  <div style={rwItem}>
                    <span style={rwIcon('right')}>✓</span>
                    <span>Nothing — perfect performance!</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Instructor Analysis ── */}
            <div style={section}>
              <div style={sectionTitle}>INSTRUCTOR ANALYSIS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysisCategories.map((cat, i) => {
                  const rColor = getRatingColor(cat.rating);
                  return (
                    <div key={i} style={analysisCategoryCard}>
                      <div style={analysisCategoryHeader}>
                        <span style={analysisCategoryTitle}>{cat.title}</span>
                        <span style={analysisCategoryBadge(rColor)}>
                          {getRatingLabel(cat.rating)}
                        </span>
                      </div>
                      <div style={analysisCategoryBar}>
                        <div style={analysisCategoryBarFill(rColor, cat.rating)} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                        {cat.points.map((point, j) => {
                          const isTip = point.startsWith('TIP:') || point.startsWith('RECOMMENDATION:');
                          return (
                            <div key={j} style={analysisPoint(isTip)}>
                              <span style={analysisPointDot(isTip ? COLORS.blue : rColor)}>
                                {isTip ? '>' : '-'}
                              </span>
                              <span>{point}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Performance Metrics Grid ── */}
            <div style={section}>
              <div style={sectionTitle}>PERFORMANCE METRICS</div>
              <div style={statsGrid}>
                <div style={statCard}>
                  <div style={statLabel}>Duration</div>
                  <div style={statVal()}>{formatDuration(metrics.duration)}</div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Final Power</div>
                  <div style={statVal()}>{(metrics.finalPower * 100).toFixed(1)}%</div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Reactor Trips</div>
                  <div style={statVal(metrics.tripCount > 0 ? COLORS.red : COLORS.emerald)}>
                    {metrics.tripCount}
                  </div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Safety Violations</div>
                  <div style={statVal(metrics.safetyLimitViolations.length > 0 ? COLORS.red : COLORS.emerald)}>
                    {metrics.safetyLimitViolations.length}
                  </div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Peak Fuel Temp</div>
                  <div style={statVal(metrics.finalFuelTemp > 1500 ? COLORS.red : COLORS.white)}>
                    {metrics.finalFuelTemp.toFixed(0)} K
                  </div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Peak Coolant Temp</div>
                  <div style={statVal(metrics.finalCoolantTemp > 600 ? COLORS.red : COLORS.white)}>
                    {metrics.finalCoolantTemp.toFixed(0)} K
                  </div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Time to First Action</div>
                  <div style={statVal(metrics.timeToFirstAction > 30 ? '#ff9900' : COLORS.white)}>
                    {metrics.timeToFirstAction > 0 ? `${metrics.timeToFirstAction.toFixed(1)}s` : 'N/A'}
                  </div>
                </div>
                <div style={statCard}>
                  <div style={statLabel}>Rod Movements</div>
                  <div style={statVal()}>{metrics.rodMovements.length}</div>
                </div>
              </div>
            </div>

            {/* ── Score Breakdown ── */}
            <div style={section}>
              <div style={sectionTitle}>SCORE BREAKDOWN</div>
              <div style={breakdownCard}>
                <div style={breakdownRow}>
                  <span style={breakdownLabel}>Objectives ({completedObjectives.length}/{totalObjectives})</span>
                  <span style={breakdownVal(objectivePoints >= 70 ? COLORS.emerald : COLORS.amber)}>
                    {objectivePoints}/70
                  </span>
                </div>
                <div style={breakdownBarOuter}>
                  <div style={breakdownBarFill((objectivePoints / 70) * 100, COLORS.emerald)} />
                </div>

                <div style={breakdownRow}>
                  <span style={breakdownLabel}>Safety Record</span>
                  <span style={breakdownVal(safetyPoints >= 20 ? COLORS.emerald : COLORS.amber)}>
                    {safetyPoints}/20
                  </span>
                </div>
                <div style={breakdownBarOuter}>
                  <div style={breakdownBarFill((safetyPoints / 20) * 100, safetyPoints >= 20 ? COLORS.emerald : COLORS.amber)} />
                </div>

                <div style={breakdownRow}>
                  <span style={breakdownLabel}>Technique</span>
                  <span style={breakdownVal(COLORS.slateLight)}>
                    +{Math.round(metrics.score - objectivePoints - safetyPoints + procedurePenalty)}/10
                  </span>
                </div>

                {procedurePenalty > 0 && (
                  <>
                    <div style={breakdownDivider} />
                    <div style={breakdownPenalty}>
                      <span>Skipped Steps ({metrics.procedureStepsSkipped} x -3)</span>
                      <span style={breakdownPenaltyVal}>-{procedurePenalty}</span>
                    </div>
                  </>
                )}

                <div style={breakdownDivider} />
                <div style={breakdownRow}>
                  <span style={{ ...breakdownLabel, color: COLORS.white, fontWeight: 700 }}>Final Score</span>
                  <span style={breakdownVal(scoreColor)}>
                    {metrics.score.toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>

            {/* ── Learning Objectives ── */}
            <div style={section}>
              <div style={sectionTitle}>
                OBJECTIVES ({completedObjectives.length}/{scenario.objectives.length})
              </div>
              {scenario.objectives.map((obj) => {
                const completed = metrics.objectivesCompleted.includes(obj.id);
                return (
                  <div key={obj.id} style={objectiveRow(completed)}>
                    <div style={objIcon(completed)}>{completed ? '✓' : '✗'}</div>
                    <div style={objBody}>
                      <div style={objText}>{obj.description}</div>
                      <div style={objBadge(completed)}>
                        {completed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Safety Analysis ── */}
            {metrics.safetyLimitViolations.length > 0 && (
              <div style={section}>
                <div style={sectionTitle}>SAFETY ANALYSIS</div>
                <div style={safetyCard}>
                  {metrics.safetyLimitViolations.map((v, i) => (
                    <div key={i} style={violationRow}>
                      <div style={violationDot} />
                      <div style={violationInfo}>
                        <div style={violationParam}>
                          {v.parameter === 'power' ? 'Reactor Power' :
                           v.parameter === 'fuelTemp' ? 'Fuel Temperature' :
                           v.parameter === 'coolantTemp' ? 'Coolant Temperature' : v.parameter}
                        </div>
                        <div style={violationDetail}>
                          Reached {v.parameter === 'power' ? `${(v.value * 100).toFixed(1)}%` : `${v.value.toFixed(0)} K`}
                          {' '}(limit: {v.parameter === 'power' ? `${(v.limit * 100).toFixed(0)}%` : `${v.limit} K`})
                          {' '}at t={v.timestamp.toFixed(1)}s
                          {v.duration > 0 ? ` for ${v.duration.toFixed(1)}s` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Instructor Feedback ── */}
            {metrics.feedback.length > 0 && (
              <div style={section}>
                <div style={sectionTitle}>INSTRUCTOR FEEDBACK</div>
                <div style={feedbackCard}>
                  {metrics.feedback.map((msg, idx) => (
                    <div key={idx} style={feedbackRow}>
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Control Actions Log ── */}
            {metrics.rodMovements.length > 0 && (
              <div style={section}>
                <div style={sectionTitle}>CONTROL ACTIONS LOG</div>
                <div style={logCard}>
                  {metrics.rodMovements.slice(0, 15).map((action, idx) => (
                    <div key={idx} style={logRow}>
                      <span style={logTime}>t={action.timestamp.toFixed(1)}s</span>
                      <span style={logBadge(action.action === 'withdraw' ? COLORS.amber : COLORS.blue)}>
                        {action.action.toUpperCase()}
                      </span>
                      <span style={logDetail}>
                        {(action.fromValue * 100).toFixed(0)}% → {(action.toValue * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                  {metrics.rodMovements.length > 15 && (
                    <div style={logMore}>
                      ... and {metrics.rodMovements.length - 15} more actions
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div style={actionBar}>
              <button style={btnBack} onClick={onBackToScenarios}>
                ← BACK TO SCENARIOS
              </button>
              <button style={btnRetry} onClick={onRestart}>
                ↺ RETRY SCENARIO
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const shell: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, #060a0f 0%, #0c1117 100%)',
  fontFamily: FONTS.sans,
  color: COLORS.white,
};

const topBar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  height: '42px',
  background: COLORS.bgDark,
  borderBottom: `1px solid ${COLORS.borderSubtle}`,
  backdropFilter: BLUR.md,
  flexShrink: 0,
};

const topBarLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const topBarLogo: React.CSSProperties = {
  width: '22px',
  height: '22px',
  filter: 'brightness(0) invert(1) opacity(0.7)',
};

const topBarBrand: React.CSSProperties = {
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  color: COLORS.white,
  letterSpacing: '1px',
};

const topBarSub: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.amber,
  letterSpacing: '1.5px',
  marginLeft: '4px',
  fontWeight: 600,
};

const scrollArea: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
};

const container: React.CSSProperties = {
  maxWidth: '860px',
  margin: '0 auto',
  padding: '32px 28px 80px',
};

// ── Hero Section ──

const heroSection: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  marginBottom: '32px',
  animation: 'fadeUp 0.5s ease-out',
};

const scoreRingWrap: React.CSSProperties = {
  position: 'relative',
  width: '140px',
  height: '140px',
  flexShrink: 0,
};

const scoreCenter: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const scoreBig = (color: string): React.CSSProperties => ({
  fontSize: '36px',
  fontWeight: 700,
  fontFamily: FONTS.mono,
  color,
  lineHeight: 1,
});

const scoreOutOf: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.slateDark,
  fontFamily: FONTS.mono,
  marginTop: '2px',
};

const heroInfo: React.CSSProperties = {
  flex: 1,
};

const heroBanner = (success: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '5px 14px',
  borderRadius: RADIUS.md,
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  letterSpacing: '1.5px',
  marginBottom: '8px',
  background: success ? COLORS.emeraldBg : COLORS.redBg,
  color: success ? COLORS.emerald : COLORS.red,
  border: `1px solid ${success ? COLORS.borderEmerald : COLORS.borderRed}`,
});

const heroBannerIcon: React.CSSProperties = {
  fontSize: '14px',
};

const heroScenarioName: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: COLORS.white,
  margin: '0 0 6px',
};

const heroGrade = (color: string): React.CSSProperties => ({
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  fontFamily: FONTS.mono,
  color,
  letterSpacing: '1.5px',
  marginBottom: '8px',
});

const heroMeta: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: FONT_SIZES.md,
  color: COLORS.slateDark,
};

const heroMetaDot: React.CSSProperties = {
  width: '3px',
  height: '3px',
  borderRadius: '50%',
  background: COLORS.slateDark,
};

// ── What Went Right / Wrong ──

const twoCol: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '28px',
  animation: 'fadeUp 0.6s ease-out',
};

const rightWrongCard = (kind: 'right' | 'wrong'): React.CSSProperties => ({
  padding: '16px',
  borderRadius: RADIUS.lg,
  background: kind === 'right' ? COLORS.emeraldBgLight : 'rgba(239, 68, 68, 0.06)',
  border: `1px solid ${kind === 'right' ? COLORS.borderEmeraldLight : 'rgba(239, 68, 68, 0.2)'}`,
});

const rwHeader = (kind: 'right' | 'wrong'): React.CSSProperties => ({
  fontSize: FONT_SIZES.xs,
  fontWeight: 700,
  letterSpacing: '1.5px',
  color: kind === 'right' ? COLORS.emerald : COLORS.red,
  marginBottom: '10px',
  paddingBottom: '6px',
  borderBottom: `1px solid ${kind === 'right' ? COLORS.borderEmeraldLight : 'rgba(239, 68, 68, 0.15)'}`,
});

const rwItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  fontSize: FONT_SIZES.md,
  color: COLORS.slateLight,
  lineHeight: 1.5,
  marginBottom: '6px',
};

const rwIcon = (kind: 'right' | 'wrong'): React.CSSProperties => ({
  color: kind === 'right' ? COLORS.emerald : COLORS.red,
  fontWeight: 700,
  flexShrink: 0,
  marginTop: '1px',
});

// ── Sections ──

const section: React.CSSProperties = {
  marginBottom: '24px',
  animation: 'fadeUp 0.7s ease-out',
};

const sectionTitle: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  letterSpacing: '1.5px',
  color: COLORS.teal,
  fontWeight: 700,
  marginBottom: '10px',
  paddingBottom: '6px',
  borderBottom: `1px solid ${COLORS.borderSubtle}`,
};

// ── Stats Grid ──

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',
};

const statCard: React.CSSProperties = {
  padding: '12px',
  background: COLORS.bgMedium,
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: RADIUS.lg,
  textAlign: 'center',
};

const statLabel: React.CSSProperties = {
  fontSize: FONT_SIZES.xs,
  color: COLORS.slateDark,
  marginBottom: '5px',
  letterSpacing: '0.8px',
  fontWeight: 600,
};

const statVal = (color: string = COLORS.white): React.CSSProperties => ({
  fontSize: '16px',
  fontWeight: 700,
  color,
  fontFamily: FONTS.mono,
});

// ── Score Breakdown ──

const breakdownCard: React.CSSProperties = {
  padding: '16px',
  background: COLORS.bgMedium,
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: RADIUS.lg,
};

const breakdownRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '6px',
};

const breakdownLabel: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  color: COLORS.slate,
};

const breakdownVal = (color: string): React.CSSProperties => ({
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  fontFamily: FONTS.mono,
  color,
});

const breakdownBarOuter: React.CSSProperties = {
  height: '6px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '3px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const breakdownBarFill = (pct: number, color: string): React.CSSProperties => ({
  height: '100%',
  width: `${pct}%`,
  background: color,
  borderRadius: '3px',
  transition: 'width 0.6s ease-out',
});

const breakdownPenalty: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: FONT_SIZES.md,
  color: COLORS.slateDark,
  padding: '4px 0',
};

const breakdownPenaltyVal: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontWeight: 700,
  color: COLORS.red,
};

const breakdownDivider: React.CSSProperties = {
  height: '1px',
  background: COLORS.borderSubtle,
  margin: '8px 0',
};

// ── Objectives ──

const objectiveRow = (completed: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  marginBottom: '6px',
  background: completed ? COLORS.emeraldBgLight : 'rgba(239, 68, 68, 0.05)',
  border: `1px solid ${completed ? COLORS.borderEmeraldLight : 'rgba(239, 68, 68, 0.2)'}`,
  borderRadius: RADIUS.lg,
});

const objIcon = (completed: boolean): React.CSSProperties => ({
  fontSize: '16px',
  fontWeight: 700,
  color: completed ? COLORS.emerald : COLORS.red,
  flexShrink: 0,
  width: '20px',
  textAlign: 'center',
});

const objBody: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
};

const objText: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  color: COLORS.white,
  lineHeight: 1.4,
};

const objBadge = (completed: boolean): React.CSSProperties => ({
  fontSize: '8px',
  fontWeight: 700,
  letterSpacing: '0.8px',
  padding: '2px 6px',
  borderRadius: RADIUS.sm,
  flexShrink: 0,
  color: completed ? COLORS.emerald : COLORS.red,
  background: completed ? COLORS.emeraldBg : COLORS.redBg,
  border: `1px solid ${completed ? COLORS.borderEmeraldLight : 'rgba(239, 68, 68, 0.3)'}`,
});

// ── Safety Analysis ──

const safetyCard: React.CSSProperties = {
  padding: '14px',
  background: 'rgba(239, 68, 68, 0.05)',
  border: `1px solid rgba(239, 68, 68, 0.2)`,
  borderRadius: RADIUS.lg,
};

const violationRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '6px 0',
};

const violationDot: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: COLORS.red,
  marginTop: '5px',
  flexShrink: 0,
  boxShadow: `0 0 6px ${COLORS.red}`,
};

const violationInfo: React.CSSProperties = {
  flex: 1,
};

const violationParam: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  fontWeight: 700,
  color: COLORS.red,
  marginBottom: '2px',
};

const violationDetail: React.CSSProperties = {
  fontSize: FONT_SIZES.sm,
  color: COLORS.slate,
  fontFamily: FONTS.mono,
};

// ── Feedback ──

const feedbackCard: React.CSSProperties = {
  padding: '14px',
  background: COLORS.amberBg,
  border: `1px solid ${COLORS.borderAmber}`,
  borderRadius: RADIUS.lg,
};

const feedbackRow: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  color: COLORS.slateLight,
  lineHeight: 1.7,
  marginBottom: '4px',
};

// ── Control Log ──

const logCard: React.CSSProperties = {
  padding: '12px',
  background: COLORS.bgMedium,
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: RADIUS.lg,
  fontFamily: FONTS.mono,
  fontSize: FONT_SIZES.sm,
  maxHeight: '220px',
  overflowY: 'auto',
};

const logRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '3px 0',
};

const logTime: React.CSSProperties = {
  color: COLORS.slateDark,
  minWidth: '70px',
};

const logBadge = (color: string): React.CSSProperties => ({
  fontSize: '8px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  padding: '1px 5px',
  borderRadius: RADIUS.sm,
  background: `${color}20`,
  color,
  border: `1px solid ${color}40`,
  minWidth: '62px',
  textAlign: 'center',
});

const logDetail: React.CSSProperties = {
  color: COLORS.slate,
};

const logMore: React.CSSProperties = {
  marginTop: '6px',
  color: COLORS.slateDark,
  fontStyle: 'italic',
  fontSize: FONT_SIZES.xs,
};

// ── Action Buttons ──

const actionBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  marginTop: '36px',
  paddingTop: '20px',
  borderTop: `1px solid ${COLORS.borderSubtle}`,
};

const btnBase: React.CSSProperties = {
  padding: '10px 22px',
  border: 'none',
  borderRadius: RADIUS.md,
  fontSize: FONT_SIZES.lg,
  fontWeight: 700,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  fontFamily: FONTS.sans,
  transition: 'all 0.15s',
};

const btnBack: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(255,255,255,0.04)',
  color: COLORS.slate,
  border: `1px solid ${COLORS.borderMedium}`,
};

const btnRetry: React.CSSProperties = {
  ...btnBase,
  background: COLORS.amber,
  color: '#000',
  border: 'none',
};

// ── Instructor Analysis ──

const analysisCategoryCard: React.CSSProperties = {
  padding: '14px 16px',
  background: COLORS.bgMedium,
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: RADIUS.lg,
};

const analysisCategoryHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
};

const analysisCategoryTitle: React.CSSProperties = {
  fontSize: FONT_SIZES.md,
  fontWeight: 700,
  color: COLORS.white,
  letterSpacing: '0.3px',
};

const analysisCategoryBadge = (color: string): React.CSSProperties => ({
  fontSize: '8px',
  fontWeight: 700,
  letterSpacing: '1px',
  padding: '2px 8px',
  borderRadius: RADIUS.sm,
  color,
  background: `${color}18`,
  border: `1px solid ${color}40`,
});

const analysisCategoryBar: React.CSSProperties = {
  height: '4px',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '2px',
  overflow: 'hidden',
};

const analysisCategoryBarFill = (color: string, rating: string): React.CSSProperties => ({
  height: '100%',
  width: rating === 'excellent' ? '100%' : rating === 'good' ? '75%' : rating === 'fair' ? '45%' : '20%',
  background: color,
  borderRadius: '2px',
  transition: 'width 0.6s ease-out',
  boxShadow: `0 0 6px ${color}40`,
});

const analysisPoint = (isTip: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  fontSize: FONT_SIZES.sm,
  color: isTip ? COLORS.blue : COLORS.slateLight,
  lineHeight: 1.6,
  fontStyle: isTip ? 'italic' : 'normal',
});

const analysisPointDot = (color: string): React.CSSProperties => ({
  color,
  fontWeight: 700,
  flexShrink: 0,
  marginTop: '1px',
  fontFamily: FONTS.mono,
});
