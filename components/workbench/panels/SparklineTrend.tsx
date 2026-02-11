"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  ReferenceLine,
} from "recharts";

interface SparklineTrendProps {
  data: { value: number }[];
  color?: string;
  height?: number;
  warningLevel?: number;
  dangerLevel?: number;
  min?: number;
  max?: number;
}

export default function SparklineTrend({
  data,
  color = "#10b981",
  height = 32,
  warningLevel,
  dangerLevel,
  min,
  max,
}: SparklineTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <YAxis domain={[min ?? "auto", max ?? "auto"]} hide />
        {dangerLevel !== undefined && (
          <ReferenceLine y={dangerLevel} stroke="#ef4444" strokeDasharray="2 2" />
        )}
        {warningLevel !== undefined && (
          <ReferenceLine y={warningLevel} stroke="#f59e0b" strokeDasharray="2 2" />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
