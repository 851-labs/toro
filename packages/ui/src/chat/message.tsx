import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy, Maximize2, Minimize2, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "../cn";

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
    <article className={cn("group flex", isUser ? "justify-end" : "justify-start")}>
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
            isUser ? "rounded-3xl bg-zinc-100 px-4 py-3 text-zinc-950" : "py-2 text-zinc-900",
            isStreaming &&
              "after:ml-1 after:inline-block after:size-2 after:rounded-full after:bg-zinc-400",
          )}
        >
          {children}
        </div>
        {showActions ? (
          <div className="mt-1 flex items-center gap-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {canCopy ? (
              <MessageAction
                label={copied ? "Copied message" : "Copy message"}
                onClick={() => void copyMessage()}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </MessageAction>
            ) : null}
            <MessageAction
              label="Good response"
              onClick={() => setFeedback((value) => (value === "good" ? null : "good"))}
              pressed={feedback === "good"}
            >
              <ThumbsUp size={15} />
            </MessageAction>
            <MessageAction
              label="Bad response"
              onClick={() => setFeedback((value) => (value === "bad" ? null : "bad"))}
              pressed={feedback === "bad"}
            >
              <ThumbsDown size={15} />
            </MessageAction>
            <MessageAction
              label={expanded ? "Collapse message" : "Expand message"}
              onClick={() => setExpanded((value) => !value)}
              pressed={expanded}
            >
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </MessageAction>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function MessageAction({
  children,
  label,
  onClick,
  pressed,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly pressed?: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition hover:bg-zinc-100 hover:text-zinc-700",
        pressed ? "bg-zinc-100 text-zinc-800" : "text-zinc-400",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
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
