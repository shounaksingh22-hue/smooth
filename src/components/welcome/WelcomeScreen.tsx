import React, { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { ShieldAlert, Terminal, Eye, HeartHandshake, ArrowRight, Sparkles } from "lucide-react";

export const WelcomeScreen: React.FC = () => {
  const { setPhase } = useAppStore();
  const [isChecked, setIsChecked] = useState(false);

  const styleClass = "rounded-[var(--radius-ui)]";

  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto py-8 select-none hud-grid px-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 animate-pulse">
          <Sparkles className="w-3 h-3 text-emerald-400" /> Console Initialization
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 hud-glow">
          Smooth diagnostics
        </h2>
        <p className="text-slate-400 mt-2 text-xs font-semibold uppercase tracking-wider">
          Diagnostics Console Owner: Shounak
        </p>
      </div>

      <Card className="w-full flex flex-col gap-6 p-6 border-emerald-500/20 mb-6 bg-slate-900/35 relative overflow-hidden">
        {/* Hologram background details */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="flex gap-3">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">100% Free Teller</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Zero premium models, zero payments, zero ads. Built for absolute cleanups without sales traps.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Secure Local Core</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Runs locally on your device. No cloud analytics, no network connections, and no tracking.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Approved Executions</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Dry-runs are presented in plain words. Nothing deletes or changes unless you toggle it yourself.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Terminal className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Trash Reversibility</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Items are swept into the Recycle Bin/Trash, so you can easily pull them back if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Console Security */}
        <div className={`p-4 bg-slate-950/60 border border-slate-800/80 relative overflow-hidden ${styleClass}`}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
          <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Starship Security Core
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Welcome! I am Shounak, the creator of Smooth. This diagnostic teller compiles code to inspect folders locally. Feel free to verify the integrity checksum below.
          </p>
          <div className="mt-3 flex items-center bg-slate-900 border border-slate-850 p-2 rounded text-[10px] font-mono text-slate-500 overflow-x-auto whitespace-nowrap">
            <span className="text-slate-400 mr-2 uppercase font-bold text-[9px] tracking-wider shrink-0">Release Signature:</span>
            <span>sha256:897e6a4e-eac9-47af-aeee-1a66e2d49711</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-4 w-full relative z-10">
        <label className="flex items-start gap-3 cursor-pointer text-left max-w-lg">
          <input
            type="checkbox"
            className="mt-1 accent-emerald-500 rounded border-slate-800 bg-slate-900 text-slate-900 shrink-0"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="text-[11px] text-slate-400 leading-normal">
            I authorize Shounak's diagnostic console to inspect system stats read-only. I understand no cleanup will execute unless I toggle it.
          </span>
        </label>

        <Button
          variant="primary"
          disabled={!isChecked}
          onClick={() => setPhase("analyze")}
          className="w-full max-w-xs font-extrabold shadow-lg shadow-emerald-500/10 text-sm tracking-wide uppercase"
        >
          Initialize Scan <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};
