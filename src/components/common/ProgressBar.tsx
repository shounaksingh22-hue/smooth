import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "from-emerald-500 to-teal-500",
  className = "",
}) => {
  const percentage = Math.min(Math.max(progress, 0), 100);
  
  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <div className={`w-full bg-slate-800/80 h-2 overflow-hidden ${styleClass} ${className}`}>
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-300 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
