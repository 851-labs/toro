import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarFooterProps {
  readonly action?: ReactNode;
  readonly avatar: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly subtitle: ReactNode;
  readonly title: ReactNode;
}

export function CodexSidebarFooter({
  action,
  avatar,
  children,
  className,
  subtitle,
  title,
}: CodexSidebarFooterProps) {
  return (
    <div
      className={cn("border-t border-zinc-200/80 p-3 dark:border-zinc-600/70", className)}
      data-sidebar-footer="true"
    >
      {children}
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-100">
            {title}
          </div>
          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>
        </div>
        {action}
      </div>
    </div>
  );
}
