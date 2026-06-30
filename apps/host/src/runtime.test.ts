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

  it("runs the deterministic demo ACP agent flow", async () => {
    const runtime = new HostRuntime();
    const workspace = await runtime.openWorkspace(process.cwd(), environmentId("local-desktop"));
    const sessionId = await runtime.createSession({
      agentId: agentId("toro-demo"),
      environmentId: environmentId("local-desktop"),
      workspaceId: workspace.id,
    });
    const thoughtDeltas: string[] = [];

    runtime.subscribe((event) => {
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
    expect(session?.thoughts[0]?.content).toContain("Checking project context");
    expect(thoughtDeltas.length).toBeGreaterThan(3);
    expect(thoughtDeltas.join("")).toContain("deciding the next UI action");
    expect(session?.toolCalls[0]?.content[0]).toContain("status: ok");
    expect(session?.toolCalls[0]?.status).toBe("completed");
    expect(session?.plan.length).toBeGreaterThan(0);
  }, 15_000);
});

async function waitFor(predicate: () => boolean): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > 10_000) {
      throw new Error("Timed out waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
