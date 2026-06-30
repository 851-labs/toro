export interface CodexEmptyStateProps {
  readonly workspaceName?: string | null;
}

export function CodexEmptyState({ workspaceName }: CodexEmptyStateProps) {
  return (
    <div className="flex min-h-[44vh] flex-col items-center justify-center text-center">
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
