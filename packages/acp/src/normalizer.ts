import type {
  ContentBlock,
  PermissionOption as AcpPermissionOption,
  PlanEntry as AcpPlanEntry,
  RequestPermissionRequest,
  SessionNotification,
  ToolCall as AcpToolCall,
  ToolCallUpdate,
} from "@agentclientprotocol/sdk";
import { messageId, permissionRequestId, toolCallId } from "@toro/domain";
import type { HostEvent, PermissionOption, PlanEntry, SessionId, ToolCall } from "@toro/domain";

export class AcpEventNormalizer {
  private readonly openMessages = new Set<string>();
  private readonly openThoughts = new Set<string>();
  private readonly toolCalls = new Map<string, ToolCall>();

  constructor(private readonly sessionId: SessionId) {}

  normalizeSessionUpdate(notification: SessionNotification): readonly HostEvent[] {
    const at = new Date().toISOString();
    const update = notification.update;

    switch (update.sessionUpdate) {
      case "agent_message_chunk":
        return [
          this.messageDelta("assistant", update.messageId, textFromContent(update.content), at),
        ];
      case "user_message_chunk":
        return [this.messageDelta("user", update.messageId, textFromContent(update.content), at)];
      case "agent_thought_chunk":
        return [this.thoughtDelta(update.messageId, textFromContent(update.content), at)];
      case "tool_call":
        return [this.toolCallUpdated(update, at)];
      case "tool_call_update":
        return [this.toolCallUpdated(update, at)];
      case "plan":
        return [
          {
            entries: update.entries.map(planEntryFromAcp),
            sessionId: this.sessionId,
            type: "plan_updated",
          },
        ];
      case "plan_update":
        return this.planUpdate(update.plan);
      case "plan_removed":
        return [{ entries: [], sessionId: this.sessionId, type: "plan_updated" }];
      case "usage_update":
      case "available_commands_update":
      case "config_option_update":
      case "current_mode_update":
      case "session_info_update":
        return [
          {
            at,
            line: `ACP update: ${update.sessionUpdate}`,
            sessionId: this.sessionId,
            type: "session_log",
          },
        ];
    }
  }

  normalizePermission(params: RequestPermissionRequest, requestId: string): HostEvent {
    const at = new Date().toISOString();
    return {
      at,
      options: params.options.map(permissionOptionFromAcp),
      requestId: permissionRequestId(requestId),
      toolCall: this.toolCallFromUpdate(params.toolCall, at),
      type: "permission_requested",
    };
  }

  completeOpenMessages(at: string): readonly HostEvent[] {
    const messageEvents = [...this.openMessages].map(
      (id): HostEvent => ({
        at,
        messageId: messageId(id),
        sessionId: this.sessionId,
        type: "message_completed",
      }),
    );
    const thoughtEvents = [...this.openThoughts].map(
      (id): HostEvent => ({
        at,
        sessionId: this.sessionId,
        thoughtId: messageId(id),
        type: "thought_completed",
      }),
    );
    this.openMessages.clear();
    this.openThoughts.clear();
    return [...messageEvents, ...thoughtEvents];
  }

  private messageDelta(
    role: "assistant" | "user",
    acpMessageId: string | null | undefined,
    delta: string,
    at: string,
  ): HostEvent {
    const stableId = acpMessageId ?? `${role}-stream`;
    const id = `${this.sessionId}:${role}:${stableId}`;
    this.openMessages.add(id);
    return {
      at,
      delta,
      messageId: messageId(id),
      role,
      sessionId: this.sessionId,
      type: "message_delta",
    };
  }

  private thoughtDelta(
    acpMessageId: string | null | undefined,
    delta: string,
    at: string,
  ): HostEvent {
    const stableId = acpMessageId ?? "thought-stream";
    const id = `${this.sessionId}:thought:${stableId}`;
    this.openThoughts.add(id);
    return {
      at,
      delta,
      sessionId: this.sessionId,
      thoughtId: messageId(id),
      type: "thought_delta",
    };
  }

