import { Check, Copy, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@toro/ui";

interface ChatHeaderActionsProps {
  readonly title: string;
  readonly workspacePath: string | null;
}

type CopiedTarget = "title" | "workspace" | null;

export function ChatHeaderActions({ title, workspacePath }: ChatHeaderActionsProps) {
  const [open, setOpen] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);

  async function copyValue(target: Exclude<CopiedTarget, null>, value: string) {
    await writeClipboard(value);
    setCopiedTarget(target);
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-label="More chat actions"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
          open && "bg-zinc-100 text-zinc-900",
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <div className="absolute left-0 top-9 z-20 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-md">
          <HeaderActionButton
            copied={copiedTarget === "title"}
            label="Copy chat title"
            onClick={() => void copyValue("title", title)}
          />
          {workspacePath ? (
            <HeaderActionButton
              copied={copiedTarget === "workspace"}
              label="Copy workspace path"
              onClick={() => void copyValue("workspace", workspacePath)}
            />
          ) : null}
          {copiedTarget ? (
            <div className="px-2 py-1.5 text-xs text-zinc-400">
              {copiedTarget === "title" ? "Copied chat title" : "Copied workspace path"}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function HeaderActionButton({
  copied,
  label,
  onClick,
}: {
  readonly copied: boolean;
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
      {copied ? (
        <Check size={15} className="text-emerald-500" />
      ) : (
        <Copy size={15} className="text-zinc-400" />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard?.writeText(value);
  } catch {
    // The visible copied state is still useful in restricted browser contexts.
  }
}
