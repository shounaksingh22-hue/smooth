import React from "react";
import { Phase } from "../../stores/appStore";

interface ProgressStepperProps {
  currentPhase: Phase;
}

const PHASES: { id: Phase; label: string }[] = [
  { id: "welcome", label: "Trust" },
  { id: "analyze", label: "Analyze" },
  { id: "diagnose", label: "Diagnose" },
  { id: "cleanup", label: "Optimize" },
  { id: "results", label: "Summary" },
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentPhase }) => {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <div className="flex items-center gap-1 w-full bg-slate-900/60 p-2 border border-slate-800/50 justify-between select-none max-w-xl mx-auto mb-4 overflow-x-auto">
      {PHASES.map((p, idx) => {
        const isActive = p.id === currentPhase;
        const isCompleted = idx < currentIndex;
        
        return (
          <div key={p.id} className="flex items-center gap-2 shrink-0">
            <span
              className={`flex items-center justify-center w-6 h-6 text-xs font-bold ${styleClass} transition-colors ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-extrabold"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {idx + 1}
            </span>
            <span
              className={`text-xs font-semibold transition-colors hidden sm:inline ${
                isActive ? "text-slate-100 font-bold" : isCompleted ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {p.label}
            </span>
            {idx < PHASES.length - 1 && (
              <span className="text-slate-700 mx-1 hidden sm:inline">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
