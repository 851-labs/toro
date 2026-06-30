import type {
  AgentId,
  EnvironmentId,
  MessageId,
  PermissionRequestId,
  SessionId,
  WorkspaceId,
} from "./ids";
import type {
  AgentProfile,
  ChatMessage,
  EnvironmentProfile,
  PermissionOption,
  PlanEntry,
  SessionStatus,
  ToolCall,
  Workspace,
} from "./model";

export type HostEvent =
  | {
      readonly type: "catalog_loaded";
      readonly agents: readonly AgentProfile[];
      readonly environments: readonly EnvironmentProfile[];
    }
  | { readonly type: "workspace_opened"; readonly workspace: Workspace }
  | {
      readonly type: "session_created";
      readonly sessionId: SessionId;
      readonly workspaceId: WorkspaceId;
      readonly agentId: AgentId;
      readonly environmentId: EnvironmentId;
      readonly title: string;
      readonly createdAt: string;
    }
  | {
      readonly type: "session_status_changed";
      readonly sessionId: SessionId;
      readonly status: SessionStatus;
      readonly at: string;
    }
  | { readonly type: "message_appended"; readonly message: ChatMessage }
  | {
      readonly type: "message_delta";
      readonly sessionId: SessionId;
      readonly messageId: MessageId;
      readonly role: "assistant" | "user";
      readonly delta: string;
      readonly at: string;
    }
  | {
      readonly type: "message_completed";
      readonly sessionId: SessionId;
      readonly messageId: MessageId;
      readonly at: string;
    }
  | { readonly type: "tool_call_updated"; readonly toolCall: ToolCall }
  | {
      readonly type: "plan_updated";
      readonly sessionId: SessionId;
      readonly entries: readonly PlanEntry[];
    }
  | {
      readonly type: "permission_requested";
      readonly requestId: PermissionRequestId;
      readonly toolCall: ToolCall;
      readonly options: readonly PermissionOption[];
      readonly at: string;
    }
  | {
      readonly type: "permission_resolved";
      readonly sessionId: SessionId;
      readonly requestId: PermissionRequestId;
    }
  | {
      readonly type: "session_log";
      readonly sessionId: SessionId;
      readonly line: string;
      readonly at: string;
    }
  | {
      readonly type: "session_failed";
      readonly sessionId: SessionId;
      readonly message: string;
      readonly at: string;
    };

export interface CreateSessionInput {
  readonly workspaceId: WorkspaceId;
  readonly agentId: AgentId;
  readonly environmentId: EnvironmentId;
}

export interface SendUserMessageInput {
  readonly sessionId: SessionId;
  readonly content: string;
}

export interface PermissionDecisionInput {
  readonly requestId: PermissionRequestId;
  readonly optionId: string;
}
