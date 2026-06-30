import type { ReactNode } from "react";
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
    <details className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4" open={defaultOpen}>
      <summary className="flex cursor-pointer items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-900">{title}</div>
          <div className="text-xs text-zinc-500">{kind}</div>
        </div>
        <StatusBadge label={status} tone={toolTone(status)} />
      </summary>
      {children ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs leading-5 text-zinc-600">
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
