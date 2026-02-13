"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { SteamDumpControl } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface SteamDumpCardProps {
  steamDump: number;
  steamDumpActual: number;
  onSteamDumpChange: (v: number) => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function SteamDumpCard({
  steamDump,
  steamDumpActual,
  onSteamDumpChange,
  onClose,
  learningMode = false,
}: SteamDumpCardProps) {
  return (
    <SoftControlCard title="STEAM DUMP" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.steamDump.title} description={CONTROL_HELP.steamDump.description} position="top" />
      <SteamDumpControl
        steamDump={steamDump}
        steamDumpActual={steamDumpActual}
        onSteamDumpChange={onSteamDumpChange}
      />
    </SoftControlCard>
  );
}
