import React, { useEffect, useState } from "react";
import { useAnalysisStore } from "../../stores/analysisStore";
import { useSystemInfo } from "../../hooks/useSystemInfo";
import { useAppStore } from "../../stores/appStore";
import { formatBytes, formatPercent, formatDuration } from "../../lib/formatters";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { ProgressBar } from "../common/ProgressBar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Zap,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type TabId = "hardware" | "storage" | "memory" | "cpu" | "startup";

export const AnalysisDashboard: React.FC = () => {
  const { systemInfo, isAnalyzing, error } = useAnalysisStore();
  const { runAnalysis } = useSystemInfo();
  const { setPhase } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>("hardware");
  const [scanMessage, setScanMessage] = useState("Initializing…");

  useEffect(() => {
    if (!systemInfo && !isAnalyzing) runAnalysis();
  }, [systemInfo, isAnalyzing, runAnalysis]);

  useEffect(() => {
    if (isAnalyzing) {
      const messages = [
        "Reading hardware…",
        "Measuring memory…",
        "Scanning storage…",
        "Checking startup items…",
        "Analyzing CPU load…",
        "Finishing up…",
      ];
      let idx = 0;
      const interval = setInterval(() => {
        setScanMessage(messages[idx % messages.length]);
        idx++;
      }, 850);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 select-none">
        <Loader2 size={40} className="text-accent animate-spin-slow" />
        <h3 className="text-base font-semibold text-fg mt-6">Analyzing your system</h3>
        <p className="font-mono text-[11px] text-muted mt-2 h-4">{scanMessage}</p>
        <p className="label mt-8">Read-only · nothing is changed</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 select-none">
        <AlertTriangle size={36} className="text-danger mb-4" />
        <h3 className="text-base font-semibold text-fg">Scan failed</h3>
        <p className="text-sm text-muted mt-1 max-w-md text-center">{error}</p>
        <Button onClick={runAnalysis} className="mt-6">
          Retry
        </Button>
      </div>
    );
  }

  if (!systemInfo) return null;

  const tabs = [
    { id: "hardware", label: "Hardware", icon: Cpu },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "memory", label: "Memory", icon: MemoryStick },
    { id: "cpu", label: "CPU", icon: Activity },
    { id: "startup", label: "Startup", icon: Zap },
  ] as const;

  const storageData = [
    { name: "Used", value: systemInfo.storage.used_bytes, fill: "var(--accent)" },
    { name: "Free", value: systemInfo.storage.available_bytes, fill: "var(--border-strong)" },
  ];

  const usedPct = (systemInfo.storage.used_bytes / (systemInfo.storage.total_bytes || 1)) * 100;
  const memPct = (systemInfo.memory.used_bytes / (systemInfo.memory.total_bytes || 1)) * 100;
  const isOptimal = systemInfo.memory.memory_pressure === "Normal";

  return (
    <div className="flex-1 flex flex-col gap-5 select-none">
      {/* Overview */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6">
        <div>
          <div className="label">Analysis complete</div>
          <h2 className="text-lg font-semibold text-fg mt-1.5">
            {isOptimal ? "Your system is running clean" : "A few things are slowing this machine down"}
          </h2>
          <p className="text-xs text-muted mt-1">{systemInfo.hardware.machine_model}</p>
        </div>
        <Button variant="primary" onClick={() => setPhase("diagnose")} className="shrink-0">
          View recommendations <ArrowRight size={14} />
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tactile flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                isActive
                  ? "border-accent text-fg"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              <Icon size={14} className={isActive ? "text-accent" : ""} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Hardware */}
      {activeTab === "hardware" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="label">Host</div>
              <div className="text-sm font-medium text-fg mt-1.5">{systemInfo.os.hostname || "localhost"}</div>
            </Card>
            <Card className="p-4">
              <div className="label">Processor</div>
              <div className="text-sm font-medium text-fg mt-1.5">{systemInfo.hardware.cpu_brand}</div>
              <div className="text-[11px] text-muted mt-1">
                {systemInfo.hardware.cpu_cores} cores · {systemInfo.hardware.cpu_threads} threads
              </div>
            </Card>
            <Card className="p-4">
              <div className="label">Memory</div>
              <div className="text-sm font-medium text-fg mt-1.5">
                {formatBytes(systemInfo.hardware.total_memory_bytes)}
              </div>
              <div className="text-[11px] text-muted mt-1">{systemInfo.hardware.architecture}</div>
            </Card>
            <Card className="p-4">
              <div className="label">Graphics</div>
              <div className="text-sm font-medium text-fg mt-1.5">
                {systemInfo.hardware.gpu_name || "Integrated graphics"}
              </div>
            </Card>
          </div>

          {systemInfo.hardware.disk_type === "HDD" && (
            <div className="flex gap-3 rounded-[var(--radius-ui)] bg-warn-soft border border-warn p-4">
              <AlertTriangle size={18} className="text-warn shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-warn">Mechanical drive detected</div>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  This machine uses a mechanical hard drive (HDD). Upgrading to an SSD delivers a
                  speed boost that software tuning alone can't match.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storage */}
      {activeTab === "storage" && (
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="label mb-4">Volume usage</div>
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageData} innerRadius={54} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">
                    {storageData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                <span className="text-xl font-semibold text-fg tabular-nums">{formatPercent(usedPct)}</span>
                <span className="label mt-0.5">used</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="label">Used</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-border-strong" />
                <span className="label">Free</span>
              </div>
            </div>
          </Card>

          <div className="flex-[1.5] flex flex-col gap-3">
            <Card className="p-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-fg">
                  {systemInfo.storage.mount_point} · {systemInfo.storage.file_system}
                </span>
                <span className="text-muted tabular-nums">
                  {formatBytes(systemInfo.storage.available_bytes)} free of{" "}
                  {formatBytes(systemInfo.storage.total_bytes)}
                </span>
              </div>
              <ProgressBar progress={usedPct} className="mt-3" />
            </Card>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Caches", value: systemInfo.storage.breakdown.caches, accent: true },
                { label: "Applications", value: systemInfo.storage.breakdown.applications },
                { label: "Documents", value: systemInfo.storage.breakdown.documents },
                { label: "Media", value: systemInfo.storage.breakdown.media },
              ].map((row) => (
                <div key={row.label} className="card p-3 flex justify-between items-center">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className={`text-xs font-medium tabular-nums ${row.accent ? "text-accent" : "text-fg"}`}>
                    {formatBytes(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Memory */}
      {activeTab === "memory" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="label">RAM in use</div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-xl font-semibold text-fg tabular-nums">
                  {formatBytes(systemInfo.memory.used_bytes)}
                </span>
                <span className="text-xs text-muted tabular-nums">
                  of {formatBytes(systemInfo.memory.total_bytes)} · {formatPercent(memPct)}
                </span>
              </div>
              <ProgressBar progress={memPct} className="mt-3" tone={memPct > 85 ? "warn" : "accent"} />
            </Card>
            <Card className="p-4">
              <div className="label">Memory pressure</div>
              <div className="flex items-center gap-3 mt-2.5">
                <span
                  className={`label px-2 py-1 rounded ${
                    systemInfo.memory.memory_pressure === "Critical"
                      ? "text-danger bg-danger-soft"
                      : systemInfo.memory.memory_pressure === "Warning"
                      ? "text-warn bg-warn-soft"
                      : "text-success bg-success-soft"
                  }`}
                >
                  {systemInfo.memory.memory_pressure}
                </span>
                <span className="text-xs text-muted leading-relaxed">
                  {isOptimal ? "Memory is in a healthy state." : "Memory is under load, so freeing some up should help."}
                </span>
              </div>
            </Card>
          </div>

          <div>
            <div className="label mb-2">Top memory consumers</div>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-faint">
                    <th className="label font-medium p-3">PID</th>
                    <th className="label font-medium p-3">Process</th>
                    <th className="label font-medium p-3 text-right">Memory</th>
                    <th className="label font-medium p-3 text-right">CPU</th>
                  </tr>
                </thead>
                <tbody>
                  {systemInfo.memory.top_consumers.map((p) => (
                    <tr key={p.pid} className="border-b border-border last:border-0 hover:bg-elevated">
                      <td className="p-3 font-mono text-faint">{p.pid}</td>
                      <td className="p-3 font-medium text-fg">{p.name}</td>
                      <td className="p-3 text-right text-accent font-medium tabular-nums">
                        {formatBytes(p.memory_bytes)}
                      </td>
                      <td className="p-3 text-right text-muted font-mono tabular-nums">
                        {p.cpu_percent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {/* CPU */}
      {activeTab === "cpu" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="label">Overall load</div>
              <span className="block text-2xl font-semibold text-fg mt-2 tabular-nums">
                {systemInfo.cpu.overall_usage_percent.toFixed(1)}%
              </span>
              <ProgressBar progress={systemInfo.cpu.overall_usage_percent} className="mt-3" />
            </Card>
            <Card className="p-4">
              <div className="label">Uptime</div>
              <span className="block text-2xl font-semibold text-fg mt-2">
                {formatDuration(systemInfo.cpu.uptime_seconds)}
              </span>
              <span className="text-[11px] text-muted mt-1 block">Since last restart</span>
            </Card>
          </div>

          <div>
            <div className="label mb-2">Top processes by CPU</div>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-faint">
                    <th className="label font-medium p-3">PID</th>
                    <th className="label font-medium p-3">Process</th>
                    <th className="label font-medium p-3 text-right">CPU</th>
                    <th className="label font-medium p-3 text-right">Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {systemInfo.cpu.top_processes.map((p) => (
                    <tr key={p.pid} className="border-b border-border last:border-0 hover:bg-elevated">
                      <td className="p-3 font-mono text-faint">{p.pid}</td>
                      <td className="p-3 font-medium text-fg">{p.name}</td>
                      <td className="p-3 text-right text-accent font-medium tabular-nums">
                        {p.cpu_percent.toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-muted font-mono tabular-nums">
                        {formatBytes(p.memory_bytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {/* Startup */}
      {activeTab === "startup" && (
        <div className="flex flex-col gap-3">
          <div className="label">Startup items</div>
          {systemInfo.startup_items.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted">
              No startup items found. That's ideal for fast boots.
            </Card>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b border-border">
                <span className="label">Launches at login</span>
                <span className="label">{systemInfo.startup_items.length} items</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {systemInfo.startup_items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex justify-between items-center gap-3 border-b border-border last:border-0 hover:bg-elevated"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-fg">{item.name}</p>
                      <p className="text-[10px] font-mono text-faint truncate mt-0.5">{item.path}</p>
                    </div>
                    <span className="label px-2 py-0.5 rounded bg-elevated shrink-0">{item.category}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
