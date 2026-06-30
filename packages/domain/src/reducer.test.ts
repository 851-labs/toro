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
        createdAt: "2026-06-30T00:00:01.000Z",
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

  it("tracks streamed thought content separately from assistant messages", () => {
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

    const withThought = applyHostEvent(created, {
      at: "2026-06-30T00:00:01.000Z",
      delta: "thinking",
      sessionId: id,
      thoughtId: messageId("thought-1"),
      type: "thought_delta",
    });
    const completed = applyHostEvent(withThought, {
      at: "2026-06-30T00:00:02.000Z",
      sessionId: id,
      thoughtId: messageId("thought-1"),
      type: "thought_completed",
    });

    expect(withThought.sessions[0]?.messages).toHaveLength(0);
    expect(withThought.sessions[0]?.thoughts[0]?.content).toBe("thinking");
    expect(withThought.sessions[0]?.thoughts[0]?.status).toBe("streaming");
    expect(completed.sessions[0]?.thoughts[0]?.status).toBe("complete");
  });

  it("updates a session title", () => {
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

    const renamed = applyHostEvent(created, {
      at: "2026-06-30T00:00:01.000Z",
      sessionId: id,
      title: "Make the sidebar match Codex",
      type: "session_title_changed",
    });

    expect(renamed.sessions[0]?.title).toBe("Make the sidebar match Codex");
    expect(renamed.sessions[0]?.updatedAt).toBe("2026-06-30T00:00:01.000Z");
  });
});
