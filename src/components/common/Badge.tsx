import React from "react";
import { RiskLevel, RISK_META } from "../../types/diagnosis";

interface BadgeProps {
  level: RiskLevel;
}

export const Badge: React.FC<BadgeProps> = ({ level }) => {
  const meta = RISK_META[level] || {
    label: String(level),
    color: "#94a3b8",
    bgColor: "rgba(148, 163, 184, 0.1)",
  };

  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold select-none border border-slate-700/30 ${styleClass}`}
      style={{ color: meta.color, backgroundColor: meta.bgColor }}
    >
      {meta.label}
    </span>
  );
};
