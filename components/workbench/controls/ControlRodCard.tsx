"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { ControlRodSlider } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface ControlRodCardProps {
  rod: number;
  rodActual: number;
  tripActive: boolean;
  onRodChange: (v: number) => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function ControlRodCard({
  rod,
  rodActual,
  tripActive,
  onRodChange,
  onClose,
  learningMode = false,
}: ControlRodCardProps) {
  return (
    <SoftControlCard title="CONTROL ROD ASSEMBLY" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.rod.title} description={CONTROL_HELP.rod.description} position="top" />
      <ControlRodSlider
        rod={rod}
        rodActual={rodActual}
        onRodChange={onRodChange}
        disabled={false}
        tripActive={tripActive}
        showActiveHint
        showScramHint
      />
    </SoftControlCard>
  );
}
