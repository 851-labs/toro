import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
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
      ? "cursor-default text-zinc-400 dark:text-zinc-500"
      : "text-zinc-800 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-600/50 dark:hover:text-white",
    active && !disabled && "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-600/70 dark:text-white",
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
    <BaseButton
      aria-label={label}
      aria-pressed={active}
      className={className}
      data-base-ui-button="true"
      data-sidebar-command="true"
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </BaseButton>
  );
}
