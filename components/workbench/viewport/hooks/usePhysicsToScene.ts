"use client";

import { useMemo } from "react";
import type { ReactorState } from "../../../../lib/reactor/types";
import type { ViewMode } from "../../WorkbenchContext";

/**
 * Maps ReactorState + controls → visual properties consumed by 3D scene geometry.
 */
export interface SceneProps {
  // Core
  power: number;
  rodPosition: number;
  coolantTemp: number;
  pumpOn: boolean;
  flowSpeed: number;

  // View
  containmentVisible: boolean;
  viewMode: ViewMode;
}

export function usePhysicsToScene(
  state: ReactorState | null,
  rodActual: number,
  pumpOn: boolean,
  viewMode: ViewMode
): SceneProps {
  return useMemo<SceneProps>(() => {
    if (!state) {
      return {
        power: 0,
        rodPosition: 0,
        coolantTemp: 300,
        pumpOn: false,
        flowSpeed: 0,
        containmentVisible: true,
        viewMode,
      };
    }

    const power = Math.min(state.P, 1.5);
    const coolantTemp = state.Tc;

    const flowSpeed = pumpOn
      ? 0.3 + power * 0.7
      : power > 0.01
      ? 0.1
      : 0;

    return {
      power,
      rodPosition: rodActual,
      coolantTemp,
      pumpOn,
      flowSpeed,
      containmentVisible: viewMode !== "xray",
      viewMode,
    };
  }, [state, rodActual, pumpOn, viewMode]);
}
