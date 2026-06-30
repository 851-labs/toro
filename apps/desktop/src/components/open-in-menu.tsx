import type { WorkspaceId } from "@toro/domain";
import { Check, ChevronDown, Copy, FolderOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn, VsCodeMark } from "@toro/ui";
import { hostClient } from "../lib/host-client";

interface OpenInMenuProps {
  readonly workspaceId: WorkspaceId;
  readonly workspacePath: string;
}

type Status = "copied" | "finder" | "vscode" | null;

export function OpenInMenu({ workspaceId, workspacePath }: OpenInMenuProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function openExternal(target: "finder" | "vscode") {
    await hostClient.openWorkspaceExternal(workspaceId, target);
    setStatus(target);
  }

  async function copyPath() {
    await writeClipboard(workspacePath);
    setStatus("copied");
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-label="Open in"
        className={cn(
          "flex h-9 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-950",
          open && "bg-zinc-50 text-zinc-950",
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <VsCodeMark size={16} />
        <span>Open in</span>
        <ChevronDown size={14} />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-md">
          <OpenInAction label="Open in VS Code" onClick={() => void openExternal("vscode")}>
            <VsCodeMark size={15} />
          </OpenInAction>
          <OpenInAction label="Reveal in Finder" onClick={() => void openExternal("finder")}>
            <FolderOpen size={15} className="text-zinc-400" />
          </OpenInAction>
          <OpenInAction label="Copy workspace path" onClick={() => void copyPath()}>
            {status === "copied" ? (
              <Check size={15} className="text-emerald-500" />
            ) : (
              <Copy size={15} className="text-zinc-400" />
            )}
          </OpenInAction>
          {status ? (
            <div className="px-2 py-1.5 text-xs text-zinc-400">{statusText(status)}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function OpenInAction({
  children,
  label,
  onClick,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
      onClick={onClick}
      type="button"
    >
      {children}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

function statusText(status: Exclude<Status, null>) {
  if (status === "copied") return "Copied workspace path";
  if (status === "vscode") return "Opened in VS Code";
  return "Revealed in Finder";
}

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard?.writeText(value);
  } catch {
    // The visible copied state is still useful in restricted browser contexts.
  }
}
