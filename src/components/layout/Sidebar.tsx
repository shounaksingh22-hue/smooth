import React from "react";
import { useAnalysisStore } from "../../stores/analysisStore";
import { formatBytes } from "../../lib/formatters";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

export const Sidebar: React.FC = () => {
  const { systemInfo } = useAnalysisStore();
  const { platform } = useAppStore();

  return (
    <aside className="w-60 shrink-0 border-r border-border overflow-y-auto px-4 py-5 flex flex-col gap-6 select-none">
      <div>
        <div className="label mb-3">System</div>
        {systemInfo ? (
          <div className="flex flex-col gap-3.5">
            <div className="flex gap-3 items-start">
              <Cpu size={15} className="text-muted shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="label">Processor</div>
                <div className="text-xs font-medium text-fg mt-1 line-clamp-2">
                  {systemInfo.hardware.cpu_brand}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <MemoryStick size={15} className="text-muted shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="label">Memory</div>
                <div className="text-xs font-medium text-fg mt-1">
                  {formatBytes(systemInfo.hardware.total_memory_bytes)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <HardDrive size={15} className="text-muted shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="label">Storage</div>
                <div className="text-xs font-medium text-fg mt-1">
                  {systemInfo.hardware.disk_type} · {systemInfo.storage.file_system}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="label">Run a scan first</div>
        )}
      </div>

      {systemInfo?.os && (
        <div>
          <div className="label mb-2">Operating System</div>
          <div className="card p-3">
            <div className="text-xs font-medium text-fg">{systemInfo.os.name}</div>
            <div className="text-[11px] text-muted mt-1">
              {systemInfo.os.version} ({systemInfo.os.build})
            </div>
            <div className="font-mono text-[10px] text-faint truncate mt-1">
              {systemInfo.os.kernel_version}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border">
        <div className="label">{platform} · open source</div>
      </div>
    </aside>
  );
};
