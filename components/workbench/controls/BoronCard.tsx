"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { BoronControl } from "../../simulator";

interface BoronCardProps {
  boronConc: number;
  boronActual: number;
  onBoronChange: (v: number) => void;
  onClose: () => void;
}

export default function BoronCard({
  boronConc,
  boronActual,
  onBoronChange,
  onClose,
}: BoronCardProps) {
  return (
    <SoftControlCard title="SOLUBLE BORON (CVCS)" onClose={onClose}>
      <BoronControl
        boronConc={boronConc}
        boronActual={boronActual}
        onBoronChange={onBoronChange}
      />
    </SoftControlCard>
  );
}
