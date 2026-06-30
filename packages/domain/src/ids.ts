type Brand<Name extends string> = string & { readonly __brand: Name };

export type AgentId = Brand<"AgentId">;
export type EnvironmentId = Brand<"EnvironmentId">;
export type MessageId = Brand<"MessageId">;
export type PermissionRequestId = Brand<"PermissionRequestId">;
export type SessionId = Brand<"SessionId">;
export type ToolCallId = Brand<"ToolCallId">;
export type WorkspaceId = Brand<"WorkspaceId">;

export function agentId(value: string): AgentId {
  return value as AgentId;
}

export function environmentId(value: string): EnvironmentId {
  return value as EnvironmentId;
}

export function messageId(value: string): MessageId {
  return value as MessageId;
}

export function permissionRequestId(value: string): PermissionRequestId {
  return value as PermissionRequestId;
}

export function sessionId(value: string): SessionId {
  return value as SessionId;
}

export function toolCallId(value: string): ToolCallId {
  return value as ToolCallId;
}

export function workspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}
