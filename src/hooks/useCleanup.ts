import { useCleanupStore } from "../stores/cleanupStore";
import { useAppStore } from "../stores/appStore";
import { cmdScanCleanup, cmdExecuteCleanup, cmdGetActionLog, cmdDisableStartupItem } from "../lib/commands";

export function useCleanup() {
  const { useTrash } = useAppStore();
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
      // Find the categories that match our selected items
      const categories = selectedActions;
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
