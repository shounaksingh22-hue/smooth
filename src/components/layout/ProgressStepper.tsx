import React from "react";
import { Phase } from "../../stores/appStore";
import { Check } from "lucide-react";

const STEPS: { id: Phase; label: string }[] = [
  { id: "analyze", label: "Analyze" },
  { id: "diagnose", label: "Diagnose" },
  { id: "cleanup", label: "Optimize" },
  { id: "results", label: "Summary" },
];

export const ProgressStepper: React.FC<{ currentPhase: Phase }> = ({ currentPhase }) => {
  const curIdx = STEPS.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center gap-2 mb-7 select-none">
      {STEPS.map((p, idx) => {
        const isActive = p.id === currentPhase;
        const isDone = idx < curIdx;
        return (
          <React.Fragment key={p.id}>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`grid place-items-center h-6 w-6 rounded-full text-[11px] font-semibold border transition-colors ${
                  isActive
                    ? "bg-accent text-accent-fg border-accent"
                    : isDone
                    ? "bg-accent-soft text-accent border-transparent"
                    : "bg-surface text-faint border-border"
                }`}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </span>
              <span
                className={`text-xs hidden sm:inline ${
                  isActive ? "text-fg font-medium" : isDone ? "text-muted" : "text-faint"
                }`}
              >
                {p.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px flex-1 min-w-3 ${isDone ? "bg-accent" : "bg-border"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
