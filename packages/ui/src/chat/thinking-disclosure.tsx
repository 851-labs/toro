import type { ReactNode } from "react";
import { BrainCircuit, ChevronRight } from "lucide-react";
import { cn } from "../cn";

export interface CodexThinkingDisclosureProps {
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly isStreaming?: boolean;
  readonly title?: string;
}

export function CodexThinkingDisclosure({
  children,
  defaultOpen,
  isStreaming,
  title = "Thinking",
}: CodexThinkingDisclosureProps) {
  return (
    <details className="group/thinking text-sm text-zinc-600" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-zinc-600 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-6 shrink-0 items-center justify-center text-zinc-500">
          <BrainCircuit size={14} />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-zinc-900">{title}</span>
        {isStreaming ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-normal text-zinc-400">
            <span className="size-1.5 rounded-full bg-zinc-400 motion-safe:animate-pulse" />
            working
          </span>
        ) : null}
        <ChevronRight
          className="shrink-0 text-zinc-400 transition group-open/thinking:rotate-90"
          size={15}
        />
      </summary>
      {children ? (
        <div
          className={cn(
            "ml-8 mt-1 whitespace-pre-wrap border-l border-zinc-200 pl-3 text-sm leading-6 text-zinc-600",
            isStreaming &&
              "after:ml-1 after:inline-block after:size-1.5 after:rounded-full after:bg-zinc-400",
          )}
        >
          {children}
        </div>
      ) : null}
    </details>
  );
}
