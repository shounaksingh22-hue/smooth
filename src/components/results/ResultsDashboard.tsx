import React, { useState } from "react";
import { useCleanupStore } from "../../stores/cleanupStore";
import { useAnalysisStore } from "../../stores/analysisStore";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { formatBytes } from "../../lib/formatters";
import { buildMaintenancePlan } from "../../lib/advisor";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import {
  RotateCcw,
  TrendingDown,
  FileCheck,
  Terminal,
  ChevronDown,
  MemoryStick,
  HardDrive,
  Globe,
  Zap,
  Cpu,
  Download,
  RefreshCw,
} from "lucide-react";

export const ResultsDashboard: React.FC = () => {
  const { results, freedBytesTotal, actionLog, reset: resetCleanup } = useCleanupStore();
  const { systemInfo, reset: resetAnalysis } = useAnalysisStore();
  const { setPhase } = useAppStore();
  const [showLog, setShowLog] = useState(false);
  const plan = systemInfo ? buildMaintenancePlan(systemInfo) : null;

  const tipIcon = (cat: string) => {
    switch (cat) {
      case "memory":
        return MemoryStick;
      case "storage":
        return HardDrive;
      case "browser":
        return Globe;
      case "startup":
        return Zap;
      case "hardware":
        return Cpu;
      case "updates":
        return Download;
      default:
        return RefreshCw;
    }
  };

  const usedBefore = systemInfo?.storage.used_bytes || 0;
  const usedAfter = Math.max(usedBefore - freedBytesTotal, 0);

  const chartData = [
    { name: "Before", used: parseFloat((usedBefore / 1_000_000_000).toFixed(2)), fill: "var(--border-strong)" },
    { name: "After", used: parseFloat((usedAfter / 1_000_000_000).toFixed(2)), fill: "var(--accent)" },
  ];

  const handleResetAll = () => {
    resetCleanup();
    resetAnalysis();
    setPhase("welcome");
  };

  return (
    <div className="flex-1 flex flex-col gap-5 select-none">
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
        <div>
          <div className="label">Done</div>
          <h2 className="text-xl font-semibold text-fg mt-1.5">Your machine just got lighter</h2>
          <p className="text-xs text-muted mt-1.5 max-w-md leading-relaxed">
            Selected caches and junk were cleared, and storage was re-measured. A restart helps the system reclaim memory fully.
          </p>
        </div>
        <Button variant="secondary" onClick={handleResetAll} className="shrink-0">
          <RotateCcw size={14} /> New scan
        </Button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <div className="label">Space freed</div>
            <p className="text-3xl font-semibold text-accent mt-2 tabular-nums">{formatBytes(freedBytesTotal)}</p>
          </div>
          <TrendingDown size={28} className="text-accent opacity-30" />
        </Card>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <div className="label">Items removed</div>
            <p className="text-3xl font-semibold text-fg mt-2 tabular-nums">{results[0]?.files_removed ?? 0}</p>
          </div>
          <FileCheck size={28} className="text-muted opacity-30" />
        </Card>
      </div>

      <Card className="p-5">
        <div className="label mb-4">Disk usage · GB</div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <XAxis dataKey="name" stroke="var(--faint)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--faint)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "var(--accent-soft)" }}
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="card px-2.5 py-1.5 text-xs">
                      <span className="font-semibold text-fg tabular-nums">{payload[0].value} GB</span>
                      <span className="text-muted"> used</span>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="used" radius={[6, 6, 0, 0]} maxBarSize={90}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {plan && plan.tips.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <div className="label">Your maintenance plan</div>
            <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-2xl">{plan.headline}</p>
          </div>
          <div className="flex flex-col gap-2">
            {plan.tips.map((t) => {
              const Icon = tipIcon(t.category);
              const high = t.priority === "high";
              return (
                <Card key={t.id} className={`p-4 flex gap-3 ${high ? "border-accent" : ""}`}>
                  <div
                    className={`grid place-items-center h-8 w-8 rounded-[var(--radius-sm)] shrink-0 ${
                      high ? "bg-accent-soft text-accent" : "bg-elevated text-muted"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-fg">{t.title}</h4>
                      {high && (
                        <span className="label px-1.5 py-0.5 rounded text-accent bg-accent-soft">
                          Do first
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{t.body}</p>
                    <div className="label mt-2">{t.impact}</div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <button
          onClick={() => setShowLog(!showLog)}
          className="tactile ring-focus w-full card card-interactive p-3 flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-fg">
            <Terminal size={14} className="text-muted" /> Action log
          </span>
          <ChevronDown size={15} className={`text-faint transition-transform ${showLog ? "rotate-180" : ""}`} />
        </button>
        {showLog && (
          <Card className="mt-2 p-0 overflow-hidden">
            <pre className="p-4 text-[10px] font-mono text-muted whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed select-text">
              {actionLog || "No actions were logged."}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};
