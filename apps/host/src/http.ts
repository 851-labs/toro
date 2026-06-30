import {
  agentId,
  environmentId,
  permissionRequestId,
  sessionId,
  workspaceId,
  type HostEvent,
} from "@toro/domain";
import type { HostRuntime } from "./runtime";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const CORS_HEADERS = {
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-origin": "*",
};

export function routeRequest(runtime: HostRuntime, request: Request): Response | Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  try {
    if (request.method === "GET" && url.pathname === "/api/catalog") {
      return json(runtime.listCatalog());
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
      return json(runtime.getState());
    }
    if (request.method === "POST" && url.pathname === "/api/reset") {
      runtime.reset();
      return json({ ok: true });
    }
    if (request.method === "GET" && url.pathname === "/api/workspaces") {
      return json(runtime.listWorkspaces());
    }
    if (request.method === "POST" && url.pathname === "/api/workspaces") {
      return openWorkspace(runtime, request);
    }
    if (request.method === "POST" && url.pathname.endsWith("/open")) {
      return openWorkspaceExternal(runtime, url.pathname, request);
    }
    if (request.method === "POST" && url.pathname === "/api/sessions") {
      return createSession(runtime, request);
    }
    if (request.method === "GET" && url.pathname.endsWith("/files")) {
      return listFiles(runtime, url.pathname);
    }
    if (request.method === "GET" && url.pathname.endsWith("/file")) {
      return readFile(runtime, url);
    }
    if (request.method === "POST" && url.pathname.includes("/messages")) {
      return sendMessage(runtime, url.pathname, request);
    }
    if (request.method === "POST" && url.pathname.includes("/cancel")) {
      return cancelSession(runtime, url.pathname);
    }
    if (request.method === "POST" && url.pathname.startsWith("/api/permissions/")) {
      return respondToPermission(runtime, url.pathname, request);
    }
    if (request.method === "GET" && url.pathname === "/api/events") {
      return eventStream(runtime);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    return json({ error: errorMessage(error) }, 500);
  }
}

async function openWorkspace(runtime: HostRuntime, request: Request): Promise<Response> {
  const body = (await request.json()) as { path?: string; environmentId?: string };
  if (!body.path) {
    return json({ error: "path is required" }, 400);
  }
  return json(
    await runtime.openWorkspace(body.path, environmentId(body.environmentId ?? "local-desktop")),
  );
}

async function openWorkspaceExternal(runtime: HostRuntime, pathname: string, request: Request) {
  const id = workspaceId(pathname.split("/").at(-2) ?? "");
  const body = (await request.json()) as { target?: string };
  if (body.target !== "finder" && body.target !== "vscode") {
    return json({ error: "target must be finder or vscode" }, 400);
  }
  runtime.openWorkspaceExternal(id, body.target);
  return json({ ok: true });
}

async function createSession(runtime: HostRuntime, request: Request): Promise<Response> {
  const body = (await request.json()) as {
    agentId?: string;
    environmentId?: string;
    workspaceId?: string;
  };
  if (!body.agentId || !body.environmentId || !body.workspaceId) {
    return json({ error: "agentId, environmentId, and workspaceId are required" }, 400);
  }
  const id = await runtime.createSession({
    agentId: agentId(body.agentId),
    environmentId: environmentId(body.environmentId),
    workspaceId: workspaceId(body.workspaceId),
  });
  return json({ sessionId: id });
}

async function listFiles(runtime: HostRuntime, pathname: string): Promise<Response> {
  const id = workspaceId(pathname.split("/").at(-2) ?? "");
  return json(await runtime.listFiles(id));
}

async function readFile(runtime: HostRuntime, url: URL): Promise<Response> {
  const id = workspaceId(url.pathname.split("/").at(-2) ?? "");
  const path = url.searchParams.get("path");
  if (!path) {
    return json({ error: "path is required" }, 400);
  }
  return json({ content: await runtime.readTextFile(id, path) });
}

async function sendMessage(
  runtime: HostRuntime,
  pathname: string,
  request: Request,
): Promise<Response> {
  const id = sessionId(pathname.split("/").at(-2) ?? "");
  const body = (await request.json()) as { content?: string };
  if (!body.content) {
    return json({ error: "content is required" }, 400);
  }
  runtime.sendUserMessage(id, body.content);
  return json({ ok: true });
}

async function cancelSession(runtime: HostRuntime, pathname: string): Promise<Response> {
  const id = sessionId(pathname.split("/").at(-2) ?? "");
  await runtime.cancelSession(id);
  return json({ ok: true });
}

async function respondToPermission(
  runtime: HostRuntime,
  pathname: string,
  request: Request,
): Promise<Response> {
  const id = permissionRequestId(pathname.split("/").at(-2) ?? "");
  const body = (await request.json()) as { optionId?: string };
  if (!body.optionId) {
    return json({ error: "optionId is required" }, 400);
  }
  runtime.respondToPermission(id, body.optionId);
  return json({ ok: true });
}

function eventStream(runtime: HostRuntime): Response {
  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      unsubscribe = runtime.subscribe((event) =>
        controller.enqueue(encoder.encode(serializeEvent(event))),
      );
      controller.enqueue(encoder.encode(": connected\n\n"));
    },
    cancel() {
      unsubscribe();
    },
  });
  return new Response(stream, {
    headers: { ...CORS_HEADERS, "cache-control": "no-cache", "content-type": "text/event-stream" },
  });
}

function serializeEvent(event: HostEvent): string {
  return `event: host\ndata: ${JSON.stringify(event)}\n\n`;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    headers: { ...CORS_HEADERS, ...JSON_HEADERS },
    status,
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
