import { invoke } from "@tauri-apps/api/core";
import { SystemInfo, MOCK_SYSTEM_INFO } from "../types/system";
import { DiagnosisResult, MOCK_DIAGNOSIS } from "../types/diagnosis";

const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined;

export async function cmdAnalyzeSystem(): Promise<SystemInfo> {
  if (!isTauri) {
    await new Promise((r) => setTimeout(r, 2000));
    return MOCK_SYSTEM_INFO;
  }
  return await invoke<SystemInfo>("analyze_system");
}

export async function cmdExecuteDiagnosis(report: SystemInfo): Promise<DiagnosisResult> {
  if (!isTauri) {
    await new Promise((r) => setTimeout(r, 1000));
    return MOCK_DIAGNOSIS;
  }
  // Convert frontend SystemInfo format if needed, but our structures align.
  return await invoke<DiagnosisResult>("execute_diagnosis", { report });
}

export async function cmdScanCleanup(): Promise<any> {
  if (!isTauri) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      items: [
        {
          category: "UserCache",
          display_name: "User Caches",
          description: "Temporary app caches",
          paths: ["/Users/mock/Library/Caches"],
          total_size_bytes: 8804682956,
          total_size_display: "8.2 GB",
          file_count: 14205,
          safe_to_clean: true,
        },
        {
          category: "Logs",
          display_name: "Log Files",
          description: "System diagnostics history",
          paths: ["/var/log"],
          total_size_bytes: 2254857830,
          total_size_display: "2.1 GB",
          file_count: 531,
          safe_to_clean: true,
        },
        {
          category: "TempFiles",
          display_name: "Temporary Files",
          description: "Workspace caches and compile scrap",
          paths: ["/tmp"],
          total_size_bytes: 6227020800,
          total_size_display: "5.8 GB",
          file_count: 1205,
          safe_to_clean: true,
        },
        {
          category: "Trash",
          display_name: "Trash / Recycle Bin",
          description: "Items in Trash waiting to be deleted",
          paths: ["/Users/mock/.Trash"],
          total_size_bytes: 1205847395,
          total_size_display: "1.1 GB",
          file_count: 242,
          safe_to_clean: true,
        },
      ],
      total_reclaimable_bytes: 18492408981,
      total_reclaimable_display: "17.2 GB",
      total_file_count: 16183,
    };
  }
  return await invoke("scan_cleanup");
}

export async function cmdExecuteCleanup(categories: string[], useTrash: boolean): Promise<any> {
  if (!isTauri) {
    await new Promise((r) => setTimeout(r, 3000));
    return {
      categories_cleaned: categories,
      bytes_freed: 18492408981,
      bytes_freed_display: "17.2 GB",
      files_removed: 16183,
      errors: [],
      completed_at: new Date().toLocaleTimeString(),
    };
  }
  return await invoke("execute_cleanup", {
    req: { categories, use_trash: useTrash },
  });
}

export async function cmdGetActionLog(): Promise<string> {
  if (!isTauri) {
    return `[${new Date().toLocaleString()}] ACTION: UserCache\n[${new Date().toLocaleString()}] TARGET: /Users/mock/Library/Caches\n[${new Date().toLocaleString()}] METHOD: move to trash\n[${new Date().toLocaleString()}] RESULT: SUCCESS - Freed 8.2 GB\n---\n`;
  }
  return await invoke<string>("get_action_log");
}

export async function cmdDisableStartupItem(name: string, path: string, source: string): Promise<void> {
  if (!isTauri) {
    console.log(`Mock disabling startup item: ${name}`);
    return;
  }
  await invoke("disable_startup_item", {
    item: { name, path, enabled: true, source },
  });
}
