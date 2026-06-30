import { useQuery } from "@tanstack/react-query";
import type {
  ChatMessage,
  PermissionRequest,
  Session,
  ThoughtEntry,
  ToolCall,
  Workspace,
} from "@toro/domain";
import type { FileTreeEntry } from "@toro/environments";
import {
  CodexChatMessage,
  CodexComposer,
  type CodexComposerContextItem,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexThinkingDisclosure,
  CodexToolCall,
} from "@toro/ui";
import { useMemo, useState } from "react";
import { hostClient } from "../lib/host-client";

type TranscriptItem =
  | { readonly at: string; readonly kind: "message"; readonly message: ChatMessage }
  | { readonly at: string; readonly kind: "permission"; readonly request: PermissionRequest }
  | { readonly at: string; readonly kind: "thought"; readonly thought: ThoughtEntry }
  | { readonly at: string; readonly kind: "tool"; readonly toolCall: ToolCall };

interface ChatPanelProps {
  readonly agentName: string;
  readonly session: Session | null;
  readonly workspace: Workspace | null;
}

export function ChatPanel({ agentName, session, workspace }: ChatPanelProps) {
  const [value, setValue] = useState("");
  const files = useQuery({
    enabled: Boolean(workspace),
    queryFn: () => hostClient.listFiles(workspace!.id),
    queryKey: ["composer-files", workspace?.id],
  });
  const canSend = Boolean(
    session &&
    value.trim().length > 0 &&
    session.status !== "running" &&
    session.status !== "connecting",
  );
  const transcript = useMemo(() => transcriptItems(session), [session]);
  const workspaceName = workspace?.name ?? null;
  const contextItems = useMemo(() => fileContextItems(files.data ?? []), [files.data]);

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
        <div className="mx-auto flex max-w-[960px] flex-col gap-5" data-transcript-surface="true">
          {session ? (
            <>
              <CodexPlanDisclosure entries={session.plan} />
              {transcript.map((item) => (
                <TranscriptBlock item={item} key={`${item.kind}:${item.at}:${itemId(item)}`} />
              ))}
            </>
          ) : (
            <EmptyState agentName={agentName} workspaceName={workspaceName} />
          )}
        </div>
      </div>

      <CodexComposer
        accessLabel="Full access"
        canSend={canSend}
        contextItems={contextItems}
        isRunning={session?.status === "running"}
        modelLabel="5.5 Medium"
        onChange={setValue}
        onStop={session ? () => void hostClient.cancelSession(session.id) : undefined}
        onSubmit={() => void submit()}
        placeholder={session?.messages.length ? "Ask for follow-up changes" : "Do anything"}
        value={value}
      />
    </section>
  );
}

function transcriptItems(session: Session | null): readonly TranscriptItem[] {
  if (!session) {
    return [];
  }

  return [
    ...session.messages.map(
      (message): TranscriptItem => ({
        at: message.createdAt,
        kind: "message",
        message,
      }),
    ),
    ...session.thoughts.map(
      (thought): TranscriptItem => ({
        at: thought.createdAt,
        kind: "thought",
        thought,
      }),
    ),
    ...session.permissions.map(
      (request): TranscriptItem => ({
        at: request.createdAt,
        kind: "permission",
        request,
      }),
    ),
    ...session.toolCalls.map(
      (toolCall): TranscriptItem => ({
        at: toolCall.createdAt,
        kind: "tool",
        toolCall,
      }),
    ),
  ].toSorted(compareTranscriptItems);
}

function compareTranscriptItems(a: TranscriptItem, b: TranscriptItem) {
  return a.at.localeCompare(b.at) || transcriptRank(a.kind) - transcriptRank(b.kind);
}

function transcriptRank(kind: TranscriptItem["kind"]) {
  return ["message", "thought", "permission", "tool"].indexOf(kind);
}

function itemId(item: TranscriptItem) {
  if (item.kind === "message") return item.message.id;
  if (item.kind === "thought") return item.thought.id;
  if (item.kind === "permission") return item.request.id;
  return item.toolCall.id;
}

function fileContextItems(entries: readonly FileTreeEntry[]): readonly CodexComposerContextItem[] {
  return flattenFileEntries(entries)
    .toSorted(compareContextEntries)
    .slice(0, 8)
    .map((entry) => ({
      detail: entry.path,
      id: entry.path,
      label: entry.name,
    }));
}

function flattenFileEntries(entries: readonly FileTreeEntry[]): readonly FileTreeEntry[] {
  return entries.flatMap((entry) => {
    if (entry.kind === "file") {
      return [entry];
    }
    return flattenFileEntries(entry.children ?? []);
  });
}

function compareContextEntries(a: FileTreeEntry, b: FileTreeEntry) {
  return contextPriority(a.path) - contextPriority(b.path) || a.path.localeCompare(b.path);
}

function contextPriority(path: string) {
  if (path.includes("/.repos/") || path.startsWith(".repos/")) {
    return 1;
  }
  return 0;
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

function ThoughtBlock({ thought }: { readonly thought: ThoughtEntry }) {
  return (
    <CodexThinkingDisclosure
      defaultOpen={thought.status === "streaming"}
      isStreaming={thought.status === "streaming"}
    >
      {thought.content}
    </CodexThinkingDisclosure>
  );
}

function MessageBlock({ message }: { readonly message: ChatMessage }) {
  return (
    <CodexChatMessage
      copyText={message.role === "assistant" ? message.content : undefined}
      isStreaming={message.status === "streaming"}
      role={message.role}
    >
      {message.content}
    </CodexChatMessage>
  );
}

function TranscriptBlock({ item }: { readonly item: TranscriptItem }) {
  if (item.kind === "message") {
    return <MessageBlock message={item.message} />;
  }
  if (item.kind === "thought") {
    return <ThoughtBlock thought={item.thought} />;
  }
  if (item.kind === "permission") {
    return <PermissionCard request={item.request} />;
  }
  return <ToolCallCard toolCall={item.toolCall} />;
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
