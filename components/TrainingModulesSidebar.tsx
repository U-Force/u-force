"use client";

import React, { useState, useEffect } from 'react';
import {
  TRAINING_MODULES,
  getAllModuleProgress,
  loadCompletionData,
  resetCompletionData,
  type ModuleProgress,
} from '../lib/training/modules';

interface TrainingModulesSidebarProps {
  currentScenarioId?: string;
  onModuleClick?: (moduleId: string) => void;
}

export default function TrainingModulesSidebar({
  currentScenarioId,
  onModuleClick,
}: TrainingModulesSidebarProps) {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load progress on mount and when current scenario changes
  useEffect(() => {
    const updateProgress = () => {
      const completed = loadCompletionData();
      const progress = getAllModuleProgress(completed);
      setModuleProgress(progress);
    };

    updateProgress();

    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'u-force-training-completion') {
        updateProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentScenarioId]);

  const handleReset = () => {
    if (confirm('Reset all training progress? This cannot be undone.')) {
      resetCompletionData();
      const progress = getAllModuleProgress([]);
      setModuleProgress(progress);
    }
  };

  const overallCompletion = moduleProgress.length > 0
    ? Math.round(
        moduleProgress.reduce((sum, m) => sum + m.completionPercent, 0) /
          moduleProgress.length
      )
    : 0;

  if (isCollapsed) {
    return (
      <div style={collapsedContainer}>
        <button style={expandButton} onClick={() => setIsCollapsed(false)}>
          ▶
        </button>
        <div style={collapsedProgress}>
          <div style={collapsedProgressFill(overallCompletion)} />
        </div>
        <div style={collapsedText}>{overallCompletion}%</div>
      </div>
    );
  }

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div style={headerContent}>
          <div style={title}>TRAINING MODULES</div>
          <div style={subtitle}>Operator Certification Program</div>
        </div>
        <button style={collapseButton} onClick={() => setIsCollapsed(true)}>
          ◀
        </button>
      </div>

      {/* Overall Progress */}
      <div style={overallSection}>
        <div style={overallLabel}>Overall Progress</div>
        <div style={overallProgressBar}>
          <div style={overallProgressFill(overallCompletion)} />
        </div>
        <div style={overallPercent}>{overallCompletion}%</div>
      </div>

      {/* Module List */}
      <div style={moduleList}>
        {TRAINING_MODULES.map((module) => {
          const progress = moduleProgress.find((p) => p.moduleId === module.id);
          const percent = progress?.completionPercent || 0;
          const completed = progress?.completedScenarios.length || 0;
          const total = progress?.totalScenarios || 0;

          return (
            <div
              key={module.id}
              style={moduleCard(module.color, percent)}
              onClick={() => onModuleClick?.(module.id)}
            >
              <div style={moduleHeader}>
                <div style={moduleIcon(module.color, percent)}>
                  {percent === 100 ? '✓' : module.order}
                </div>
                <div style={moduleInfo}>
                  <div style={moduleName}>{module.name}</div>
                  <div style={moduleDesc}>{module.description}</div>
                </div>
              </div>

              <div style={moduleProgressSection}>
                <div style={moduleProgressBar}>
                  <div style={moduleProgressFill(module.color, percent)} />
                </div>
                <div style={moduleStats}>
                  <span style={modulePercent(percent)}>{percent}%</span>
                  <span style={moduleCount}>
                    {completed}/{total} {total === 1 ? 'scenario' : 'scenarios'}
                  </span>
                </div>
              </div>

              {percent === 100 && (
                <div style={completeBadge}>
                  <span>COMPLETE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div style={footer}>
        <button style={resetButton} onClick={handleReset}>
          🔄 RESET PROGRESS
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const collapsedContainer: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'linear-gradient(90deg, #2a2a2a 0%, #1a1a1a 100%)',
  border: '2px solid #444',
  borderLeft: 'none',
  borderRadius: '0 8px 8px 0',
  padding: '12px 6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '2px 0 8px rgba(0,0,0,0.8)',
  zIndex: 1000,
};

const expandButton: React.CSSProperties = {
  background: 'linear-gradient(180deg, #00aa00 0%, #008800 100%)',
  border: '2px solid #00ff00',
  borderRadius: '4px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#000',
  fontWeight: 'bold',
  boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
};

const collapsedProgress: React.CSSProperties = {
  width: '24px',
  height: '100px',
  background: '#222',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  border: '1px solid #444',
};

const collapsedProgressFill = (percent: number): React.CSSProperties => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: `${percent}%`,
  background: 'linear-gradient(180deg, #00ff00 0%, #00aa00 100%)',
  transition: 'height 0.3s',
});

const collapsedText: React.CSSProperties = {
  fontSize: '10px',
  color: '#00ff00',
  fontFamily: "'Share Tech Mono', monospace",
  fontWeight: 'bold',
  textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
};

const container: React.CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  width: '320px',
  background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
  border: '3px solid #444',
  borderLeft: 'none',
  borderTop: 'none',
  borderBottom: 'none',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '2px 0 12px rgba(0,0,0,0.8)',
  zIndex: 1000,
  fontFamily: "'Share Tech Mono', monospace",
};

const header: React.CSSProperties = {
  padding: '16px',
  background: 'linear-gradient(180deg, #333 0%, #222 100%)',
  borderBottom: '2px solid #444',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
};

const headerContent: React.CSSProperties = {
  flex: 1,
};

const title: React.CSSProperties = {
  fontSize: '14px',
  color: '#00ff88',
  letterSpacing: '2px',
  fontWeight: 'bold',
  marginBottom: '4px',
  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
};

const subtitle: React.CSSProperties = {
  fontSize: '9px',
  color: '#6f6',
  letterSpacing: '1px',
};

const collapseButton: React.CSSProperties = {
  background: 'linear-gradient(180deg, #555 0%, #333 100%)',
  border: '2px solid #666',
  borderRadius: '3px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#aaa',
  fontWeight: 'bold',
  boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
};

const overallSection: React.CSSProperties = {
  padding: '16px',
  background: 'rgba(0, 255, 136, 0.05)',
  borderBottom: '2px solid #444',
};

const overallLabel: React.CSSProperties = {
  fontSize: '10px',
  color: '#00ffaa',
  letterSpacing: '1.5px',
  marginBottom: '8px',
  textTransform: 'uppercase',
};

const overallProgressBar: React.CSSProperties = {
  height: '20px',
  background: '#222',
  borderRadius: '10px',
  overflow: 'hidden',
  border: '2px solid #333',
  position: 'relative',
  marginBottom: '8px',
};

const overallProgressFill = (percent: number): React.CSSProperties => ({
  height: '100%',
  width: `${percent}%`,
  background: 'linear-gradient(90deg, #00ff00 0%, #00aa00 100%)',
  transition: 'width 0.5s',
  boxShadow: `0 0 10px rgba(0, 255, 0, 0.6)`,
});

const overallPercent: React.CSSProperties = {
  fontSize: '18px',
  color: '#00ff00',
  fontWeight: 'bold',
  textAlign: 'center',
  textShadow: '0 0 10px rgba(0, 255, 0, 0.8)',
};

const moduleList: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const moduleCard = (color: string, percent: number): React.CSSProperties => ({
  background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)`,
  border: `2px solid ${percent === 100 ? color : '#333'}`,
  borderRadius: '6px',
  padding: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: percent === 100 ? `0 0 15px ${color}40, inset 0 1px 0 rgba(255,255,255,0.1)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
  position: 'relative',
});

const moduleHeader: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  marginBottom: '12px',
  alignItems: 'flex-start',
};

const moduleIcon = (color: string, percent: number): React.CSSProperties => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: percent === 100 ? `radial-gradient(circle, ${color} 0%, ${color}aa 100%)` : 'radial-gradient(circle, #333 0%, #222 100%)',
  border: `2px solid ${color}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  color: percent === 100 ? '#000' : color,
  flexShrink: 0,
  boxShadow: percent === 100 ? `0 0 10px ${color}` : 'inset 0 2px 4px rgba(0,0,0,0.8)',
});

const moduleInfo: React.CSSProperties = {
  flex: 1,
};

const moduleName: React.CSSProperties = {
  fontSize: '13px',
  color: '#00ffaa',
  fontWeight: 'bold',
  marginBottom: '4px',
  letterSpacing: '1px',
};

const moduleDesc: React.CSSProperties = {
  fontSize: '9px',
  color: '#888',
  lineHeight: 1.4,
};

const moduleProgressSection: React.CSSProperties = {
  marginTop: '8px',
};

const moduleProgressBar: React.CSSProperties = {
  height: '6px',
  background: '#222',
  borderRadius: '3px',
  overflow: 'hidden',
  border: '1px solid #333',
  marginBottom: '6px',
};

const moduleProgressFill = (color: string, percent: number): React.CSSProperties => ({
  height: '100%',
  width: `${percent}%`,
  background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
  transition: 'width 0.5s',
  boxShadow: percent > 0 ? `0 0 8px ${color}80` : 'none',
});

const moduleStats: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const modulePercent = (percent: number): React.CSSProperties => ({
  fontSize: '12px',
  color: percent === 100 ? '#00ff00' : percent > 0 ? '#ffaa00' : '#666',
  fontWeight: 'bold',
});

const moduleCount: React.CSSProperties = {
  fontSize: '9px',
  color: '#666',
};

const completeBadge: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'linear-gradient(135deg, #00ff00 0%, #00aa00 100%)',
  color: '#000',
  fontSize: '8px',
  fontWeight: 'bold',
  padding: '4px 8px',
  borderRadius: '3px',
  letterSpacing: '1px',
  boxShadow: '0 0 10px rgba(0, 255, 0, 0.6)',
};

const footer: React.CSSProperties = {
  padding: '12px',
  borderTop: '2px solid #444',
  background: 'linear-gradient(180deg, #222 0%, #1a1a1a 100%)',
};

const resetButton: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: 'linear-gradient(180deg, #555 0%, #333 100%)',
  border: '2px solid #666',
  borderRadius: '4px',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1.5px',
  color: '#aaa',
  cursor: 'pointer',
  fontFamily: "'Share Tech Mono', monospace",
  textTransform: 'uppercase',
  boxShadow: '0 2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  transition: 'all 0.15s',
};
