import type { ReactNode } from "react";
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
    onClick && "hover:bg-zinc-200/70",
    active && "bg-zinc-200/80 text-zinc-950",
  );
  const content = (
    <>
      <span className="shrink-0 text-zinc-500">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-zinc-800">{label}</span>
        {meta ? <span className="block truncate text-xs text-zinc-400">{meta}</span> : null}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <div className={className} data-sidebar-row="true" title={title}>
        {content}
      </div>
    );
  }

  return (
    <button
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      className={className}
      data-sidebar-row="true"
      onClick={onClick}
      title={title}
      type="button"
    >
      {content}
    </button>
  );
}
