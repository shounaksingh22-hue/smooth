import { create } from "zustand";
import { CleanupAction, CleanupResult } from "../types/cleanup";

interface CleanupState {
  selectedActions: string[]; // IDs of selected suggestions
  cleanupActions: CleanupAction[];
  isCleaning: boolean;
  results: CleanupResult[];
  freedBytesTotal: number;
  actionLog: string;
  setSelectedActions: (actions: string[]) => void;
  setCleanupActions: (actions: CleanupAction[]) => void;
  toggleActionSelected: (id: string) => void;
  setCleaning: (val: boolean) => void;
  setResults: (results: CleanupResult[]) => void;
  setFreedBytesTotal: (bytes: number) => void;
  setActionLog: (log: string) => void;
  reset: () => void;
}

export const useCleanupStore = create<CleanupState>((set) => ({
  selectedActions: [],
  cleanupActions: [],
  isCleaning: false,
  results: [],
  freedBytesTotal: 0,
  actionLog: "",
  setSelectedActions: (selectedActions) => set({ selectedActions }),
  setCleanupActions: (cleanupActions) => set({ cleanupActions }),
  toggleActionSelected: (id) =>
    set((state) => ({
      selectedActions: state.selectedActions.includes(id)
        ? state.selectedActions.filter((a) => a !== id)
        : [...state.selectedActions, id],
    })),
  setCleaning: (isCleaning) => set({ isCleaning }),
  setResults: (results) => set({ results }),
  setFreedBytesTotal: (freedBytesTotal) => set({ freedBytesTotal }),
  setActionLog: (actionLog) => set({ actionLog }),
  reset: () =>
    set({
      selectedActions: [],
      cleanupActions: [],
      isCleaning: false,
      results: [],
      freedBytesTotal: 0,
      actionLog: "",
    }),
}));
