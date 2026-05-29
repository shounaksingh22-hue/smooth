import React from "react";
import { useAnalysisStore } from "../../stores/analysisStore";
import { formatBytes } from "../../lib/formatters";
import { Cpu, HardDrive, Layers, Terminal } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

export const Sidebar: React.FC = () => {
  const { systemInfo } = useAnalysisStore();
  const { platform } = useAppStore();

  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/20 p-5 flex flex-col justify-between shrink-0 select-none overflow-y-auto relative">
      {/* Decorative vertical lasers */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-emerald-500/20 via-transparent to-emerald-500/20" />
      
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Specifications</h2>
          {systemInfo ? (
            <div className="flex flex-col gap-4">
              {/* CPU Info */}
              <div className="flex gap-3 items-start">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Processor</p>
                  <p className="text-xs font-bold text-slate-200 line-clamp-2 mt-0.5">{systemInfo.hardware.cpu_brand}</p>
                </div>
              </div>

              {/* Memory Info */}
              <div className="flex gap-3 items-start">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Memory</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {formatBytes(systemInfo.hardware.total_memory_bytes)}
                  </p>
                </div>
              </div>

              {/* Disk Type */}
              <div className="flex gap-3 items-start">
                <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Main Volume</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {systemInfo.hardware.disk_type} ({systemInfo.storage.file_system})
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Initialize scan first.</p>
          )}
        </div>

        {systemInfo?.os && (
          <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Diagnostic OS</h2>
            <div className={`bg-slate-900/40 border border-emerald-500/10 p-3.5 relative overflow-hidden ${styleClass}`}>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/20 to-transparent" />
              <p className="text-xs font-bold text-slate-200">{systemInfo.os.name}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Version: {systemInfo.os.version} ({systemInfo.os.build})
              </p>
              <p className="text-[9px] text-slate-500 font-mono truncate mt-1">Kernel: {systemInfo.os.kernel_version}</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/40 text-center">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Smooth App Console</p>
        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Designed by Shounak</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide mt-1 select-none">
          {platform} Console
        </p>
      </div>
    </aside>
  );
};
