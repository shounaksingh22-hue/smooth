import React from "react";
import { RiskLevel } from "../../types/diagnosis";

const META: Record<RiskLevel, { label: string; cls: string }> = {
  safe: { label: "Safe", cls: "text-success bg-success-soft" },
  low: { label: "Low", cls: "text-success bg-success-soft" },
  medium: { label: "Medium", cls: "text-warn bg-warn-soft" },
  high: { label: "High", cls: "text-danger bg-danger-soft" },
};

export const Badge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const meta = META[level] ?? { label: String(level), cls: "text-muted bg-elevated" };
  return (
    <span className={`label px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
  );
};
