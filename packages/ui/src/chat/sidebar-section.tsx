import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarSectionProps {
  readonly actionIcon?: ReactNode;
  readonly actionLabel?: string;
  readonly actionPressed?: boolean;
  readonly children: ReactNode;
  readonly title: string;
  readonly onAction?: () => void;
}

export function CodexSidebarSection({
  actionIcon,
  actionLabel,
  actionPressed,
  children,
  title,
  onAction,
}: CodexSidebarSectionProps) {
  return (
    <section className="mb-5" data-sidebar-section="true">
      <div className="mb-1 flex items-center justify-between px-3">
        <h2 className="text-sm font-medium text-zinc-400">{title}</h2>
        {actionIcon ? (
          onAction && actionLabel ? (
            <button
              aria-label={actionLabel}
              aria-pressed={actionPressed}
              className={cn(
                "flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-600/50 dark:hover:text-zinc-100",
                actionPressed && "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100",
              )}
              onClick={onAction}
              type="button"
            >
              {actionIcon}
            </button>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-lg text-zinc-400"
            >
              {actionIcon}
            </span>
          )
        ) : null}
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}
