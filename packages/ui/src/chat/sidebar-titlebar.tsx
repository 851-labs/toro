import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarTitlebarProps {
  readonly ariaLabel?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function CodexSidebarTitlebar({
  ariaLabel,
  children,
  className,
}: CodexSidebarTitlebarProps) {
  return (
    <div className={cn("flex h-14 items-center px-5", className)} data-sidebar-titlebar="true">
      <div aria-label={ariaLabel} className="flex items-center gap-1">
        {children}
      </div>
    </div>
  );
}

export interface CodexSidebarTitlebarControlProps {
  readonly active?: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
}

export function CodexSidebarTitlebarControl({
  active = true,
  icon,
  label,
  onClick,
}: CodexSidebarTitlebarControlProps) {
  const className = cn(
    "flex size-8 items-center justify-center rounded-lg",
    active ? "text-zinc-500" : "text-zinc-300",
    active && onClick && "hover:bg-zinc-200/70 hover:text-zinc-900",
  );

  if (!active || !onClick) {
    return (
      <span aria-disabled={!active} aria-label={label} className={className} role="img">
        {icon}
      </span>
    );
  }

  return (
    <button aria-label={label} className={className} onClick={onClick} type="button">
      {icon}
    </button>
  );
}
