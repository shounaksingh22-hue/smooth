import React, { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { Button } from "../common/Button";
import { Github, ShieldCheck, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { Logo } from "../common/Logo";

const POINTS = [
  { icon: ShieldCheck, title: "100% local", body: "Everything runs on your device. No cloud, no accounts, no tracking." },
  { icon: Eye, title: "Preview first", body: "See exactly what will be cleaned, in plain language, before anything happens." },
  { icon: RotateCcw, title: "Reversible", body: "Items move to the Trash or Recycle Bin by default, so you can restore them." },
  { icon: Github, title: "Free & open source", body: "No premium tiers and no ads. Built to genuinely make your machine faster." },
];

export const WelcomeScreen: React.FC = () => {
  const { setPhase } = useAppStore();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto py-10 select-none">
      <div className="grid place-items-center h-14 w-14 rounded-[var(--radius-ui)] bg-accent text-accent-fg mb-5">
        <Logo size={30} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-fg text-center">
        Make your computer feel new again
      </h1>
      <p className="text-sm text-muted text-center mt-2 max-w-md leading-relaxed">
        SSmooth reads your Mac or PC, shows you what's quietly slowing it down, and
        clears it out safely. Most first cleanups free several gigabytes in under a minute.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-4 flex gap-3">
            <Icon size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-fg">{title}</div>
              <div className="text-[11px] text-muted mt-1 leading-relaxed">{body}</div>
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer mt-8 max-w-md">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)] cursor-pointer"
        />
        <span className="text-[11px] text-muted leading-relaxed">
          I authorize SSmooth to read system information. Nothing is cleaned or changed until I confirm it.
        </span>
      </label>

      <Button
        variant="primary"
        disabled={!agreed}
        onClick={() => setPhase("analyze")}
        className="mt-5 w-full max-w-xs"
      >
        Start analysis <ArrowRight size={15} />
      </Button>
    </div>
  );
};
