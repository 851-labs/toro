import { useQuery } from "@tanstack/react-query";
import type { Workspace } from "@toro/domain";
import { FileCode } from "lucide-react";
import { hostClient } from "../lib/host-client";

interface EditorPaneProps {
  readonly filePath: string | null;
  readonly workspace: Workspace | null;
}

export function EditorPane({ filePath, workspace }: EditorPaneProps) {
  const file = useQuery({
    enabled: Boolean(workspace && filePath),
    queryFn: () => hostClient.readTextFile(workspace!.id, filePath!),
    queryKey: ["file", workspace?.id, filePath],
    retry: 0,
  });

  return (
    <section className="min-h-0 min-w-0 border-l border-zinc-200 bg-zinc-50">
      <div className="flex h-16 items-center gap-2 border-b border-zinc-200 bg-white px-4 text-sm text-zinc-500">
        <FileCode size={14} />
        <span className="min-w-0 truncate">{filePath ?? "No file selected"}</span>
      </div>
      <div className="h-[calc(100%-64px)] min-w-0 overflow-auto">
        {file.data ? (
          <pre className="min-h-full min-w-full w-max p-5 text-xs leading-5 text-zinc-700">
            <code>{file.data.content}</code>
          </pre>
        ) : (
          <div className="p-5 text-sm text-zinc-500">
            {file.error instanceof Error ? file.error.message : "Select a file"}
          </div>
        )}
      </div>
    </section>
  );
}
