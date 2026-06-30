import type { ReactNode } from "react";
import { BrainCircuit } from "lucide-react";
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
    <details
      className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-900">
        <BrainCircuit size={16} />
        <span>{title}</span>
        {isStreaming ? (
          <span className="ml-1 inline-flex items-center gap-1 text-xs font-normal text-zinc-400">
            <span className="size-1.5 rounded-full bg-zinc-400" />
            working
          </span>
        ) : null}
      </summary>
      {children ? (
        <div
          className={cn(
            "mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600",
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
