import React, { useState } from "react";
import { useCleanupStore } from "../../stores/cleanupStore";
import { useAnalysisStore } from "../../stores/analysisStore";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { formatBytes } from "../../lib/formatters";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import {
  FileText,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Info,
  CheckCircle,
  Terminal,
} from "lucide-react";

export const ResultsDashboard: React.FC = () => {
  const { results, freedBytesTotal, actionLog, reset: resetCleanup } = useCleanupStore();
  const { systemInfo, reset: resetAnalysis } = useAnalysisStore();
  const { setPhase } = useAppStore();
  
  const [showLog, setShowLog] = useState(false);

  const styleClass = "rounded-[var(--radius-ui)]";

  const totalUsedBefore = systemInfo?.storage.used_bytes || 0;
  const totalUsedAfter = Math.max(totalUsedBefore - freedBytesTotal, 0);

  // Chart Data: Compare used space before vs after
  const chartData = [
    {
      name: "Before Cleanup",
      used: parseFloat((totalUsedBefore / 1_000_000_000).toFixed(2)),
      color: "#f43f5e",
    },
    {
      name: "After Cleanup",
      used: parseFloat((totalUsedAfter / 1_000_000_000).toFixed(2)),
      color: "#10b981",
    },
  ];

  const handleResetAll = () => {
    resetCleanup();
    resetAnalysis();
    setPhase("welcome");
  };

  return (
    <div className="flex-1 flex flex-col gap-6 select-none hud-grid px-2">
      {/* Celebration Panel */}
      <Card className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 border-emerald-500/20 bg-slate-900/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2 hud-glow">
              Optimization Complete!
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Console Developer: Shounak. Caches cleared successfully, background processes throttled, and storage allocations re-measured.
            </p>
          </div>
        </div>

        <Button variant="primary" onClick={handleResetAll} className="font-extrabold w-full md:w-auto tracking-wide uppercase text-xs">
          <RotateCcw size={14} /> Start New Scan
        </Button>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between bg-slate-900/10 border-slate-800/80">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Space Freed</span>
            <p className="text-2xl font-black text-emerald-400 mt-1 hud-glow">{formatBytes(freedBytesTotal)}</p>
          </div>
          <TrendingDown className="w-8 h-8 text-emerald-400/20" />
        </Card>

        <Card className="p-5 flex items-center justify-between bg-slate-900/10 border-slate-800/80">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Removed Records</span>
            <p className="text-2xl font-black text-slate-100 mt-1">
              {results[0]?.files_removed || 0} files
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-slate-700/20" />
        </Card>
      </div>

      {/* Comparison Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-5 bg-slate-900/10 border-slate-800/80 flex flex-col justify-between">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            System Drive Space Allocation (GB)
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2 text-xs rounded">
                          <span className="font-bold text-slate-200">{payload[0].value} GB</span> Used
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="used" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Maintenance / Follow-up Panel */}
        <Card className="p-5 bg-slate-900/10 border-slate-800/80 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Reboot Advised
          </h4>
          <div className="flex gap-3 items-start">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal">
              A quick reboot is recommended to refresh all system memory registers and clear active system lock cache trees completely.
            </p>
          </div>

          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
            Maintenance Guide
          </h4>
          <ul className="text-[11px] text-slate-400 flex flex-col gap-2 list-disc pl-4 leading-normal">
            <li>Keep disk drive above 15% free.</li>
            <li>Limit login services in Autostart.</li>
            <li>Run this console scan every 60 days.</li>
          </ul>
        </Card>
      </div>

      {/* Action Log Accordion */}
      <div>
        <Button variant="ghost" onClick={() => setShowLog(!showLog)} className="w-full justify-between font-bold text-xs uppercase tracking-wide">
          <span className="flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400" /> View Holographic Action Transcripts
          </span>
          <span>{showLog ? "Collapse" : "Expand"}</span>
        </Button>

        {showLog && (
          <Card className="mt-2 p-0 bg-slate-950/60 border-slate-850 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/20 to-transparent" />
            <pre className="p-4 text-[10px] font-mono text-emerald-400/90 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed select-text">
              {actionLog || "No active logs compiled."}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};
