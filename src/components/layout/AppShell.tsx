import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ProgressStepper } from "./ProgressStepper";
import { useAppStore } from "../../stores/appStore";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { currentPhase } = useAppStore();

  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-slate-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 w-full overflow-hidden">
        {currentPhase !== "welcome" && <Sidebar />}
        <main className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-950/40">
          {currentPhase !== "welcome" && (
            <ProgressStepper currentPhase={currentPhase} />
          )}
          <div className="flex-1 max-w-5xl w-full mx-auto flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
