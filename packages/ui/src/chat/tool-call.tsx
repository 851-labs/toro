import type { ReactNode } from "react";
import { ChevronRight, SquareTerminal } from "lucide-react";
import { StatusBadge } from "../status-badge";

export interface CodexToolCallProps {
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly kind: string;
  readonly status: string;
  readonly title: string;
}

export function CodexToolCall({ children, defaultOpen, kind, status, title }: CodexToolCallProps) {
  return (
    <details
      className="group/tool rounded-[18px] border border-zinc-200 bg-white px-4 py-3 text-sm"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
          <SquareTerminal size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-zinc-900">{title}</div>
          <div className="text-xs text-zinc-500">{kind}</div>
        </div>
        <StatusBadge label={status} tone={toolTone(status)} />
        <ChevronRight
          className="shrink-0 text-zinc-400 transition group-open/tool:rotate-90"
          size={15}
        />
      </summary>
      {children ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-600">
          {children}
        </pre>
      ) : null}
    </details>
  );
}

function toolTone(status: CodexToolCallProps["status"]) {
  if (status === "completed") return "good";
  if (status === "failed") return "bad";
  return "warn";
}
