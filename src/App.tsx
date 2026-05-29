import React from "react";
import { useAppStore } from "./stores/appStore";
import { usePlatform } from "./hooks/usePlatform";
import { AppShell } from "./components/layout/AppShell";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { AnalysisDashboard } from "./components/analysis/AnalysisDashboard";
import { DiagnosisView } from "./components/diagnosis/DiagnosisView";
import { CleanupExecutor } from "./components/cleanup/CleanupExecutor";
import { ResultsDashboard } from "./components/results/ResultsDashboard";

export default function App() {
  // Detect OS platform and configure styling class
  usePlatform();

  const { currentPhase } = useAppStore();

  const renderContent = () => {
    switch (currentPhase) {
      case "welcome":
        return <WelcomeScreen />;
      case "analyze":
        return <AnalysisDashboard />;
      case "diagnose":
        return <DiagnosisView />;
      case "cleanup":
        return <CleanupExecutor />;
      case "results":
        return <ResultsDashboard />;
      default:
        return <WelcomeScreen />;
    }
  };

  return <AppShell>{renderContent()}</AppShell>;
}