  private toolCallUpdated(update: AcpToolCall | ToolCallUpdate, at: string): HostEvent {
    return { toolCall: this.toolCallFromUpdate(update, at), type: "tool_call_updated" };
  }

  private toolCallFromUpdate(update: AcpToolCall | ToolCallUpdate, at: string): ToolCall {
    const previous = this.toolCalls.get(update.toolCallId);
    const next: ToolCall = {
      content:
        "content" in update && update.content
          ? update.content.map(toolContentToText)
          : (previous?.content ?? []),
      id: toolCallId(update.toolCallId),
      kind: update.kind ?? previous?.kind ?? "other",
      sessionId: this.sessionId,
      status: update.status ?? previous?.status ?? "pending",
      title: update.title ?? previous?.title ?? "Tool call",
      updatedAt: at,
    };
    this.toolCalls.set(update.toolCallId, next);
    return next;
  }

  private planUpdate(plan: {
    readonly type: string;
    readonly entries?: readonly AcpPlanEntry[];
    readonly content?: string;
  }): readonly HostEvent[] {
    if (plan.type === "items" && plan.entries) {
      return [
        {
          entries: plan.entries.map(planEntryFromAcp),
          sessionId: this.sessionId,
          type: "plan_updated",
        },
      ];
    }
    if (plan.type === "markdown" && plan.content) {
      return [
        {
          entries: [{ content: plan.content, priority: "medium", status: "in_progress" }],
          sessionId: this.sessionId,
          type: "plan_updated",
        },
      ];
    }
    return [
      {
        at: new Date().toISOString(),
        line: `Unsupported plan update: ${plan.type}`,
        sessionId: this.sessionId,
        type: "session_log",
      },
    ];
  }
}

function textFromContent(content: ContentBlock): string {
  if (content.type === "text") {
    return content.text;
  }
  if (content.type === "resource_link") {
    return content.uri;
  }
  return `[${content.type}]`;
}

function toolContentToText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (typeof content !== "object" || content === null) {
    return JSON.stringify(content);
  }
  if ("type" in content && content.type === "content" && "content" in content) {
    return contentBlockToText(content.content);
  }
  if ("type" in content && content.type === "diff") {
    return diffContentToText(content);
  }
  if ("type" in content && content.type === "terminal" && "terminalId" in content) {
    return `Terminal ${String(content.terminalId)}`;
  }
  return JSON.stringify(content);
}

function contentBlockToText(content: unknown): string {
  if (typeof content !== "object" || content === null) {
    return String(content);
  }
  if ("type" in content && content.type === "text" && "text" in content) {
    return String(content.text);
  }
  if ("type" in content && content.type === "resource_link" && "uri" in content) {
    return String(content.uri);
  }
  if ("type" in content && content.type === "resource" && "resource" in content) {
    return embeddedResourceToText(content.resource);
  }
  return JSON.stringify(content);
}

function embeddedResourceToText(resource: unknown): string {
  if (typeof resource === "object" && resource !== null && "text" in resource) {
    return String(resource.text);
  }
  if (typeof resource === "object" && resource !== null && "uri" in resource) {
    return String(resource.uri);
  }
  return JSON.stringify(resource);
}

function diffContentToText(content: object): string {
  const path = objectFieldToText(content, "path") ?? "unknown";
  const oldText = objectFieldToText(content, "oldText") ?? "";
  const newText = objectFieldToText(content, "newText") ?? "";
  return [`--- ${path}`, oldText, `+++ ${path}`, newText].filter(Boolean).join("\n");
}

function objectFieldToText(content: object, key: string): string | null {
  if (!(key in content)) {
    return null;
  }
  const value = (content as Record<string, unknown>)[key];
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

function planEntryFromAcp(entry: AcpPlanEntry): PlanEntry {
  return { content: entry.content, priority: entry.priority, status: entry.status };
}

function permissionOptionFromAcp(option: AcpPermissionOption): PermissionOption {
  return { id: option.optionId, kind: option.kind, name: option.name };
}
