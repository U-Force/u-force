"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { ControlRodSlider } from "../../simulator";

interface ControlRodCardProps {
  rod: number;
  rodActual: number;
  tripActive: boolean;
  onRodChange: (v: number) => void;
  onClose: () => void;
}

export default function ControlRodCard({
  rod,
  rodActual,
  tripActive,
  onRodChange,
  onClose,
}: ControlRodCardProps) {
  return (
    <SoftControlCard title="CONTROL ROD ASSEMBLY" onClose={onClose}>
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
