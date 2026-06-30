import type { ReactNode } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { SquareTerminal } from "lucide-react";
import { CodexCollapsiblePanel } from "./collapsible-panel";
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
      className="group/tool-group max-w-[640px] text-sm text-zinc-600 dark:text-zinc-400"
      data-base-ui-collapsible="true"
      data-tool-call-group="true"
      defaultOpen={defaultOpen}
    >
      <CodexDisclosureSummary
        activity
        chevronClassName="group-data-[open]/tool-group:rotate-90"
        icon={<SquareTerminal size={14} />}
        meta={`${completedCount} of ${count} complete`}
        summaryClassName="hover:bg-transparent group-data-[open]/tool-group:bg-transparent dark:hover:bg-transparent"
        title={`${count} tool calls`}
      />
      <CodexCollapsiblePanel className="ml-8" data-tool-call-group-items="true" keepMounted>
        <div className="mt-1.5 space-y-1.5">{children}</div>
      </CodexCollapsiblePanel>
    </Collapsible.Root>
  );
}
