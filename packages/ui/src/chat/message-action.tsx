import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexMessageActionProps {
  readonly children: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly pressed?: boolean;
}

export function CodexMessageAction({ children, label, onClick, pressed }: CodexMessageActionProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
        pressed
          ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          : "text-zinc-400 dark:text-zinc-500",
      )}
      data-message-action="true"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
