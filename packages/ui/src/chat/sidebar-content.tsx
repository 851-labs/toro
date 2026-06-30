import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarContentProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CodexSidebarContent({ children, className }: CodexSidebarContentProps) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-auto px-3 pb-3 pt-4", className)}
      data-sidebar-content="true"
    >
      {children}
    </div>
  );
}
