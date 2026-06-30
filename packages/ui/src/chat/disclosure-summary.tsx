import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../cn";

export interface CodexDisclosureSummaryProps {
  readonly chevronClassName: string;
  readonly icon: ReactNode;
  readonly meta?: ReactNode;
  readonly summaryClassName?: string;
  readonly title: ReactNode;
  readonly trailing?: ReactNode;
}

export function CodexDisclosureSummary({
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
        "flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-600 hover:bg-zinc-50/80 [&::-webkit-details-marker]:hidden",
        summaryClassName,
      )}
      data-disclosure-summary="true"
    >
      <span className="flex size-6 shrink-0 items-center justify-center text-zinc-500">{icon}</span>
      <div className="min-w-0 flex-1 leading-5">
        <div className="truncate font-medium text-zinc-900">{title}</div>
        {meta ? <div className="min-w-0 text-xs text-zinc-500">{meta}</div> : null}
      </div>
      {trailing}
      <ChevronRight
        className={cn("shrink-0 text-zinc-400 transition", chevronClassName)}
        size={15}
      />
    </summary>
  );
}
