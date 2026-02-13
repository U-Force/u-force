"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { PressurizerControl } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface PressurizerCardProps {
  pressure: number;
  heater: number;
  heaterActual: number;
  spray: number;
  sprayActual: number;
  onHeaterChange: (v: number) => void;
  onSprayChange: (v: number) => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function PressurizerCard({
  pressure,
  heater,
  heaterActual,
  spray,
  sprayActual,
  onHeaterChange,
  onSprayChange,
  onClose,
  learningMode = false,
}: PressurizerCardProps) {
  return (
    <SoftControlCard title="PRESSURIZER" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.pressurizer.title} description={CONTROL_HELP.pressurizer.description} position="top" />
      <PressurizerControl
        pressure={pressure}
        heater={heater}
        heaterActual={heaterActual}
        spray={spray}
        sprayActual={sprayActual}
        onHeaterChange={onHeaterChange}
        onSprayChange={onSprayChange}
      />
    </SoftControlCard>
  );
}
