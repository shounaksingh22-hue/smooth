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
  const base =
    "tactile ring-focus inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-accent text-accent-fg font-semibold shadow-[var(--shadow-sm)] hover:brightness-110",
    secondary: "bg-elevated text-fg border border-border hover:border-border-strong",
    danger: "bg-danger text-white font-semibold hover:brightness-110",
    ghost: "bg-transparent text-muted hover:text-fg hover:bg-elevated",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
