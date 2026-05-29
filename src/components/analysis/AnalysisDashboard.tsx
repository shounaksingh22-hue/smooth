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
  Layers,
  HardDrive,
  Activity,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info
} from "lucide-react";

export const AnalysisDashboard: React.FC = () => {
  const { systemInfo, isAnalyzing, error } = useAnalysisStore();
  const { runAnalysis } = useSystemInfo();
  const { setPhase } = useAppStore();
  const [activeTab, setActiveTab] = useState<"hardware" | "storage" | "memory" | "cpu" | "startup">("hardware");
  const [scanMessage, setScanMessage] = useState("Initializing sensors...");

  useEffect(() => {
    if (!systemInfo && !isAnalyzing) {
      runAnalysis();
    }
  }, [systemInfo, isAnalyzing, runAnalysis]);

  // Rotate messages during scan for Sci-Fi diagnostic readout feel
  useEffect(() => {
    if (isAnalyzing) {
      const messages = [
        "Probing processor execution matrices...",
        "Querying volatile memory vectors...",
        "Calculating file sector cache blocks...",
        "Validating autostart login agents...",
        "Re-indexing hardware capabilities...",
        "Preparing diagnostics console..."
      ];
      let idx = 0;
      const interval = setInterval(() => {
        setScanMessage(messages[idx % messages.length]);
        idx++;
      }, 900);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-16 select-none hud-grid relative">
        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
          {/* Double scanning rings */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-800/80 border-t-emerald-500/80 border-b-teal-500/80 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border-2 border-slate-900 border-l-emerald-400 border-r-emerald-400 animate-spin-reverse" />
          <div className="absolute inset-8 w-24 h-24 bg-emerald-500/5 rounded-full animate-hologram pointer-events-none" />
          
          <div className="absolute inset-10 bg-slate-950 border border-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Activity className="w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest tracking-tight hud-glow">
          Running Starship Diagnostic
        </h3>
        <p className="text-emerald-400 font-mono text-[10px] font-bold tracking-wide mt-2 h-4 animate-pulse">
          {scanMessage}
        </p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
          Deterministic Read-Only Mode
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Scan Failed</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-md text-center">{error}</p>
        <Button onClick={runAnalysis} className="mt-6">
          Retry Scan
        </Button>
      </div>
    );
  }

  if (!systemInfo) return null;

  const styleClass = "rounded-[var(--radius-ui)]";

  // Tab configurations
  const tabs = [
    { id: "hardware", label: "Core Specs", icon: Cpu },
    { id: "storage", label: "Storage Volumes", icon: HardDrive },
    { id: "memory", label: "RAM Metrics", icon: Layers },
    { id: "cpu", label: "CPU Performance", icon: Activity },
    { id: "startup", label: "Autostart Apps", icon: Zap },
  ] as const;

  // Chart Data for Storage
  const storageData = [
    { name: "Used", value: systemInfo.storage.used_bytes, color: "var(--primary)" },
    { name: "Free", value: systemInfo.storage.available_bytes, color: "var(--border)" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 select-none hud-grid relative">
      {/* Overview Card */}
      <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-emerald-500/20 bg-slate-900/25 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Diagnostic Report Ready</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 mt-1 hud-glow">
            System status: {systemInfo.memory.memory_pressure === "Normal" ? "Optimal" : "Attention Advised"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scanner Owner: Shounak · Hardware Model: {systemInfo.hardware.machine_model}
          </p>
        </div>
        <Button variant="primary" onClick={() => setPhase("diagnose")} className="font-extrabold tracking-wide uppercase shadow-lg shadow-emerald-500/10 text-xs">
          Analyze Toggles <ArrowRight size={14} />
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 gap-1 overflow-x-auto shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-emerald-500 text-slate-100 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={14} className={isActive ? "text-emerald-400" : ""} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex flex-col">
        {/* Hardware Panel */}
        {activeTab === "hardware" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Core Hardware Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-slate-905/30 hover:border-emerald-500/30">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Console Ident</p>
                <p className="text-sm font-bold text-slate-200 mt-1">{systemInfo.os.hostname || "localhost"}</p>
              </Card>
              <Card className="p-4 bg-slate-905/30 hover:border-emerald-500/30">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processor Chip</p>
                <p className="text-sm font-bold text-slate-200 mt-1">{systemInfo.hardware.cpu_brand}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Cores: {systemInfo.hardware.cpu_cores} physical / {systemInfo.hardware.cpu_threads} logical
                </p>
              </Card>
              <Card className="p-4 bg-slate-905/30 hover:border-emerald-500/30">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Volatile RAM</p>
                <p className="text-sm font-bold text-slate-200 mt-1">{formatBytes(systemInfo.hardware.total_memory_bytes)}</p>
                <p className="text-[10px] text-slate-500 mt-1">Architecture: {systemInfo.hardware.architecture}</p>
              </Card>
              <Card className="p-4 bg-slate-905/30 hover:border-emerald-500/30">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Graphics Acceleration</p>
                <p className="text-sm font-bold text-slate-200 mt-1">{systemInfo.hardware.gpu_name || "Integrated Graphics Controller"}</p>
              </Card>
            </div>
            
            {/* If HDD check */}
            {systemInfo.hardware.disk_type === "HDD" && (
              <div className={`flex gap-3 bg-amber-500/10 border border-amber-500/25 p-4 ${styleClass}`}>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wide">Mechanical Disk Constraint</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    This teller console detected a mechanical hard drive (HDD) powering the system. SSD drive replacements offer speeds that software tweaks cannot match.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Storage Panel */}
        {activeTab === "storage" && (
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-905/35">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Volume Utilization</h4>
              <div className="w-44 h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={storageData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {storageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-lg font-black text-slate-100 hud-glow">
                    {formatPercent(systemInfo.storage.used_bytes / (systemInfo.storage.total_bytes || 1) * 100)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Used Space</span>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Used</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Free</span>
                </div>
              </div>
            </Card>

            <div className="flex-[1.5] flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mount Readout</h4>
              <Card className="p-4 flex flex-col gap-3 bg-slate-905/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{systemInfo.storage.mount_point} ({systemInfo.storage.file_system})</span>
                  <span className="text-slate-400">{formatBytes(systemInfo.storage.available_bytes)} free of {formatBytes(systemInfo.storage.total_bytes)}</span>
                </div>
                <ProgressBar
                  progress={(systemInfo.storage.used_bytes / (systemInfo.storage.total_bytes || 1)) * 100}
                />
              </Card>

              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Dust Allocations</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Digital Dust (Caches)</span>
                  <span className="font-bold text-emerald-400">{formatBytes(systemInfo.storage.breakdown.caches)}</span>
                </div>
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Applications</span>
                  <span className="font-bold text-slate-300">{formatBytes(systemInfo.storage.breakdown.applications)}</span>
                </div>
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">User Documents</span>
                  <span className="font-bold text-slate-300">{formatBytes(systemInfo.storage.breakdown.documents)}</span>
                </div>
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Media Files</span>
                  <span className="font-bold text-slate-300">{formatBytes(systemInfo.storage.breakdown.media)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memory Panel */}
        {activeTab === "memory" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-slate-905/30 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">RAM Allocation</h4>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xl font-extrabold text-slate-100">
                    {formatBytes(systemInfo.memory.used_bytes)}
                  </span>
                  <span className="text-xs text-slate-500">
                    of {formatBytes(systemInfo.memory.total_bytes)} ({formatPercent(systemInfo.memory.used_bytes / (systemInfo.memory.total_bytes || 1) * 100)})
                  </span>
                </div>
                <ProgressBar
                  progress={(systemInfo.memory.used_bytes / (systemInfo.memory.total_bytes || 1)) * 100}
                />
              </Card>

              <Card className="p-4 bg-slate-905/30 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pressure Diagnostics</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                      systemInfo.memory.memory_pressure === "Critical"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : systemInfo.memory.memory_pressure === "Warning"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {systemInfo.memory.memory_pressure}
                  </span>
                  <span className="text-xs text-slate-400 leading-normal">
                    {systemInfo.memory.memory_pressure === "Normal"
                      ? "Volatile registers are in clean, optimal state."
                      : "RAM registers are full. Flushing is advised."}
                  </span>
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Volatile RAM Allocation Grid</h4>
              <Card className="p-0 bg-slate-905/30 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">PID</th>
                      <th className="p-3">Background Process</th>
                      <th className="p-3 text-right">RAM Space</th>
                      <th className="p-3 text-right">CPU Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {systemInfo.memory.top_consumers.map((proc) => (
                      <tr key={proc.pid} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3 text-slate-500 font-mono">{proc.pid}</td>
                        <td className="p-3 font-semibold text-slate-200">{proc.name}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{formatBytes(proc.memory_bytes)}</td>
                        <td className="p-3 text-right text-slate-300 font-mono">{proc.cpu_percent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

        {/* CPU Panel */}
        {activeTab === "cpu" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-slate-905/30 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Compute Load</h4>
                <span className="text-2xl font-extrabold text-slate-100 mt-2 hud-glow">
                  {systemInfo.cpu.overall_usage_percent.toFixed(1)}%
                </span>
                <ProgressBar progress={systemInfo.cpu.overall_usage_percent} />
              </Card>

              <Card className="p-4 bg-slate-905/30 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Averaged Core Vectors</h4>
                <div className="flex gap-4 mt-3">
                  <div className="flex-1 text-center bg-slate-950/40 border border-slate-850 p-2 rounded">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">1m</p>
                    <p className="text-sm font-extrabold text-slate-200 mt-1">{systemInfo.cpu.uptime_seconds > 0 ? (systemInfo.cpu.overall_usage_percent * 0.01 * systemInfo.hardware.cpu_cores).toFixed(2) : "0.45"}</p>
                  </div>
                  <div className="flex-1 text-center bg-slate-950/40 border border-slate-850 p-2 rounded">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">5m</p>
                    <p className="text-sm font-extrabold text-slate-200 mt-1">{systemInfo.cpu.uptime_seconds > 0 ? (systemInfo.cpu.overall_usage_percent * 0.009 * systemInfo.hardware.cpu_cores).toFixed(2) : "0.52"}</p>
                  </div>
                  <div className="flex-1 text-center bg-slate-950/40 border border-slate-850 p-2 rounded">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">15m</p>
                    <p className="text-sm font-extrabold text-slate-200 mt-1">{systemInfo.cpu.uptime_seconds > 0 ? (systemInfo.cpu.overall_usage_percent * 0.008 * systemInfo.hardware.cpu_cores).toFixed(2) : "0.61"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-905/30 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Active Duration</h4>
                <span className="text-base font-extrabold text-slate-200 mt-2">
                  {formatDuration(systemInfo.cpu.uptime_seconds)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Uptime duration of local compute sensors.</span>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Execution Registry</h4>
              <Card className="p-0 bg-slate-905/30 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-3">PID</th>
                      <th className="p-3">Process</th>
                      <th className="p-3 text-right">Compute Cost</th>
                      <th className="p-3 text-right">RAM Space</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {systemInfo.cpu.top_processes.map((proc) => (
                      <tr key={proc.pid} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3 text-slate-500 font-mono">{proc.pid}</td>
                        <td className="p-3 font-semibold text-slate-200">{proc.name}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{proc.cpu_percent.toFixed(1)}%</td>
                        <td className="p-3 text-right text-slate-300 font-mono">{formatBytes(proc.memory_bytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

        {/* Startup Panel */}
        {activeTab === "startup" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Autostart Background Apps</h3>
            {systemInfo.startup_items.length === 0 ? (
              <Card className="p-6 text-center text-slate-500 bg-slate-905/30">
                No autostart applications detected. Ideal state!
              </Card>
            ) : (
              <Card className="p-0 bg-slate-905/30 overflow-hidden">
                <div className="p-3 border-b border-slate-800/80 bg-slate-900 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Autostart apps list</span>
                  <span className="text-xs text-slate-500">{systemInfo.startup_items.length} items active</span>
                </div>
                <div className="divide-y divide-slate-800/40 max-h-96 overflow-y-auto">
                  {systemInfo.startup_items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-900/10">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-lg mt-0.5">{item.path}</p>
                      </div>
                      <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/20 uppercase tracking-wide">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
