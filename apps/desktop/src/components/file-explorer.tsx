import { useQuery } from "@tanstack/react-query";
import type { Workspace } from "@toro/domain";
import type { FileTreeEntry } from "@toro/environments";
import { cn } from "@toro/ui";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { useState } from "react";
import { hostClient } from "../lib/host-client";

interface FileExplorerProps {
  readonly selectedFilePath: string | null;
  readonly workspace: Workspace | null;
  readonly onSelectFile: (path: string) => void;
}

export function FileExplorer({ selectedFilePath, workspace, onSelectFile }: FileExplorerProps) {
  const files = useQuery({
    enabled: Boolean(workspace),
    queryFn: () => hostClient.listFiles(workspace!.id),
    queryKey: ["files", workspace?.id],
  });

  if (!workspace) {
    return <div className="px-3 py-2 text-sm text-zinc-400">No project</div>;
  }

  return (
    <div className="max-h-64 overflow-auto rounded-2xl bg-white/70 p-1">
      <Tree
        entries={files.data ?? []}
        selectedFilePath={selectedFilePath}
        onSelectFile={onSelectFile}
      />
    </div>
  );
}

function Tree(props: {
  readonly entries: readonly FileTreeEntry[];
  readonly selectedFilePath: string | null;
  readonly onSelectFile: (path: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {props.entries.map((entry) => (
        <TreeEntry
          key={entry.path}
          entry={entry}
          level={0}
          selectedFilePath={props.selectedFilePath}
          onSelectFile={props.onSelectFile}
        />
      ))}
    </div>
  );
}

function TreeEntry(props: {
  readonly entry: FileTreeEntry;
  readonly level: number;
  readonly selectedFilePath: string | null;
  readonly onSelectFile: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isFile = props.entry.kind === "file";
  return (
    <div>
      <button
        className={cn(
          "flex min-h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-sm text-zinc-700 hover:bg-zinc-100",
          props.selectedFilePath === props.entry.path && "bg-zinc-100 text-zinc-950",
        )}
        onClick={() => (isFile ? props.onSelectFile(props.entry.path) : setOpen((value) => !value))}
        style={{ paddingLeft: 8 + props.level * 14 }}
      >
        {isFile ? <FileText size={14} className="text-zinc-400" /> : <FolderIcon open={open} />}
        <span className="min-w-0 flex-1 truncate">{props.entry.name}</span>
      </button>
      {open
        ? props.entry.children?.map((child) => (
            <TreeEntry
              key={child.path}
              entry={child}
              level={props.level + 1}
              selectedFilePath={props.selectedFilePath}
              onSelectFile={props.onSelectFile}
            />
          ))
        : null}
    </div>
  );
}

function FolderIcon({ open }: { readonly open: boolean }) {
  return (
    <span className="flex items-center text-zinc-400">
      <ChevronRight className={open ? "rotate-90" : ""} size={12} />
      <Folder size={14} />
    </span>
  );
}
