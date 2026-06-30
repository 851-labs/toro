import { describe, expect, it } from "vitest";
import { agentId, environmentId } from "@toro/domain";
import { HostRuntime } from "./runtime";

describe("HostRuntime", () => {
  it("reuses an existing workspace for the same local path", async () => {
    const runtime = new HostRuntime();
    const first = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    const second = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));

    expect(second.id).toBe(first.id);
    expect(runtime.getState().workspaces).toHaveLength(1);
  });

  it("opens a workspace through an injected external launcher", async () => {
    const launched: Array<{ readonly args: readonly string[]; readonly command: string }> = [];
    const runtime = new HostRuntime({
      launchExternal: (command, args) => launched.push({ args, command }),
    });
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));

    runtime.openWorkspaceExternal(workspace.id, "vscode");

    expect(launched).toHaveLength(1);
    expect(launched[0]?.args).toContain(workspace.path);
  });

  it("runs the deterministic demo ACP agent flow", async () => {
    const runtime = new HostRuntime();
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    const sessionId = await runtime.createSession({
      agentId: agentId("toro-demo"),
      environmentId: environmentId("local-desktop"),
      workspaceId: workspace.id,
    });
    const thoughtDeltas: string[] = [];
    const messageDeltas: string[] = [];

    runtime.subscribe((event) => {
      if (event.type === "message_delta") {
        messageDeltas.push(event.delta);
      }
      if (event.type === "thought_delta") {
        thoughtDeltas.push(event.delta);
      }
      if (event.type === "permission_requested") {
        runtime.respondToPermission(event.requestId, "allow-once");
      }
    });

    runtime.sendUserMessage(sessionId, "verify the demo flow");
    await waitFor(
      () =>
        runtime.getState().sessions.find((session) => session.id === sessionId)?.status ===
        "completed",
    );

    const session = runtime.getState().sessions.find((candidate) => candidate.id === sessionId);
    runtime.closeAll();

    expect(session?.messages.some((message) => message.content.includes("ACP session"))).toBe(true);
    expect(messageDeltas.length).toBeGreaterThan(8);
    expect(messageDeltas.join("")).toContain("Streaming transcript");
    expect(session?.thoughts[0]?.content).toContain("Checking project context");
    expect(thoughtDeltas.length).toBeGreaterThan(3);
    expect(thoughtDeltas.join("")).toContain("deciding the next UI action");
    expect(session?.toolCalls[0]?.content[0]).toContain("status: ok");
    expect(session?.toolCalls[0]?.status).toBe("completed");
    expect(session?.plan.length).toBeGreaterThan(0);
  }, 15_000);

  it("keeps multiple user turns in the same session", async () => {
    const runtime = new HostRuntime();
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    const sessionId = await runtime.createSession({
      agentId: agentId("toro-demo"),
      environmentId: environmentId("local-desktop"),
      workspaceId: workspace.id,
    });

    runtime.subscribe((event) => {
      if (event.type === "permission_requested") {
        runtime.respondToPermission(event.requestId, "allow-once");
      }
    });

    runtime.sendUserMessage(sessionId, "verify the first turn");
    await waitForTurn(runtime, sessionId, 1);
    runtime.sendUserMessage(sessionId, "verify the follow-up turn");
    await waitForTurn(runtime, sessionId, 2);

    const session = runtime.getState().sessions.find((candidate) => candidate.id === sessionId);
    runtime.closeAll();

    expect(session?.messages.map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "user",
      "assistant",
    ]);
    expect(session?.messages.at(-1)?.content).toContain("received your **follow-up**");
    expect(session?.thoughts).toHaveLength(2);
    expect(session?.toolCalls).toHaveLength(2);
  }, 20_000);

  it("renames a new session from the first user prompt", async () => {
    const runtime = new HostRuntime();
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    const sessionId = await runtime.createSession({
      agentId: agentId("toro-demo"),
      environmentId: environmentId("local-desktop"),
      workspaceId: workspace.id,
    });
    const created = runtime.getState().sessions.find((candidate) => candidate.id === sessionId);

    expect(created?.title).toBe("New chat");

    runtime.sendUserMessage(
      sessionId,
      "Make the Toro sidebar look like Codex Desktop and keep it functional.",
    );

    const session = runtime.getState().sessions.find((candidate) => candidate.id === sessionId);
    runtime.closeAll();

    expect(session?.title).toBe("Make the Toro sidebar look like Codex Desktop and...");
  });

  it("resets transient workspace and session state while preserving catalog data", async () => {
    const runtime = new HostRuntime();
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    await runtime.createSession({
      agentId: agentId("toro-demo"),
      environmentId: environmentId("local-desktop"),
      workspaceId: workspace.id,
    });

    runtime.reset();

    expect(runtime.getState().workspaces).toHaveLength(0);
    expect(runtime.getState().sessions).toHaveLength(0);
    expect(runtime.getState().agents.map((agent) => agent.id)).toContain(agentId("toro-demo"));
    expect(runtime.getState().environments.map((environment) => environment.id)).toContain(
      environmentId("local-desktop"),
    );
  });
});

async function waitForTurn(
  runtime: HostRuntime,
  sessionId: string,
  assistantMessages: number,
): Promise<void> {
  await waitFor(() => {
    const session = runtime.getState().sessions.find((candidate) => candidate.id === sessionId);
    return (
      session?.status === "completed" &&
      session.messages.filter((message) => message.role === "assistant").length >= assistantMessages
    );
  });
}

async function waitFor(predicate: () => boolean): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > 10_000) {
      throw new Error("Timed out waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
