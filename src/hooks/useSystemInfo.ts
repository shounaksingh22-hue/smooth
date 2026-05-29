import { useAnalysisStore } from "../stores/analysisStore";
import { cmdAnalyzeSystem, cmdExecuteDiagnosis } from "../lib/commands";

export function useSystemInfo() {
  const {
    setSystemInfo,
    setDiagnosisResult,
    setAnalyzing,
    setDiagnosing,
    setError,
  } = useAnalysisStore();

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const info = await cmdAnalyzeSystem();
      setSystemInfo(info);
      
      setDiagnosing(true);
      const diagnosis = await cmdExecuteDiagnosis(info);
      setDiagnosisResult(diagnosis);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setAnalyzing(false);
      setDiagnosing(false);
    }
  };

  return { runAnalysis };
}
