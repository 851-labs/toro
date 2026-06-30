import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarCommandProps {
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
}

export function CodexSidebarCommand({
  active,
  disabled,
  icon,
  label,
  onClick,
}: CodexSidebarCommandProps) {
  const className = cn(
    "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium",
    disabled
      ? "cursor-default text-zinc-400"
      : "text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-900",
    active && !disabled && "bg-zinc-200/70 text-zinc-900",
  );

  if (!onClick || disabled) {
    return (
      <div aria-disabled={disabled} className={className} data-sidebar-command="true">
        {icon}
        {label}
      </div>
    );
  }

  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={className}
      data-sidebar-command="true"
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
