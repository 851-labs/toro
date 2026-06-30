import type { ChatMessage, PermissionRequest, PlanEntry, Session, ToolCall } from "@toro/domain";
import {
  CodexChatMessage,
  CodexComposer,
  CodexDisclosure,
  CodexPermissionCard,
  CodexToolCall,
  StatusBadge,
} from "@toro/ui";
import { ClipboardList, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
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

  async function submit() {
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
              {orderedMessages.map((message, index) => (
                <MessageBlock
                  isStreaming={
                    session.status === "running" &&
                    index === orderedMessages.length - 1 &&
                    message.role === "assistant"
                  }
                  key={message.id}
                  message={message}
                />
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

      <CodexComposer
        accessLabel="Full access"
        canSend={canSend}
        isRunning={session?.status === "running"}
        modelLabel="5.5 Medium"
        onChange={setValue}
        onStop={session ? () => void hostClient.cancelSession(session.id) : undefined}
        onSubmit={() => void submit()}
        placeholder={session?.messages.length ? "Ask for follow-up changes" : "Do anything"}
        value={value}
        workspaceLabel={
          workspaceName ? `${workspaceName} / Work locally` : "Open a project to start"
        }
      />
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

function MessageBlock({
  isStreaming,
  message,
}: {
  readonly isStreaming: boolean;
  readonly message: ChatMessage;
}) {
  return (
    <CodexChatMessage isStreaming={isStreaming} role={message.role}>
      {message.content}
    </CodexChatMessage>
  );
}

function PermissionCard({ request }: { readonly request: PermissionRequest }) {
  return (
    <CodexPermissionCard
      onRespond={(optionId) => void hostClient.respondToPermission(request.id, optionId)}
      options={request.options}
      title={request.toolCall.title}
    />
  );
}

function ToolCallCard({ toolCall }: { readonly toolCall: ToolCall }) {
  return (
    <CodexToolCall kind={toolCall.kind} status={toolCall.status} title={toolCall.title}>
      {toolCall.content.length > 0 ? toolCall.content.join("\n") : null}
    </CodexToolCall>
  );
}

function LogBlock({ logs }: { readonly logs: readonly string[] }) {
  return (
    <CodexDisclosure icon={<Terminal size={16} />} title="Activity logs">
      {logs.join("\n")}
    </CodexDisclosure>
  );
}

function planTone(status: PlanEntry["status"]) {
  if (status === "completed") return "good";
  if (status === "in_progress") return "warn";
  return "neutral";
}
