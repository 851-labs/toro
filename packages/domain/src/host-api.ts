import type { AgentId, EnvironmentId, PermissionRequestId, SessionId, WorkspaceId } from "./ids";
import type { AgentProfile, EnvironmentProfile, ToroState, Workspace } from "./model";

export interface HostCatalog {
  readonly agents: readonly AgentProfile[];
  readonly environments: readonly EnvironmentProfile[];
}

export interface OpenWorkspaceRequest {
  readonly path: string;
  readonly environmentId: EnvironmentId;
}

export interface CreateSessionRequest {
  readonly workspaceId: WorkspaceId;
  readonly agentId: AgentId;
  readonly environmentId: EnvironmentId;
}

export interface SendMessageRequest {
  readonly content: string;
}

export interface PermissionDecisionRequest {
  readonly optionId: string;
}

export interface HostApi {
  listCatalog(): Promise<HostCatalog>;
  listWorkspaces(): Promise<readonly Workspace[]>;
  getState(): Promise<ToroState>;
  openWorkspace(request: OpenWorkspaceRequest): Promise<Workspace>;
  createSession(request: CreateSessionRequest): Promise<{ readonly sessionId: SessionId }>;
  sendUserMessage(sessionId: SessionId, request: SendMessageRequest): Promise<void>;
  respondToPermission(
    requestId: PermissionRequestId,
    request: PermissionDecisionRequest,
  ): Promise<void>;
  cancelSession(sessionId: SessionId): Promise<void>;
}
