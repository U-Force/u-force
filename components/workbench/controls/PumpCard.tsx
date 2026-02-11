"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { PumpScramControls } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface PumpCardProps {
  pumpOn: boolean;
  tripActive: boolean;
  onPumpToggle: () => void;
  onScram: () => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function PumpCard({
  pumpOn,
  tripActive,
  onPumpToggle,
  onScram,
  onClose,
  learningMode = false,
}: PumpCardProps) {
  return (
    <SoftControlCard title="RCP & PROTECTION SYSTEM" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.pump.title} description={CONTROL_HELP.pump.description} position="top" />
      <PumpScramControls
        pumpOn={pumpOn}
        tripActive={tripActive}
        onPumpToggle={onPumpToggle}
        onScram={onScram}
        scramDisabled={false}
      />
    </SoftControlCard>
  );
}
