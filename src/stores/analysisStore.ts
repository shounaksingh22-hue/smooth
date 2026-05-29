import { create } from "zustand";
import { SystemInfo } from "../types/system";
import { DiagnosisResult } from "../types/diagnosis";

interface AnalysisState {
  systemInfo: SystemInfo | null;
  diagnosisResult: DiagnosisResult | null;
  isAnalyzing: boolean;
  isDiagnosing: boolean;
  error: string | null;
  setSystemInfo: (info: SystemInfo | null) => void;
  setDiagnosisResult: (result: DiagnosisResult | null) => void;
  setAnalyzing: (val: boolean) => void;
  setDiagnosing: (val: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  systemInfo: null,
  diagnosisResult: null,
  isAnalyzing: false,
  isDiagnosing: false,
  error: null,
  setSystemInfo: (systemInfo) => set({ systemInfo }),
  setDiagnosisResult: (diagnosisResult) => set({ diagnosisResult }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setDiagnosing: (isDiagnosing) => set({ isDiagnosing }),
  setError: (error) => set({ error }),
  reset: () => set({ systemInfo: null, diagnosisResult: null, error: null }),
}));
