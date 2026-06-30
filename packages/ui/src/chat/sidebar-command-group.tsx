import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarCommandGroupProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CodexSidebarCommandGroup({ children, className }: CodexSidebarCommandGroupProps) {
  return (
    <div className={cn("space-y-1 px-3", className)} data-sidebar-command-group="true">
      {children}
    </div>
  );
}
