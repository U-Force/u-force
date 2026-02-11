"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { BoronControl } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface BoronCardProps {
  boronConc: number;
  boronActual: number;
  onBoronChange: (v: number) => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function BoronCard({
  boronConc,
  boronActual,
  onBoronChange,
  onClose,
  learningMode = false,
}: BoronCardProps) {
  return (
    <SoftControlCard title="SOLUBLE BORON (CVCS)" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.boron.title} description={CONTROL_HELP.boron.description} position="top" />
      <BoronControl
        boronConc={boronConc}
        boronActual={boronActual}
        onBoronChange={onBoronChange}
      />
    </SoftControlCard>
  );
}
