import { spawn } from "node:child_process";
import { AcpAgentSession } from "@toro/acp";
import { agentPresets, environmentPresets } from "@toro/config";
import {
  applyHostEvent,
  emptyToroState,
  environmentId,
  messageId,
  sessionId,
  workspaceId,
  type AgentId,
  type EnvironmentId,
  type ExternalOpenTarget,
  type HostCatalog,
  type HostEvent,
  type PermissionRequestId,
  type SessionId,
  type ToroState,
  type Workspace,
  type WorkspaceId,
} from "@toro/domain";
import { EnvironmentRegistry } from "@toro/environments";
import type { FileTreeEntry } from "@toro/environments";

type Listener = (event: HostEvent) => void;
type ExternalLauncher = (command: string, args: readonly string[]) => void;

interface HostRuntimeOptions {
  readonly launchExternal?: ExternalLauncher;
}

export class HostRuntime {
  private readonly environments = new EnvironmentRegistry();
  private readonly launchExternal: ExternalLauncher;
  private readonly listeners = new Set<Listener>();
  private readonly sessions = new Map<SessionId, AcpAgentSession>();
  private state: ToroState = applyHostEvent(emptyToroState, {
    agents: agentPresets,
    environments: environmentPresets,
    type: "catalog_loaded",
  });

  constructor(options: HostRuntimeOptions = {}) {
    this.launchExternal = options.launchExternal ?? launchExternalProcess;
  }

  listCatalog(): HostCatalog {
    return { agents: this.state.agents, environments: this.state.environments };
  }

  listWorkspaces(): readonly Workspace[] {
    return this.state.workspaces;
  }

  getState(): ToroState {
    return this.state;
  }

  async openWorkspace(
    path: string,
    targetEnvironmentId = environmentId("local-desktop"),
  ): Promise<Workspace> {
    const provider = this.environments.get(targetEnvironmentId);
    const workspace = await provider.openWorkspace({
      environmentId: targetEnvironmentId,
      id: workspaceId(`workspace-${crypto.randomUUID()}`),
      path,
    });
    const existingWorkspace = this.state.workspaces.find(
      (candidate) =>
        candidate.environmentId === workspace.environmentId && candidate.path === workspace.path,
    );
    if (existingWorkspace) {
      return existingWorkspace;
    }
    this.publish({ type: "workspace_opened", workspace });
    return workspace;
  }

  async listFiles(id: WorkspaceId): Promise<readonly FileTreeEntry[]> {
    const workspace = this.requireWorkspace(id);
    return this.environments.get(workspace.environmentId).listFiles(workspace);
  }

  async readTextFile(workspaceIdValue: WorkspaceId, path: string): Promise<string> {
    const workspace = this.requireWorkspace(workspaceIdValue);
    return this.environments.get(workspace.environmentId).readTextFile(workspace, path);
  }

  openWorkspaceExternal(workspaceIdValue: WorkspaceId, target: ExternalOpenTarget): void {
    const workspace = this.requireWorkspace(workspaceIdValue);
    const command = externalOpenCommand(workspace.path, target);
    this.launchExternal(command.command, command.args);
  }

  async createSession(input: {
    agentId: AgentId;
    environmentId: EnvironmentId;
    workspaceId: WorkspaceId;
  }): Promise<SessionId> {
    const agent = this.state.agents.find((candidate) => candidate.id === input.agentId);
    if (!agent) {
      throw new Error(`Unknown agent: ${input.agentId}`);
    }

    const workspace = this.requireWorkspace(input.workspaceId);
    const id = sessionId(`session-${crypto.randomUUID()}`);
    const createdAt = new Date().toISOString();
    this.publish({
      agentId: input.agentId,
      createdAt,
      environmentId: input.environmentId,
      sessionId: id,
      title: `${agent.name} in ${workspace.name}`,
      type: "session_created",
      workspaceId: input.workspaceId,
    });
    this.publish({
      at: createdAt,
      sessionId: id,
      status: "connecting",
      type: "session_status_changed",
    });

    const session = new AcpAgentSession({
      agent,
      emit: (event) => this.publish(event),
      sessionId: id,
      workspace,
    });
    this.sessions.set(id, session);

    try {
      await session.start();
      this.publish({
        at: new Date().toISOString(),
        sessionId: id,
        status: "idle",
        type: "session_status_changed",
      });
    } catch (error) {
      this.publish({
        at: new Date().toISOString(),
        message: errorMessage(error),
        sessionId: id,
        type: "session_failed",
      });
    }

    return id;
  }

  sendUserMessage(id: SessionId, content: string): void {
    const session = this.requireSession(id);
    const at = new Date().toISOString();
    this.publish({
      message: {
        content,
        createdAt: at,
        id: messageId(`user-${crypto.randomUUID()}`),
        role: "user",
        sessionId: id,
        status: "complete",
      },
      type: "message_appended",
    });
    void session.sendPrompt(content);
  }

  respondToPermission(requestId: PermissionRequestId, optionId: string): void {
    for (const session of this.sessions.values()) {
      try {
        session.respondToPermission(requestId, optionId);
        return;
      } catch {
        continue;
      }
    }
    throw new Error(`Unknown permission request: ${requestId}`);
  }

  async cancelSession(id: SessionId): Promise<void> {
    await this.requireSession(id).cancel();
    this.publish({
      at: new Date().toISOString(),
      sessionId: id,
      status: "cancelled",
      type: "session_status_changed",
    });
  }

  closeAll(): void {
    for (const session of this.sessions.values()) {
      session.close();
    }
    this.sessions.clear();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private publish(event: HostEvent): void {
    this.state = applyHostEvent(this.state, event);
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(event);
      } catch {
        this.listeners.delete(listener);
      }
    }
  }

  private requireWorkspace(id: WorkspaceId): Workspace {
    const workspace = this.state.workspaces.find((candidate) => candidate.id === id);
    if (!workspace) {
      throw new Error(`Unknown workspace: ${id}`);
    }
    return workspace;
  }

  private requireSession(id: SessionId): AcpAgentSession {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Unknown session: ${id}`);
    }
    return session;
  }
}

function externalOpenCommand(
  path: string,
  target: ExternalOpenTarget,
): { readonly args: readonly string[]; readonly command: string } {
  if (process.platform === "darwin") {
    return target === "vscode"
      ? { args: ["-a", "Visual Studio Code", path], command: "open" }
      : { args: [path], command: "open" };
  }
  if (process.platform === "win32") {
    return target === "vscode"
      ? { args: ["/c", "start", "", "code", path], command: "cmd" }
      : { args: [path], command: "explorer" };
  }
  return target === "vscode"
    ? { args: [path], command: "code" }
    : { args: [path], command: "xdg-open" };
}

function launchExternalProcess(command: string, args: readonly string[]): void {
  const child = spawn(command, [...args], { detached: true, stdio: "ignore" });
  child.unref();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
