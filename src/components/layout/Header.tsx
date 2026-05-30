import React from "react";
import { Moon, Sun, ShieldCheck } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { Logo } from "../common/Logo";

export const Header: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const isDark = theme === "dark";

  return (
    <header className="flex items-center justify-between px-5 h-14 border-b border-border bg-canvas select-none shrink-0">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-8 w-8 rounded-[var(--radius-sm)] bg-accent text-accent-fg">
          <Logo size={18} />
        </div>
        <div className="leading-none">
          <div className="text-sm font-semibold tracking-tight text-fg">SSmooth</div>
          <div className="label mt-1.5">System Optimizer</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border">
          <ShieldCheck size={13} className="text-success" />
          <span className="label">Local &amp; Offline</span>
        </div>
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="tactile ring-focus grid place-items-center h-8 w-8 rounded-[var(--radius-sm)] border border-border bg-surface text-muted hover:text-fg hover:border-border-strong"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle color theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
