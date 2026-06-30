import type { ComponentPropsWithoutRef } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { cn } from "../cn";

type CodexCollapsiblePanelProps = ComponentPropsWithoutRef<typeof Collapsible.Panel>;

export function CodexCollapsiblePanel({ className, ...props }: CodexCollapsiblePanelProps) {
  return (
    <Collapsible.Panel
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden opacity-100 transition-[height,opacity] duration-200 ease-out",
        "data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0 motion-reduce:transition-none",
        className,
      )}
      data-collapsible-panel-animated="true"
      {...props}
    />
  );
}
