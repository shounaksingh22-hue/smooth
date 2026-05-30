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
  const showChrome = currentPhase !== "welcome";

  return (
    <div className="flex flex-col w-full h-full bg-canvas text-fg overflow-hidden">
      <Header />
      <div className="flex flex-1 w-full overflow-hidden">
        {showChrome && <Sidebar />}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col px-6 py-6">
            {showChrome && <ProgressStepper currentPhase={currentPhase} />}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
