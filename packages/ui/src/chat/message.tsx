import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "../cn";
import { CodexMarkdownMessage } from "./markdown-message";
import { CodexMessageAction } from "./message-action";

export interface CodexChatMessageProps {
  readonly children: ReactNode;
  readonly copyText?: string;
  readonly isStreaming?: boolean;
  readonly role: "assistant" | "system" | "user";
  readonly showActions?: boolean;
}

export function CodexChatMessage({
  children,
  copyText,
  isStreaming,
  role,
  showActions: showActionsProp,
}: CodexChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isUser = role === "user";
  const usesMarkdown = typeof children === "string";
  const canCopy = role === "assistant" && !isStreaming && copyText && copyText.length > 0;
  const showActions = showActionsProp ?? (role === "assistant" && !isStreaming);
  const renderedChildren = usesMarkdown ? (
    <CodexMarkdownMessage isStreaming={isStreaming}>{children}</CodexMarkdownMessage>
  ) : (
    children
  );

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
      data-chat-message-role={role}
    >
      <div
        className={cn(
          "flex flex-col",
          isUser
            ? "max-w-[82%] items-end"
            : expanded
              ? "max-w-[96%] items-start"
              : "max-w-[88%] items-start",
        )}
        data-chat-message-shell="true"
      >
        <div
          className={cn(
            "text-base leading-7",
            !usesMarkdown && "whitespace-pre-wrap",
            isUser
              ? "rounded-3xl bg-zinc-100 px-4 py-3 text-zinc-950 dark:bg-zinc-100 dark:text-zinc-950"
              : "py-2 text-zinc-900 dark:text-zinc-100",
          )}
        >
          {renderedChildren}
        </div>
        {showActions ? (
          <div className="mt-1 flex items-center gap-1 text-zinc-400">
            {canCopy ? (
              <CodexMessageAction
                label={copied ? "Copied message" : "Copy message"}
                onClick={() => void copyMessage()}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </CodexMessageAction>
            ) : null}
            <CodexMessageAction
              label={expanded ? "Collapse message" : "Expand message"}
              onClick={() => setExpanded((value) => !value)}
              pressed={expanded}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
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
