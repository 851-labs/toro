import { cn } from "../cn";

export interface CodexEmptyStateProps {
  readonly placement?: "center" | "composer";
  readonly workspaceName?: string | null;
}

export function CodexEmptyState({ placement = "center", workspaceName }: CodexEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        placement === "center" ? "min-h-[44vh]" : "min-h-0",
      )}
      data-empty-state="true"
    >
      <h2 className="text-3xl font-medium tracking-tight">
        What should we build{workspaceName ? ` in ${workspaceName}` : ""}?
      </h2>
      {workspaceName ? null : (
        <p className="mt-3 max-w-md text-base leading-7 text-zinc-400">
          Open a project, then start a new chat.
        </p>
      )}
    </div>
  );
}
