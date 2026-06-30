import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexSidebarAvatarProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CodexSidebarAvatar({ children, className }: CodexSidebarAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#58d8ff_0%,#6f5cff_58%,#8b5cf6_100%)] text-sm font-semibold text-white shadow-sm",
        className,
      )}
      data-sidebar-avatar="true"
    >
      {children}
    </span>
  );
}
