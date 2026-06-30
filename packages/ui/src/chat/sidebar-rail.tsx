import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarRailProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly story?: boolean;
}

export function CodexSidebarRail({ children, className, story }: CodexSidebarRailProps) {
  return (
    <aside
      className={cn("flex min-h-0 flex-col border-r border-zinc-200 bg-[#f7f8f8]", className)}
      data-sidebar-rail="true"
      data-sidebar-story-rail={story ? "true" : undefined}
    >
      {children}
    </aside>
  );
}
