import React, { useEffect, useState } from "react";
import { useCleanupStore } from "../../stores/cleanupStore";
import { useAppStore } from "../../stores/appStore";
import { useCleanup } from "../../hooks/useCleanup";
import { Card } from "../common/Card";
import { ProgressBar } from "../common/ProgressBar";
import { Activity, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { formatBytes } from "../../lib/formatters";

export const CleanupExecutor: React.FC = () => {
  const { isCleaning, results, selectedActions } = useCleanupStore();
  const { runCleanup } = useCleanup();
  const { setPhase } = useAppStore();
  const [progress, setProgress] = useState(0);

  // Trigger cleanup on mount
  useEffect(() => {
    runCleanup();
  }, []);

  // Animate progress bar during cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCleaning) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 8;
        });
      }, 250);
    } else if (results.length > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setPhase("results");
      }, 1500);
      return () => clearTimeout(timer);
    }
    return () => clearInterval(interval);
  }, [isCleaning, results, setPhase]);

  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-16 max-w-xl mx-auto select-none">
      <Card className="w-full p-8 border-slate-800/80 bg-slate-900/10 flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          {isCleaning ? (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
              <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
            </>
          ) : (
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-2">
          {isCleaning ? "Performing Safe Optimization..." : "Optimization Complete!"}
        </h3>
        
        <p className="text-slate-400 text-xs text-center mb-6 leading-relaxed">
          {isCleaning
            ? `Clearing selected file cache trees. App logs are being written locally for transparency.`
            : `Completed successfully. Re-measuring reclaimed storage capacity.`}
        </p>

        <ProgressBar progress={progress} className="mb-4" />

        <div className="flex justify-between w-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>{progress.toFixed(0)}%</span>
          <span>{isCleaning ? "processing batches" : "finishing up"}</span>
        </div>
      </Card>

      {/* Details Box */}
      <div className="w-full mt-4 flex flex-col gap-2">
        {selectedActions.map((cat, idx) => (
          <div
            key={idx}
            className={`p-3 border border-slate-800/60 flex items-center justify-between text-xs ${
              isCleaning ? "bg-slate-950/20" : "bg-slate-900/20"
            } ${styleClass}`}
          >
            <span className="text-slate-400 font-semibold">{cat}</span>
            {isCleaning ? (
              <span className="text-emerald-500/80 font-bold uppercase tracking-wider animate-pulse">Running</span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Cleaned
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
