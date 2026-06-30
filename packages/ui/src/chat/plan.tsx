import { ClipboardList } from "lucide-react";
import { cn } from "../cn";
import { CodexDisclosureSummary } from "./disclosure-summary";

export interface CodexPlanItem {
  readonly content: string;
  readonly priority?: string;
  readonly status: "completed" | "in_progress" | "pending" | (string & {});
}

export interface CodexPlanDisclosureProps {
  readonly entries: readonly CodexPlanItem[];
  readonly defaultOpen?: boolean;
  readonly title?: string;
}

export function CodexPlanDisclosure({
  defaultOpen,
  entries,
  title = "Plan",
}: CodexPlanDisclosureProps) {
  if (entries.length === 0) {
    return null;
  }

  const completedCount = entries.filter((entry) => entry.status === "completed").length;

  return (
    <details
      className="group/plan max-w-[720px] text-sm"
      data-plan-disclosure="true"
      open={defaultOpen}
    >
      <CodexDisclosureSummary
        chevronClassName="group-open/plan:rotate-90"
        icon={<ClipboardList size={14} />}
        meta={`${completedCount} of ${entries.length} complete`}
        title={title}
      />
      <ol className="ml-8 mt-1 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700">
        {entries.map((entry, index) => (
          <li className="flex items-start gap-2 text-sm" key={`${entry.content}-${index}`}>
            <span
              className={cn("mt-2 size-1.5 shrink-0 rounded-full", statusDotClass(entry.status))}
              data-plan-status-dot={entry.status}
            />
            <span className="min-w-0 flex-1 leading-6 text-zinc-700 dark:text-zinc-300">
              {entry.content}
            </span>
            <span
              className="shrink-0 text-xs leading-6 text-zinc-400 dark:text-zinc-500"
              data-plan-status-label={entry.status}
            >
              {statusLabel(entry.status)}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function statusLabel(status: CodexPlanItem["status"]) {
  if (status === "in_progress") return "in progress";
  return status;
}

function statusDotClass(status: CodexPlanItem["status"]) {
  if (status === "completed") return "bg-zinc-500 dark:bg-zinc-400";
  if (status === "in_progress") return "bg-zinc-400 motion-safe:animate-pulse";
  return "bg-zinc-300 dark:bg-zinc-600";
}
