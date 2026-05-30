import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`tactile ring-focus relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "bg-accent border-accent" : "bg-elevated border-border"
        }`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-150 ${
            checked ? "left-[18px]" : "left-[3px]"
          }`}
        />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  );
};
