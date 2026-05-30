import React from "react";

interface ProgressBarProps {
  progress: number; // 0..100
  tone?: "accent" | "success" | "warn" | "danger";
  indeterminate?: boolean;
  className?: string;
}

const TONE: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  tone = "accent",
  indeterminate = false,
  className = "",
}) => {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <div className={`w-full h-1.5 rounded-full bg-elevated overflow-hidden ${className}`}>
      {indeterminate ? (
        <div className={`h-full w-1/3 rounded-full ${TONE[tone]} animate-indeterminate`} />
      ) : (
        <div
          className={`h-full rounded-full ${TONE[tone]} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
};
