import type { ReactNode } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { SquareTerminal } from "lucide-react";
import { CodexDisclosureSummary } from "./disclosure-summary";

export interface CodexToolCallGroupProps {
  readonly children?: ReactNode;
  readonly completedCount: number;
  readonly count: number;
  readonly defaultOpen?: boolean;
}

export function CodexToolCallGroup({
  children,
  completedCount,
  count,
  defaultOpen,
}: CodexToolCallGroupProps) {
  return (
    <Collapsible.Root
      className="group/tool-group max-w-full text-sm text-zinc-600 dark:text-zinc-400"
      data-base-ui-collapsible="true"
      data-tool-call-group="true"
      defaultOpen={defaultOpen}
    >
      <CodexDisclosureSummary
        activity
        chevronClassName="group-data-[open]/tool-group:rotate-90"
        icon={<SquareTerminal size={14} />}
        meta={`${completedCount} of ${count} complete`}
        summaryClassName="group-data-[open]/tool-group:bg-transparent group-data-[open]/tool-group:hover:bg-zinc-50/80 dark:group-data-[open]/tool-group:hover:bg-zinc-800/80"
        title={`${count} tool calls`}
      />
      <Collapsible.Panel
        className="ml-8 mt-1 space-y-2"
        data-tool-call-group-items="true"
        keepMounted
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
