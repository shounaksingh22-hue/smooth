import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  children,
  className = "",
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95 cursor-pointer outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50",
    danger: "bg-rose-500 hover:bg-rose-600 text-slate-50 font-bold",
    ghost: "bg-transparent hover:bg-slate-800/50 text-slate-300",
  };

  const adaptiveClass = "rounded-[var(--radius-ui)]";

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${adaptiveClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
