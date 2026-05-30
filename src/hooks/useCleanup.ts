import { useCleanupStore } from "../stores/cleanupStore";
import { useAppStore } from "../stores/appStore";
import { useAnalysisStore } from "../stores/analysisStore";
import { cmdScanCleanup, cmdExecuteCleanup, cmdGetActionLog, cmdDisableStartupItem } from "../lib/commands";
import type { Category } from "../types/diagnosis";

// Diagnosis suggestion category -> concrete CleanupCategory enum values the Rust
// executor accepts. Non-file issues (memory/cpu/startup/network) map to none.
const CATEGORY_TO_CLEANUP: Record<Category, string[]> = {
  storage: ["SystemCache", "UserCache", "BrowserCache", "Logs", "TempFiles", "Trash"],
  system: [],
  memory: [],
  cpu: [],
  startup: [],
  network: [],
};

export function useCleanup() {
  const { useTrash } = useAppStore();
  const { diagnosisResult } = useAnalysisStore();
  const {
    selectedActions,
    setCleanupActions,
    setCleaning,
    setResults,
    setFreedBytesTotal,
    setActionLog,
  } = useCleanupStore();

  const scanCleanup = async () => {
    try {
      const res = await cmdScanCleanup();
      // Map to frontend expectation
      setCleanupActions(res.items);
    } catch (e) {
      console.error(e);
    }
  };

  const runCleanup = async () => {
    setCleaning(true);
    try {
      // selectedActions are diagnosis suggestion IDs; resolve them to enum
      // categories before the IPC call or serde rejects the whole batch.
      const suggestions = diagnosisResult?.suggestions ?? [];
      const categories = Array.from(
        new Set(
          suggestions
            .filter((s) => selectedActions.includes(s.id))
            .flatMap((s) => CATEGORY_TO_CLEANUP[s.category] ?? [])
        )
      );
      const res = await cmdExecuteCleanup(categories, useTrash);
      setResults([res]);
      setFreedBytesTotal(res.bytes_freed);
      
      const log = await cmdGetActionLog();
      setActionLog(log);
    } catch (e) {
      console.error(e);
    } finally {
      setCleaning(false);
    }
  };

  const disableStartup = async (name: string, path: string, source: string) => {
    try {
      await cmdDisableStartupItem(name, path, source);
    } catch (e) {
      console.error(e);
    }
  };

  return { scanCleanup, runCleanup, disableStartup };
}
