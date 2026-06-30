import type { ReactNode } from "react";
import { Terminal } from "lucide-react";
import { cn } from "../cn";

export interface CodexDisclosureProps {
  readonly children?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly icon?: ReactNode;
  readonly title: string;
  readonly tone?: "plain" | "subtle";
}

export function CodexDisclosure({
  children,
  defaultOpen,
  icon = <Terminal size={16} />,
  title,
  tone = "plain",
}: CodexDisclosureProps) {
  return (
    <details
      className={cn(
        "rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600",
        tone === "plain" ? "bg-white" : "bg-zinc-50",
      )}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-900">
        {icon}
        {title}
      </summary>
      {children ? (
        <div className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap text-xs leading-5 text-zinc-500">
          {children}
        </div>
      ) : null}
    </details>
  );
}
