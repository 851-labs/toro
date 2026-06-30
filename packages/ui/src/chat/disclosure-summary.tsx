import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../cn";

export interface CodexDisclosureSummaryProps {
  readonly activity?: boolean;
  readonly chevronClassName: string;
  readonly icon: ReactNode;
  readonly meta?: ReactNode;
  readonly summaryClassName?: string;
  readonly title: ReactNode;
  readonly trailing?: ReactNode;
}

export function CodexDisclosureSummary({
  activity,
  chevronClassName,
  icon,
  meta,
  summaryClassName,
  title,
  trailing,
}: CodexDisclosureSummaryProps) {
  return (
    <summary
      className={cn(
        "max-w-full cursor-pointer list-none items-center rounded-lg text-zinc-600 hover:bg-zinc-50/80 dark:text-zinc-400 dark:hover:bg-zinc-800/80 [&::-webkit-details-marker]:hidden",
        activity ? "flex w-fit gap-1.5 px-1.5 py-1" : "inline-flex gap-2 px-2 py-1.5",
        summaryClassName,
      )}
      data-activity-summary={activity ? "true" : undefined}
      data-disclosure-summary="true"
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400",
          activity ? "size-5" : "size-6",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 leading-5">
        <div className="truncate font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
        {meta ? (
          <div className="min-w-0 text-xs text-zinc-500 dark:text-zinc-400">{meta}</div>
        ) : null}
      </div>
      {trailing}
      <ChevronRight
        className={cn("shrink-0 text-zinc-400 transition", chevronClassName)}
        size={15}
      />
    </summary>
  );
}
