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
  CodexEmptyState,
  CodexMarkdownMessage,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexStarterCards,
  CodexThinkingDisclosure,
  CodexToolCall,
  CodexToolCallGroup,
  CodexTranscriptSurface,
} from "@toro/ui";
import { useMemo, useState } from "react";
import { hostClient } from "../lib/host-client";

type TranscriptItem =
  | {
      readonly at: string;
      readonly kind: "message";
      readonly message: ChatMessage;
      readonly toolCalls: readonly ToolCall[];
    }
  | { readonly at: string; readonly kind: "permission"; readonly request: PermissionRequest }
  | { readonly at: string; readonly kind: "thought"; readonly thought: ThoughtEntry }
  | { readonly at: string; readonly kind: "tool-group"; readonly toolCalls: readonly ToolCall[] };

interface ChatPanelProps {
  readonly session: Session | null;
  readonly workspace: Workspace | null;
}

export function ChatPanel({ session, workspace }: ChatPanelProps) {
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
  const sessionIsEmpty = Boolean(session && transcript.length === 0 && session.plan.length === 0);
  const projectEmpty = Boolean(workspace && (!session || sessionIsEmpty));
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
    <section className="grid min-h-0 min-w-0 grid-rows-[1fr_auto] bg-white dark:bg-[#101010]">
      <div className="min-h-0 overflow-auto px-6 py-8">
        <CodexTranscriptSurface className={projectEmpty ? "h-full justify-end pb-16" : undefined}>
          {session ? (
            sessionIsEmpty ? (
              <CodexEmptyState
                placement={projectEmpty ? "composer" : "center"}
                workspaceName={workspaceName}
              />
            ) : (
              <>
                <CodexPlanDisclosure entries={session.plan} />
                {transcript.map((item) => (
                  <TranscriptBlock item={item} key={`${item.kind}:${item.at}:${itemId(item)}`} />
                ))}
              </>
            )
          ) : (
            <CodexEmptyState
              placement={projectEmpty ? "composer" : "center"}
              workspaceName={workspaceName}
            />
          )}
        </CodexTranscriptSurface>
      </div>

      <CodexComposer
        accessLabel="Full access"
        canSend={canSend}
        contextStrip={
          projectEmpty && workspace
            ? {
                branchLabel: "main",
                environmentLabel: "Work locally",
                projectLabel: workspace.name,
              }
            : undefined
        }
        contextItems={contextItems}
        isRunning={session?.status === "running"}
        lifted={projectEmpty}
        modelLabel="5.5 Medium"
        onChange={setValue}
        onStop={session ? () => void hostClient.cancelSession(session.id) : undefined}
        onSubmit={() => void submit()}
        placeholder={session?.messages.length ? "Ask for follow-up changes" : "Do anything"}
        value={value}
      >
        {projectEmpty ? <CodexStarterCards className="mt-10" /> : null}
      </CodexComposer>
    </section>
  );
}

function transcriptItems(session: Session | null): readonly TranscriptItem[] {
  if (!session) {
    return [];
  }

  const assignedToolIds = new Set<string>();
  const messages = session.messages.toSorted(compareCreatedAt);
  const messageItems = messages.map((message, index): TranscriptItem => {
    const previousMessage = messages[index - 1];
    const toolCalls =
      message.role === "assistant"
        ? session.toolCalls.filter((toolCall) => {
            const afterPreviousMessage =
              !previousMessage || toolCall.createdAt >= previousMessage.createdAt;
            return afterPreviousMessage && toolCall.createdAt <= message.createdAt;
          })
        : [];

    for (const toolCall of toolCalls) {
      assignedToolIds.add(toolCall.id);
    }

    return {
      at: message.createdAt,
      kind: "message",
      message,
      toolCalls,
    };
  });
  const unassignedToolCalls = session.toolCalls.filter(
    (toolCall) => !assignedToolIds.has(toolCall.id),
  );

  return [
    ...messageItems,
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
    ...(unassignedToolCalls.length > 0
      ? [
          {
            at: unassignedToolCalls[0]?.createdAt ?? "",
            kind: "tool-group" as const,
            toolCalls: unassignedToolCalls,
          },
        ]
      : []),
  ].toSorted(compareTranscriptItems);
}

function compareTranscriptItems(a: TranscriptItem, b: TranscriptItem) {
  return a.at.localeCompare(b.at) || transcriptRank(a.kind) - transcriptRank(b.kind);
}

function transcriptRank(kind: TranscriptItem["kind"]) {
  return ["message", "thought", "permission", "tool-group"].indexOf(kind);
}

function itemId(item: TranscriptItem) {
  if (item.kind === "message") return item.message.id;
  if (item.kind === "thought") return item.thought.id;
  if (item.kind === "permission") return item.request.id;
  return item.toolCalls.map((toolCall) => toolCall.id).join(":");
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

function MessageBlock({
  message,
  toolCalls,
}: {
  readonly message: ChatMessage;
  readonly toolCalls: readonly ToolCall[];
}) {
  const isAssistantWithTools = message.role === "assistant" && toolCalls.length > 0;

  return (
    <CodexChatMessage
      copyText={message.role === "assistant" ? message.content : undefined}
      isStreaming={message.status === "streaming"}
      role={message.role}
    >
      {isAssistantWithTools ? (
        <AssistantMessageContent
          content={message.content}
          isStreaming={message.status === "streaming"}
          toolCalls={toolCalls}
        />
      ) : (
        message.content
      )}
    </CodexChatMessage>
  );
}

function TranscriptBlock({ item }: { readonly item: TranscriptItem }) {
  if (item.kind === "message") {
    return <MessageBlock message={item.message} toolCalls={item.toolCalls} />;
  }
  if (item.kind === "thought") {
    return <ThoughtBlock thought={item.thought} />;
  }
  if (item.kind === "permission") {
    return <PermissionCard request={item.request} />;
  }
  return <ToolCallGroupBlock toolCalls={item.toolCalls} />;
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

function AssistantMessageContent({
  content,
  isStreaming,
  toolCalls,
}: {
  readonly content: string;
  readonly isStreaming: boolean;
  readonly toolCalls: readonly ToolCall[];
}) {
  return (
    <div className="space-y-3" data-message-tool-block="true">
      <ToolCallCluster toolCalls={toolCalls} />
      <CodexMarkdownMessage isStreaming={isStreaming}>{content}</CodexMarkdownMessage>
    </div>
  );
}

function ToolCallGroupBlock({ toolCalls }: { readonly toolCalls: readonly ToolCall[] }) {
  return (
    <CodexChatMessage role="assistant" showActions={false}>
      <ToolCallCluster toolCalls={toolCalls} />
    </CodexChatMessage>
  );
}

function ToolCallCluster({ toolCalls }: { readonly toolCalls: readonly ToolCall[] }) {
  if (toolCalls.length === 0) {
    return null;
  }

  if (toolCalls.length === 1) {
    return <ToolCallCard toolCall={toolCalls[0]!} />;
  }

  const completedCount = toolCalls.filter((toolCall) => toolCall.status === "completed").length;
  const hasActiveTool = toolCalls.some((toolCall) => toolCall.status !== "completed");

  return (
    <CodexToolCallGroup
      completedCount={completedCount}
      count={toolCalls.length}
      defaultOpen={hasActiveTool}
    >
      {toolCalls.map((toolCall) => (
        <ToolCallCard key={toolCall.id} toolCall={toolCall} />
      ))}
    </CodexToolCallGroup>
  );
}

function compareCreatedAt(a: { readonly createdAt: string }, b: { readonly createdAt: string }) {
  return a.createdAt.localeCompare(b.createdAt);
}
