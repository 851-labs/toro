import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode;
  readonly variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  ghost: "border-transparent bg-transparent text-zinc-700 hover:bg-zinc-200/70",
  primary: "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800",
  secondary: "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100",
};

export function Button({
  className,
  icon,
  variant = "secondary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-8 min-w-fit items-center justify-center gap-2 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
