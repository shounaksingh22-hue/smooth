import React, { useEffect, useState } from "react";
import { useCleanupStore } from "../../stores/cleanupStore";
import { useAnalysisStore } from "../../stores/analysisStore";
import { useAppStore } from "../../stores/appStore";
import { useCleanup } from "../../hooks/useCleanup";
import { Check, Loader2 } from "lucide-react";
import { ProgressBar } from "../common/ProgressBar";

export const CleanupExecutor: React.FC = () => {
  const { isCleaning, results, selectedActions } = useCleanupStore();
  const { diagnosisResult } = useAnalysisStore();
  const { runCleanup } = useCleanup();
  const { setPhase } = useAppStore();
  const [progress, setProgress] = useState(0);

  const selectedSuggestions = (diagnosisResult?.suggestions ?? []).filter((s) =>
    selectedActions.includes(s.id)
  );

  // Trigger cleanup on mount
  useEffect(() => {
    runCleanup();
  }, []);

  // Animate progress, then advance to results
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCleaning) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + Math.random() * 8));
      }, 250);
    } else if (results.length > 0) {
      setProgress(100);
      const timer = setTimeout(() => setPhase("results"), 1200);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isCleaning, results, setPhase]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 max-w-md mx-auto w-full select-none">
      <div className="grid place-items-center h-14 w-14 rounded-full border border-border mb-5">
        {isCleaning ? (
          <Loader2 size={24} className="text-accent animate-spin-slow" />
        ) : (
          <Check size={24} className="text-success" strokeWidth={2.5} />
        )}
      </div>

      <h2 className="text-lg font-semibold text-fg">
        {isCleaning ? "Optimizing…" : "Optimization complete"}
      </h2>
      <p className="text-xs text-muted text-center mt-1.5 mb-6 leading-relaxed">
        {isCleaning
          ? "Clearing the selected items. Every action is logged locally for full transparency."
          : "Re-measuring reclaimed space."}
      </p>

      <ProgressBar progress={progress} tone={isCleaning ? "accent" : "success"} className="w-full" />
      <div className="flex justify-between w-full mt-2">
        <span className="label">{progress.toFixed(0)}%</span>
        <span className="label">{isCleaning ? "processing" : "done"}</span>
      </div>

      <div className="w-full mt-6 flex flex-col gap-2">
        {selectedSuggestions.map((s) => (
          <div key={s.id} className="card p-3 flex items-center justify-between">
            <span className="text-xs text-fg font-medium">{s.title}</span>
            {isCleaning ? (
              <span className="label animate-pulse-soft">running</span>
            ) : (
              <span className="text-success flex items-center gap-1 text-[11px] font-medium">
                <Check size={12} /> done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
