"use client";
import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showPercentage?: boolean;
  showLabels?: boolean;
  labelStart?: string;
  labelEnd?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className = "",
  showPercentage = true,
  showLabels = false,
  labelStart = "0",
  labelEnd,
}) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between mb-2 text-sm">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-2 bg-cyan-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {showLabels && (
        <div className="flex justify-between mt-2 text-sm">
          <span>{value}</span>
          <span>{labelEnd || max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 