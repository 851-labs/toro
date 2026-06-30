import type { ChatMessage, PermissionRequest, PlanEntry, Session, ToolCall } from "@toro/domain";
import { Button, StatusBadge, cn } from "@toro/ui";
import {
  Check,
  ClipboardList,
  Send,
  Shield,
  Square,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { hostClient } from "../lib/host-client";

interface ChatPanelProps {
  readonly agentName: string;
  readonly session: Session | null;
  readonly workspaceName: string | null;
}

export function ChatPanel({ agentName, session, workspaceName }: ChatPanelProps) {
  const [value, setValue] = useState("");
  const canSend = Boolean(
    session &&
    value.trim().length > 0 &&
    session.status !== "running" &&
    session.status !== "connecting",
  );
  const orderedMessages = useMemo(() => session?.messages ?? [], [session]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session || !canSend) {
      return;
    }
    const content = value.trim();
    setValue("");
    await hostClient.sendUserMessage(session.id, content);
  }

  return (
    <section className="grid min-h-0 min-w-0 grid-rows-[1fr_auto] bg-white">
      <div className="min-h-0 overflow-auto px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {session ? (
            <>
              <PlanBlock entries={session.plan} />
              {orderedMessages.map((message) => (
                <MessageBlock key={message.id} message={message} />
              ))}
              {session.permissions.map((request) => (
                <PermissionCard key={request.id} request={request} />
              ))}
              {session.toolCalls.map((toolCall) => (
                <ToolCallCard key={toolCall.id} toolCall={toolCall} />
              ))}
              {session.logs.length > 0 ? <LogBlock logs={session.logs} /> : null}
            </>
          ) : (
            <EmptyState agentName={agentName} workspaceName={workspaceName} />
          )}
        </div>
      </div>

      <form className="px-6 pb-6" onSubmit={submit}>
        <div className="mx-auto max-w-3xl rounded-[22px] border border-zinc-200 bg-white p-3 shadow-[0_14px_50px_rgba(15,23,42,0.12)]">
          <textarea
            aria-label="Message agent"
            className="max-h-48 min-h-20 w-full resize-none bg-transparent px-2 py-2 text-base leading-6 text-zinc-950 outline-none placeholder:text-zinc-300"
            onChange={(event) => setValue(event.target.value)}
            placeholder={session?.messages.length ? "Ask for follow-up changes" : "Do anything"}
            value={value}
          />
          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
            <div className="flex min-w-0 items-center gap-3 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1 px-2 py-1 font-medium text-orange-600">
                <Shield size={16} />
                Full access
              </span>
              <span className="hidden truncate sm:inline">
                {workspaceName ? `${workspaceName} / Work locally` : "Open a project to start"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="hidden items-center gap-1 font-medium sm:inline-flex">
                  <Zap size={15} />
                  5.5 Medium
                </span>
              {session?.status === "running" ? (
                <Button
                  aria-label="Stop"
                  className="size-9 rounded-full p-0"
                  icon={<Square size={15} />}
                  onClick={() => void hostClient.cancelSession(session.id)}
                  type="button"
                  variant="danger"
                />
              ) : (
                <Button
                  aria-label="Send"
                  className="size-9 rounded-full bg-zinc-500 p-0 hover:bg-zinc-700"
                  disabled={!canSend}
                  icon={<Send size={16} />}
                  type="submit"
                  variant="primary"
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

function EmptyState({
  agentName,
  workspaceName,
}: {
  readonly agentName: string;
  readonly workspaceName: string | null;
}) {
  return (
    <div className="flex min-h-[44vh] flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-medium tracking-tight">
        What should we build{workspaceName ? ` in ${workspaceName}` : ""}?
      </h2>
      <p className="mt-3 max-w-md text-base leading-7 text-zinc-400">
        {workspaceName ? `${agentName} is ready.` : "Open a project, then start a new chat."}
      </p>
    </div>
  );
}

function PlanBlock({ entries }: { readonly entries: readonly PlanEntry[] }) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <details className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-900">
        <ClipboardList size={16} />
        Plan
      </summary>
      <ol className="space-y-2">
        {entries.map((entry, index) => (
          <li className="flex items-center gap-3 text-sm" key={`${entry.content}-${index}`}>
            <StatusBadge label={entry.status} tone={planTone(entry.status)} />
            <span className="min-w-0 flex-1 text-zinc-700">{entry.content}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function MessageBlock({ message }: { readonly message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <article className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] text-base leading-7",
          isUser
            ? "rounded-3xl bg-zinc-100 px-4 py-3 text-zinc-950"
            : "max-w-[72%] py-2 text-zinc-900",
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </article>
  );
}

function PermissionCard({ request }: { readonly request: PermissionRequest }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-950">
        <Shield size={16} />
        {request.toolCall.title}
      </div>
      <div className="flex flex-wrap gap-2">
        {request.options.map((option) => (
          <Button
            icon={option.kind.startsWith("allow") ? <Check size={14} /> : <X size={14} />}
            key={option.id}
            onClick={() => void hostClient.respondToPermission(request.id, option.id)}
            variant={option.kind.startsWith("allow") ? "primary" : "danger"}
          >
            {option.name}
          </Button>
        ))}
      </div>
    </section>
  );
}

function ToolCallCard({ toolCall }: { readonly toolCall: ToolCall }) {
  return (
    <details className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <summary className="flex cursor-pointer items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-zinc-900">{toolCall.title}</div>
          <div className="text-xs text-zinc-500">{toolCall.kind}</div>
        </div>
        <StatusBadge label={toolCall.status} tone={toolTone(toolCall.status)} />
      </summary>
      {toolCall.content.length > 0 ? (
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white p-3 text-xs leading-5 text-zinc-600">
          {toolCall.content.join("\n")}
        </pre>
      ) : null}
    </details>
  );
}

function LogBlock({ logs }: { readonly logs: readonly string[] }) {
  return (
    <details className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
      <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-900">
        <Terminal size={16} />
        Activity logs
      </summary>
      <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap text-xs leading-5 text-zinc-500">
        {logs.join("\n")}
      </pre>
    </details>
  );
}

function planTone(status: PlanEntry["status"]) {
  if (status === "completed") return "good";
  if (status === "in_progress") return "warn";
  return "neutral";
}

function toolTone(status: ToolCall["status"]) {
  if (status === "completed") return "good";
  if (status === "failed") return "bad";
  return "warn";
}
