import type {
  AgentId,
  EnvironmentId,
  MessageId,
  PermissionRequestId,
  SessionId,
  ToolCallId,
  WorkspaceId,
} from "./ids";

export type AgentVendor = "codex" | "claude" | "opencode" | "toro-demo";

export interface CommandProfile {
  readonly command: string;
  readonly args: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
}

export type AgentTransport =
  | { readonly kind: "stdio" }
  | { readonly kind: "http"; readonly url: string };

export interface AgentProfile {
  readonly id: AgentId;
  readonly name: string;
  readonly vendor: AgentVendor;
  readonly description: string;
  readonly command: CommandProfile;
  readonly transport: AgentTransport;
  readonly authHint: string;
  readonly enabled: boolean;
}

export type EnvironmentKind = "local-desktop" | "remote-sandbox";
export type EnvironmentStatus = "available" | "unavailable" | "checking";

export interface EnvironmentProfile {
  readonly id: EnvironmentId;
  readonly name: string;
  readonly kind: EnvironmentKind;
  readonly description: string;
  readonly status: EnvironmentStatus;
}

export interface Workspace {
  readonly id: WorkspaceId;
  readonly name: string;
  readonly path: string;
  readonly environmentId: EnvironmentId;
}

export type SessionStatus =
  | "idle"
  | "connecting"
  | "running"
  | "waiting"
  | "failed"
  | "completed"
  | "cancelled";
export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "streaming" | "complete" | "failed";

export interface ChatMessage {
  readonly id: MessageId;
  readonly sessionId: SessionId;
  readonly role: MessageRole;
  readonly content: string;
  readonly createdAt: string;
  readonly status: MessageStatus;
}

export interface ThoughtEntry {
  readonly id: MessageId;
  readonly sessionId: SessionId;
  readonly content: string;
  readonly createdAt: string;
  readonly status: MessageStatus;
}

export type ToolKind =
  | "read"
  | "edit"
  | "delete"
  | "move"
  | "search"
  | "execute"
  | "think"
  | "fetch"
  | "switch_mode"
  | "other";

export type ToolStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ToolCall {
  readonly id: ToolCallId;
  readonly sessionId: SessionId;
  readonly title: string;
  readonly kind: ToolKind;
  readonly status: ToolStatus;
  readonly content: readonly string[];
  readonly updatedAt: string;
}

export interface PlanEntry {
  readonly content: string;
  readonly priority: "high" | "medium" | "low";
  readonly status: "pending" | "in_progress" | "completed";
}

export interface PermissionOption {
  readonly id: string;
  readonly name: string;
  readonly kind: "allow_once" | "allow_always" | "reject_once" | "reject_always";
}

export interface PermissionRequest {
  readonly id: PermissionRequestId;
  readonly sessionId: SessionId;
  readonly toolCall: ToolCall;
  readonly options: readonly PermissionOption[];
  readonly createdAt: string;
}

export interface Session {
  readonly id: SessionId;
  readonly workspaceId: WorkspaceId;
  readonly agentId: AgentId;
  readonly environmentId: EnvironmentId;
  readonly title: string;
  readonly status: SessionStatus;
  readonly messages: readonly ChatMessage[];
  readonly thoughts: readonly ThoughtEntry[];
  readonly toolCalls: readonly ToolCall[];
  readonly plan: readonly PlanEntry[];
  readonly permissions: readonly PermissionRequest[];
  readonly logs: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ToroState {
  readonly agents: readonly AgentProfile[];
  readonly environments: readonly EnvironmentProfile[];
  readonly workspaces: readonly Workspace[];
  readonly sessions: readonly Session[];
  readonly activeSessionId: SessionId | null;
}
