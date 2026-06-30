import type { ReactNode } from "react";
import { ChevronRight, SquareTerminal } from "lucide-react";
import { cn } from "../cn";

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
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-zinc-600 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-6 shrink-0 items-center justify-center text-zinc-500">
          <SquareTerminal size={14} />
        </span>
        <div className="min-w-0 flex-1 leading-5">
          <div className="truncate font-medium text-zinc-900">{title}</div>
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
            <span className="truncate">{kind}</span>
            <span aria-hidden="true" className="text-zinc-300">
              /
            </span>
            <span className={cn("shrink-0", statusClass(status))}>{statusLabel(status)}</span>
          </div>
        </div>
        <ChevronRight
          className="shrink-0 text-zinc-400 transition group-open/tool:rotate-90"
          size={15}
        />
      </summary>
      {children ? (
        <pre className="ml-8 mt-1 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-2 text-xs leading-5 text-zinc-600">
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
