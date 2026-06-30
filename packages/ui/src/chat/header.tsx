import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexChatHeaderProps {
  readonly actions?: ReactNode;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly leading?: ReactNode;
  readonly rightActions?: ReactNode;
  readonly title?: ReactNode;
  readonly titleAs?: "h1" | "h2";
}

export function CodexChatHeader({
  actions,
  ariaLabel,
  className,
  leading,
  rightActions,
  title,
  titleAs = "h1",
}: CodexChatHeaderProps) {
  const Title = titleAs;

  return (
    <header
      aria-label={ariaLabel}
      className={cn(
        "flex h-16 items-center justify-between border-b border-zinc-200/80 px-5",
        "dark:border-zinc-800 dark:bg-[#101010]",
        className,
      )}
      data-chat-header="true"
    >
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        {title ? (
          <Title className="truncate text-lg font-medium dark:text-zinc-100">{title}</Title>
        ) : null}
        {actions}
      </div>
      {rightActions ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">{rightActions}</div>
      ) : null}
    </header>
  );
}
