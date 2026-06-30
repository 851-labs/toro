import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexChatMessageProps {
  readonly children: ReactNode;
  readonly isStreaming?: boolean;
  readonly role: "assistant" | "system" | "user";
}

export function CodexChatMessage({ children, isStreaming, role }: CodexChatMessageProps) {
  const isUser = role === "user";

  return (
    <article className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] whitespace-pre-wrap text-base leading-7",
          isUser
            ? "rounded-3xl bg-zinc-100 px-4 py-3 text-zinc-950"
            : "max-w-[72%] py-2 text-zinc-900",
          isStreaming &&
            "after:ml-1 after:inline-block after:size-2 after:rounded-full after:bg-zinc-400",
        )}
      >
        {children}
      </div>
    </article>
  );
}
