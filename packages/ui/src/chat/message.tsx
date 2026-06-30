import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy, Maximize2, Minimize2, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "../cn";
import { CodexMessageAction } from "./message-action";

export interface CodexChatMessageProps {
  readonly children: ReactNode;
  readonly copyText?: string;
  readonly isStreaming?: boolean;
  readonly role: "assistant" | "system" | "user";
}

export function CodexChatMessage({ children, copyText, isStreaming, role }: CodexChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const isUser = role === "user";
  const canCopy = role === "assistant" && !isStreaming && copyText && copyText.length > 0;
  const showActions = role === "assistant" && !isStreaming;

  async function copyMessage() {
    if (!copyText) {
      return;
    }
    await writeClipboard(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <article
      className={cn("group flex", isUser ? "justify-end" : "justify-start")}
      data-chat-message="true"
    >
      <div
        className={cn(
          "flex flex-col",
          isUser
            ? "max-w-[82%] items-end"
            : expanded
              ? "max-w-[92%] items-start"
              : "max-w-[72%] items-start",
        )}
      >
        <div
          className={cn(
            "whitespace-pre-wrap text-base leading-7",
            isUser
              ? "rounded-3xl bg-zinc-100 px-4 py-3 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950"
              : "py-2 text-zinc-900 dark:text-zinc-100",
            isStreaming &&
              "after:ml-1 after:inline-block after:size-2 after:rounded-full after:bg-zinc-400 after:motion-safe:animate-pulse",
          )}
        >
          {children}
        </div>
        {showActions ? (
          <div className="mt-1 flex items-center gap-1 text-zinc-400">
            {canCopy ? (
              <CodexMessageAction
                label={copied ? "Copied message" : "Copy message"}
                onClick={() => void copyMessage()}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </CodexMessageAction>
            ) : null}
            <CodexMessageAction
              label="Good response"
              onClick={() => setFeedback((value) => (value === "good" ? null : "good"))}
              pressed={feedback === "good"}
            >
              <ThumbsUp size={15} />
            </CodexMessageAction>
            <CodexMessageAction
              label="Bad response"
              onClick={() => setFeedback((value) => (value === "bad" ? null : "bad"))}
              pressed={feedback === "bad"}
            >
              <ThumbsDown size={15} />
            </CodexMessageAction>
            <CodexMessageAction
              label={expanded ? "Collapse message" : "Expand message"}
              onClick={() => setExpanded((value) => !value)}
              pressed={expanded}
            >
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </CodexMessageAction>
          </div>
        ) : null}
      </div>
    </article>
  );
}

async function writeClipboard(text: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      writeClipboardWithTextarea(text);
    }
  } else {
    writeClipboardWithTextarea(text);
  }
}

function writeClipboardWithTextarea(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
