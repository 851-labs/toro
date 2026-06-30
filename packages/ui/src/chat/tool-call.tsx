import type { ReactNode } from "react";
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
  return (
    <details className="group/tool text-sm" open={defaultOpen}>
      <CodexDisclosureSummary
        chevronClassName="group-open/tool:rotate-90"
        icon={<SquareTerminal size={14} />}
        meta={
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{kind}</span>
            <span aria-hidden="true" className="text-zinc-300">
              /
            </span>
            <span className={cn("shrink-0", statusClass(status))}>{statusLabel(status)}</span>
          </span>
        }
        summaryClassName="group-open/tool:hover:bg-transparent"
        title={title}
      />
      {children ? (
        <pre
          className="ml-10 mt-1 max-h-52 overflow-auto whitespace-pre-wrap py-0.5 text-xs leading-5 text-zinc-500"
          data-tool-output="true"
        >
          {children}
        </pre>
      ) : null}
    </details>
  );
}

function statusLabel(status: CodexToolCallProps["status"]) {
  return status === "in_progress" ? "running" : status;
}

function statusClass(status: CodexToolCallProps["status"]) {
  if (status === "completed") return "text-emerald-600";
  if (status === "failed") return "text-red-600";
  return "text-zinc-500";
}
