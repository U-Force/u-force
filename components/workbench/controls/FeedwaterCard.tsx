"use client";

import React from "react";
import SoftControlCard from "./SoftControlCard";
import { FeedwaterControl } from "../../simulator";
import { LearningTooltip } from "../shared";
import { CONTROL_HELP } from "../../../lib/workbench/learning-content";

interface FeedwaterCardProps {
  feedwaterFlow: number;
  feedwaterFlowActual: number;
  onFeedwaterChange: (v: number) => void;
  onClose: () => void;
  learningMode?: boolean;
}

export default function FeedwaterCard({
  feedwaterFlow,
  feedwaterFlowActual,
  onFeedwaterChange,
  onClose,
  learningMode = false,
}: FeedwaterCardProps) {
  return (
    <SoftControlCard title="FEEDWATER" onClose={onClose}>
      <LearningTooltip visible={learningMode} title={CONTROL_HELP.feedwater.title} description={CONTROL_HELP.feedwater.description} position="top" />
      <FeedwaterControl
        feedwaterFlow={feedwaterFlow}
        feedwaterFlowActual={feedwaterFlowActual}
        onFeedwaterChange={onFeedwaterChange}
      />
    </SoftControlCard>
  );
}
