import type { SessionNotification } from "@agentclientprotocol/sdk";
import { describe, expect, it } from "vitest";
import { sessionId } from "@toro/domain";
import { AcpEventNormalizer } from "./normalizer";

describe("AcpEventNormalizer", () => {
  it("normalizes assistant chunks", () => {
    const normalizer = new AcpEventNormalizer(sessionId("session-1"));
    const events = normalizer.normalizeSessionUpdate({
      sessionId: "acp-session",
      update: {
        content: { text: "hello", type: "text" },
        messageId: "message-1",
        sessionUpdate: "agent_message_chunk",
      },
    } satisfies SessionNotification);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ delta: "hello", role: "assistant", type: "message_delta" });
  });

  it("normalizes tool calls and updates", () => {
    const normalizer = new AcpEventNormalizer(sessionId("session-1"));
    const created = normalizer.normalizeSessionUpdate({
      sessionId: "acp-session",
      update: {
        kind: "execute",
        status: "pending",
        title: "Run tests",
        toolCallId: "tool-1",
        sessionUpdate: "tool_call",
      },
    } satisfies SessionNotification);
    const updated = normalizer.normalizeSessionUpdate({
      sessionId: "acp-session",
      update: {
        status: "completed",
        toolCallId: "tool-1",
        sessionUpdate: "tool_call_update",
      },
    } satisfies SessionNotification);

    expect(created[0]).toMatchObject({ toolCall: { title: "Run tests", status: "pending" } });
    expect(updated[0]).toMatchObject({ toolCall: { title: "Run tests", status: "completed" } });
  });
});
