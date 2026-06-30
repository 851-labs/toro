import { describe, expect, it } from "vitest";
import {
  agentId,
  environmentId,
  messageId,
  permissionRequestId,
  sessionId,
  toolCallId,
  workspaceId,
} from "./ids";
import { applyHostEvent, emptyToroState } from "./reducer";

describe("applyHostEvent", () => {
  it("creates a session and appends streamed assistant content", () => {
    const id = sessionId("session-1");
    const created = applyHostEvent(emptyToroState, {
      agentId: agentId("codex"),
      createdAt: "2026-06-30T00:00:00.000Z",
      environmentId: environmentId("local-desktop"),
      sessionId: id,
      title: "Codex",
      type: "session_created",
      workspaceId: workspaceId("workspace-1"),
    });

    const withDelta = applyHostEvent(created, {
      at: "2026-06-30T00:00:01.000Z",
      delta: "hello",
      messageId: messageId("assistant-1"),
      role: "assistant",
      sessionId: id,
      type: "message_delta",
    });

    expect(withDelta.activeSessionId).toBe(id);
    expect(withDelta.sessions[0]?.messages[0]?.content).toBe("hello");
    expect(withDelta.sessions[0]?.messages[0]?.status).toBe("streaming");
  });

  it("tracks and resolves permission requests", () => {
    const id = sessionId("session-1");
    const requestId = permissionRequestId("permission-1");
    const created = applyHostEvent(emptyToroState, {
      agentId: agentId("codex"),
      createdAt: "2026-06-30T00:00:00.000Z",
      environmentId: environmentId("local-desktop"),
      sessionId: id,
      title: "Codex",
      type: "session_created",
      workspaceId: workspaceId("workspace-1"),
    });

    const waiting = applyHostEvent(created, {
      at: "2026-06-30T00:00:01.000Z",
      options: [{ id: "allow", kind: "allow_once", name: "Allow" }],
      requestId,
      toolCall: {
        content: [],
        id: toolCallId("tool-1"),
        kind: "execute",
        sessionId: id,
        status: "pending",
        title: "Run command",
        updatedAt: "2026-06-30T00:00:01.000Z",
      },
      type: "permission_requested",
    });

    const resolved = applyHostEvent(waiting, {
      requestId,
      sessionId: id,
      type: "permission_resolved",
    });

    expect(waiting.sessions[0]?.status).toBe("waiting");
    expect(waiting.sessions[0]?.permissions).toHaveLength(1);
    expect(resolved.sessions[0]?.status).toBe("running");
    expect(resolved.sessions[0]?.permissions).toHaveLength(0);
  });
});
