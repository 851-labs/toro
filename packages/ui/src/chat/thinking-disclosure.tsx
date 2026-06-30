import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
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
  const [open, setOpen] = useState(Boolean(defaultOpen));

  useEffect(() => {
    setOpen(Boolean(defaultOpen));
  }, [defaultOpen]);

  return (
    <Collapsible.Root
      className="group/thinking max-w-[720px] text-sm text-zinc-600 dark:text-zinc-400"
      data-activity-disclosure="thinking"
      data-base-ui-collapsible="true"
      data-thinking-disclosure="true"
      onOpenChange={setOpen}
      open={open}
    >
      <CodexDisclosureSummary
        activity
        chevronClassName="group-data-[open]/thinking:rotate-90"
        icon={<BrainCircuit size={14} />}
        summaryClassName="group-data-[open]/thinking:bg-transparent group-data-[open]/thinking:hover:bg-zinc-50/80 dark:group-data-[open]/thinking:hover:bg-zinc-800/80"
        title={title}
        trailing={
          isStreaming ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-normal text-zinc-400">
              <span aria-hidden="true">·</span>
              <span className="size-1 rounded-full bg-zinc-400 motion-safe:animate-pulse" />
              working
            </span>
          ) : null
        }
      />
      {children ? (
        <Collapsible.Panel
          className={cn(
            "ml-8 mt-1 whitespace-pre-wrap py-0.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400",
            isStreaming &&
              "after:ml-1 after:inline-block after:size-1.5 after:align-middle after:rounded-full after:bg-zinc-400 after:motion-safe:animate-pulse",
          )}
          data-thinking-body="true"
          keepMounted
        >
          {children}
        </Collapsible.Panel>
      ) : null}
    </Collapsible.Root>
  );
}
