import type { ReactNode } from "react";
import { BrainCircuit } from "lucide-react";
import { cn } from "../cn";
import { CodexDisclosureSummary } from "./disclosure-summary";

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
      className="group/thinking max-w-[720px] text-sm text-zinc-600 dark:text-zinc-400"
      data-thinking-disclosure="true"
      open={defaultOpen}
    >
      <CodexDisclosureSummary
        chevronClassName="group-open/thinking:rotate-90"
        icon={<BrainCircuit size={14} />}
        title={title}
        trailing={
          isStreaming ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-normal text-zinc-400">
              <span className="size-1.5 rounded-full bg-zinc-400 motion-safe:animate-pulse" />
              working
            </span>
          ) : null
        }
      />
      {children ? (
        <div
          className={cn(
            "ml-10 mt-1 whitespace-pre-wrap py-0.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400",
            isStreaming &&
              "after:ml-1 after:inline-block after:size-1.5 after:rounded-full after:bg-zinc-400 after:motion-safe:animate-pulse",
          )}
          data-thinking-body="true"
        >
          {children}
        </div>
      ) : null}
    </details>
  );
}
