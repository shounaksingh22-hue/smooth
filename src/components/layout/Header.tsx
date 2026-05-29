import React from "react";
import { Zap, ShieldCheck, Sun, Moon } from "lucide-react";
import { useAppStore } from "../../stores/appStore";

export const Header: React.FC = () => {
  const { theme, setTheme } = useAppStore();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur select-none">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
          <Zap className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-100 hud-glow">
              Smooth Diagnostics Console
            </h1>
            <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              by Shounak
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
            Starship Diagnostic Interface v1.0.0
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sun/Moon Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700/80 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-all duration-150 active:scale-95 flex items-center justify-center"
          title={`Switch to ${theme === "dark" ? "Light Console" : "Dark Console"}`}
        >
          {theme === "dark" ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-500" />}
        </button>

        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-400">Secure & Offline</span>
        </div>
      </div>
    </header>
  );
};
