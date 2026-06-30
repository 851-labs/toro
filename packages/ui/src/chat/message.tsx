import type { ReactNode } from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../cn";

export interface CodexChatMessageProps {
  readonly children: ReactNode;
  readonly copyText?: string;
  readonly isStreaming?: boolean;
  readonly role: "assistant" | "system" | "user";
}

export function CodexChatMessage({ children, copyText, isStreaming, role }: CodexChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const canCopy = role === "assistant" && !isStreaming && copyText && copyText.length > 0;

  async function copyMessage() {
    if (!copyText) {
      return;
    }
    await writeClipboard(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <article className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex flex-col",
          isUser ? "max-w-[82%] items-end" : "max-w-[72%] items-start",
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
        {canCopy ? (
          <button
            aria-label={copied ? "Copied message" : "Copy message"}
            className="mt-1 flex size-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            onClick={() => void copyMessage()}
            type="button"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
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
