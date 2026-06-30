import type {
  AgentId,
  EnvironmentId,
  HostCatalog,
  HostEvent,
  PermissionRequestId,
  SessionId,
  ToroState,
  Workspace,
  WorkspaceId,
} from "@toro/domain";
import type { FileTreeEntry } from "@toro/environments";

const DEFAULT_HOST_URL = "http://127.0.0.1:17345";

export class HttpHostClient {
  constructor(readonly baseUrl = import.meta.env.VITE_TORO_HOST_URL ?? DEFAULT_HOST_URL) {}

  listCatalog(): Promise<HostCatalog> {
    return this.get("/api/catalog");
  }

  getState(): Promise<ToroState> {
    return this.get("/api/state");
  }

  openWorkspace(path: string, environmentId: EnvironmentId): Promise<Workspace> {
    return this.post("/api/workspaces", { environmentId, path });
  }

  listFiles(workspaceId: WorkspaceId): Promise<readonly FileTreeEntry[]> {
    return this.get(`/api/workspaces/${workspaceId}/files`);
  }

  readTextFile(workspaceId: WorkspaceId, path: string): Promise<{ readonly content: string }> {
    return this.get(`/api/workspaces/${workspaceId}/file?path=${encodeURIComponent(path)}`);
  }

  createSession(input: {
    readonly workspaceId: WorkspaceId;
    readonly agentId: AgentId;
    readonly environmentId: EnvironmentId;
  }): Promise<{ readonly sessionId: SessionId }> {
    return this.post("/api/sessions", input);
  }

  sendUserMessage(sessionId: SessionId, content: string): Promise<void> {
    return this.post(`/api/sessions/${sessionId}/messages`, { content });
  }

  respondToPermission(requestId: PermissionRequestId, optionId: string): Promise<void> {
    return this.post(`/api/permissions/${requestId}/respond`, { optionId });
  }

  cancelSession(sessionId: SessionId): Promise<void> {
    return this.post(`/api/sessions/${sessionId}/cancel`, {});
  }

  events(onEvent: (event: HostEvent) => void, onError: () => void): EventSource {
    const source = new EventSource(`${this.baseUrl}/api/events`);
    source.addEventListener("host", (message) => onEvent(JSON.parse(message.data) as HostEvent));
    source.onerror = onError;
    return source;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);
    return parseResponse<T>(response);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    return parseResponse<T>(response);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(errorFromBody(body) ?? `Host request failed: ${response.status}`);
  }
  return body as T;
}

function errorFromBody(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "error" in body) {
    return String(body.error);
  }
  return null;
}

export const hostClient = new HttpHostClient();
