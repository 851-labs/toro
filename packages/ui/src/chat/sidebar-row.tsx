import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
import { cn } from "../cn";

export interface CodexSidebarRowProps {
  readonly active?: boolean;
  readonly ariaCurrent?: "page";
  readonly ariaLabel?: string;
  readonly icon: ReactNode;
  readonly indent?: boolean;
  readonly label: string;
  readonly meta?: string;
  readonly onClick?: () => void;
  readonly title?: string;
}

export function CodexSidebarRow({
  active,
  ariaCurrent,
  ariaLabel,
  icon,
  indent,
  label,
  meta,
  onClick,
  title,
}: CodexSidebarRowProps) {
  const className = cn(
    "flex h-9 w-full items-center rounded-lg py-1.5 text-left text-sm text-zinc-800",
    indent ? "gap-2 pl-8 pr-3" : "gap-3 px-3",
    "dark:text-zinc-200",
    onClick && "hover:bg-zinc-200/70 dark:hover:bg-zinc-600/50",
    active && "bg-zinc-200/80 text-zinc-950 dark:bg-zinc-300 dark:text-zinc-950",
  );
  const iconClassName = cn(
    "shrink-0",
    active ? "text-zinc-700 dark:text-zinc-700" : "text-zinc-500 dark:text-zinc-400",
  );
  const labelClassName = cn(
    "block truncate font-medium",
    active ? "text-zinc-950" : "text-zinc-800 dark:text-inherit",
  );
  const content = (
    <>
      <span className={iconClassName}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={labelClassName}>{label}</span>
        {meta ? (
          <span className="block truncate text-xs text-zinc-400 dark:text-zinc-500">{meta}</span>
        ) : null}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <div
        className={className}
        data-sidebar-row="true"
        data-sidebar-row-active={active ? "true" : undefined}
        title={title}
      >
        {content}
      </div>
    );
  }

  return (
    <BaseButton
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      className={className}
      data-base-ui-button="true"
      data-sidebar-row-active={active ? "true" : undefined}
      data-sidebar-row="true"
      onClick={onClick}
      title={title}
      type="button"
    >
      {content}
    </BaseButton>
  );
}
