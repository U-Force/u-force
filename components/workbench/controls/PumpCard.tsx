"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { PumpScramControls } from "../../simulator";

interface PumpCardProps {
  pumpOn: boolean;
  tripActive: boolean;
  onPumpToggle: () => void;
  onScram: () => void;
  onClose: () => void;
}

export default function PumpCard({
  pumpOn,
  tripActive,
  onPumpToggle,
  onScram,
  onClose,
}: PumpCardProps) {
  return (
    <SoftControlCard title="RCP & PROTECTION SYSTEM" onClose={onClose}>
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
