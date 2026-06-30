import type { ComponentProps } from "react";
import { cn } from "../cn";

export type CodexSidebarInputProps = ComponentProps<"input">;

export function CodexSidebarInput({ className, ...props }: CodexSidebarInputProps) {
  return (
    <input
      className={cn(
        "h-9 min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400",
        className,
      )}
      data-sidebar-input="true"
      {...props}
    />
  );
}
