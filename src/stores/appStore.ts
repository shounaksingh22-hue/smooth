import { create } from "zustand";

export type Phase = "welcome" | "analyze" | "diagnose" | "cleanup" | "results";

interface AppState {
  currentPhase: Phase;
  platform: "macos" | "windows" | "unknown";
  useTrash: boolean;
  disabledCategories: string[];
  theme: "dark" | "light";
  setPhase: (phase: Phase) => void;
  setPlatform: (platform: "macos" | "windows" | "unknown") => void;
  setUseTrash: (val: boolean) => void;
  toggleCategoryDisabled: (category: string) => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPhase: "welcome",
  platform: "unknown",
  useTrash: true,
  disabledCategories: [],
  theme: "dark",
  setPhase: (phase) => set({ currentPhase: phase }),
  setPlatform: (platform) => set({ platform }),
  setUseTrash: (val) => set({ useTrash: val }),
  toggleCategoryDisabled: (category) =>
    set((state) => ({
      disabledCategories: state.disabledCategories.includes(category)
        ? state.disabledCategories.filter((c) => c !== category)
        : [...state.disabledCategories, category],
    })),
  setTheme: (theme) => set({ theme }),
}));
