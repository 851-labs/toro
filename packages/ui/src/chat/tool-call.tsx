import type { ReactNode } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { SquareTerminal } from "lucide-react";
import { cn } from "../cn";
import { CodexDisclosureSummary } from "./disclosure-summary";

export interface CodexToolCallProps {
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly kind: string;
  readonly status: string;
  readonly title: string;
}

export function CodexToolCall({ children, defaultOpen, kind, status, title }: CodexToolCallProps) {
  const live = status === "pending" || status === "in_progress";
  return (
    <Collapsible.Root
      className="group/tool max-w-[720px] text-sm text-zinc-600 dark:text-zinc-400"
      data-activity-disclosure="tool"
      data-base-ui-collapsible="true"
      data-tool-call="true"
      defaultOpen={defaultOpen}
    >
      <CodexDisclosureSummary
        activity
        chevronClassName="group-data-[open]/tool:rotate-90"
        icon={<SquareTerminal size={14} />}
        meta={
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{kind}</span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
              /
            </span>
            <span
              className={cn("inline-flex shrink-0 items-center gap-1", statusClass(status))}
              data-tool-call-live={live ? "true" : undefined}
            >
              {live ? (
                <span className="size-1.5 rounded-full bg-zinc-400 motion-safe:animate-pulse" />
              ) : null}
              {statusLabel(status)}
            </span>
          </span>
        }
        summaryClassName="group-data-[open]/tool:bg-transparent group-data-[open]/tool:hover:bg-zinc-50/80 dark:group-data-[open]/tool:hover:bg-zinc-800/80"
        title={title}
      />
      {children ? (
        <Collapsible.Panel
          className="ml-8 mt-1 max-h-52 overflow-auto py-0.5"
          data-tool-output="true"
          keepMounted
        >
          <pre
            className="whitespace-pre-wrap text-xs leading-5 text-zinc-500 dark:text-zinc-400"
            data-tool-output-pre="true"
          >
            {children}
          </pre>
        </Collapsible.Panel>
      ) : null}
    </Collapsible.Root>
  );
}

function statusLabel(status: CodexToolCallProps["status"]) {
  return status === "in_progress" ? "running" : status;
}

function statusClass(status: CodexToolCallProps["status"]) {
  if (status === "completed") return "text-zinc-500";
  if (status === "failed") return "text-red-600";
  return "text-zinc-500";
}
