import * as acp from "@agentclientprotocol/sdk";

const sessions = new Set<string>();
const streamChunkDelayMs = Number(process.env.TORO_DEMO_STREAM_DELAY_MS ?? 90);

const app = acp
  .agent({ name: "Toro Demo Agent" })
  .onRequest(acp.methods.agent.initialize, (ctx) => ({
    agentCapabilities: { promptCapabilities: { image: false }, sessionCapabilities: {} },
    agentInfo: { name: "Toro Demo Agent", version: "0.1.0" },
    protocolVersion: ctx.params.protocolVersion,
  }))
  .onRequest(acp.methods.agent.session.new, () => {
    const sessionId = `demo-${crypto.randomUUID()}`;
    sessions.add(sessionId);
    return { sessionId };
  })
  .onRequest(acp.methods.agent.session.prompt, async (ctx) => {
    if (!sessions.has(ctx.params.sessionId)) {
      throw new Error(`Unknown session: ${ctx.params.sessionId}`);
    }

    await ctx.client.notify(acp.methods.client.session.update, {
      sessionId: ctx.params.sessionId,
      update: {
        entries: [
          { content: "Read the request", priority: "high", status: "completed" },
          {
            content: "Run a deterministic verification flow",
            priority: "high",
            status: "in_progress",
          },
          { content: "Summarize the outcome", priority: "medium", status: "pending" },
        ],
        sessionUpdate: "plan",
      },
    });

    await streamThought(ctx, "Checking project context and deciding the next UI action.");
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs * 2));
    await requestDemoPermission(ctx);
    await streamText(ctx, "Toro demo agent received your prompt. ");
    await streamText(
      ctx,
      "The ACP session, permission loop, streaming transcript, plan, and tool cards are working.",
    );
    return { stopReason: "end_turn" };
  })
  .onNotification(acp.methods.agent.session.cancel, () => undefined);

app.connect(acp.ndJsonStream(WritableStreamFromStdout(), ReadableStreamFromStdin()));

async function requestDemoPermission(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
): Promise<void> {
  const response = await ctx.client.request(acp.methods.client.session.requestPermission, {
    options: [
      { kind: "allow_once", name: "Allow once", optionId: "allow-once" },
      { kind: "reject_once", name: "Reject", optionId: "reject" },
    ],
    sessionId: ctx.params.sessionId,
    toolCall: {
      kind: "execute",
      status: "pending",
      title: "Validate Toro permission UI",
      toolCallId: "demo-permission",
    },
  });

  await ctx.client.notify(acp.methods.client.session.update, {
    sessionId: ctx.params.sessionId,
    update: {
      content: [
        {
          content: {
            text: [
              "$ toro demo verify --workspace toro",
              "permission granted",
              "streaming transcript checked",
              "status: ok",
            ].join("\n"),
            type: "text",
          },
          type: "content",
        },
      ],
      kind: "execute",
      status: response.outcome.outcome === "selected" ? "completed" : "failed",
      title: "Validate Toro permission UI",
      toolCallId: "demo-permission",
      sessionUpdate: "tool_call_update",
    },
  });
}

async function streamThought(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
  text: string,
): Promise<void> {
  for (const chunk of text.match(/\S+\s*/g) ?? []) {
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs));
    await ctx.client.notify(acp.methods.client.session.update, {
      sessionId: ctx.params.sessionId,
      update: {
        content: { text: chunk, type: "text" },
        messageId: "demo-thinking",
        sessionUpdate: "agent_thought_chunk",
      },
    });
  }
}

async function streamText(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
  text: string,
): Promise<void> {
  for (const chunk of text.match(/\S+\s*/g) ?? []) {
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs));
    await ctx.client.notify(acp.methods.client.session.update, {
      sessionId: ctx.params.sessionId,
      update: {
        content: { text: chunk, type: "text" },
        messageId: "demo-answer",
        sessionUpdate: "agent_message_chunk",
      },
    });
  }
}

function ReadableStreamFromStdin(): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      process.stdin.on("data", (chunk: Buffer) => controller.enqueue(chunk));
      process.stdin.on("end", () => controller.close());
    },
  });
}

function WritableStreamFromStdout(): WritableStream<Uint8Array> {
  return new WritableStream({
    write(chunk) {
      process.stdout.write(Buffer.from(chunk));
    },
  });
}
