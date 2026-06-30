import { ChevronRight, ClipboardList } from "lucide-react";
import { cn } from "../cn";

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
    <details className="group/plan text-sm" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-2 py-2 text-zinc-600 hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
        <span className="flex size-6 shrink-0 items-center justify-center text-zinc-500">
          <ClipboardList size={14} />
        </span>
        <div className="min-w-0 flex-1 leading-5">
          <div className="truncate font-medium text-zinc-900">{title}</div>
          <div className="text-xs text-zinc-500">
            {completedCount} of {entries.length} complete
          </div>
        </div>
        <ChevronRight
          className="shrink-0 text-zinc-400 transition group-open/plan:rotate-90"
          size={15}
        />
      </summary>
      <ol className="ml-8 mt-1 space-y-1 border-l border-zinc-200 pl-3">
        {entries.map((entry, index) => (
          <li className="flex items-start gap-2 text-sm" key={`${entry.content}-${index}`}>
            <span
              className={cn("mt-2 size-1.5 shrink-0 rounded-full", statusDotClass(entry.status))}
            />
            <span className="min-w-0 flex-1 leading-6 text-zinc-700">{entry.content}</span>
            <span className={cn("shrink-0 text-xs leading-6", statusTextClass(entry.status))}>
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
  if (status === "completed") return "bg-emerald-500";
  if (status === "in_progress") return "bg-amber-500";
  return "bg-zinc-300";
}

function statusTextClass(status: CodexPlanItem["status"]) {
  if (status === "completed") return "text-emerald-600";
  if (status === "in_progress") return "text-amber-600";
  return "text-zinc-400";
}
