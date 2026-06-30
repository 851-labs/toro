import * as acp from "@agentclientprotocol/sdk";

const sessions = new Map<string, number>();
const streamChunkDelayMs = Number(process.env.TORO_DEMO_STREAM_DELAY_MS ?? 35);

const app = acp
  .agent({ name: "Toro Demo Agent" })
  .onRequest(acp.methods.agent.initialize, (ctx) => ({
    agentCapabilities: { promptCapabilities: { image: false }, sessionCapabilities: {} },
    agentInfo: { name: "Toro Demo Agent", version: "0.1.0" },
    protocolVersion: ctx.params.protocolVersion,
  }))
  .onRequest(acp.methods.agent.session.new, () => {
    const sessionId = `demo-${crypto.randomUUID()}`;
    sessions.set(sessionId, 0);
    return { sessionId };
  })
  .onRequest(acp.methods.agent.session.prompt, async (ctx) => {
    if (!sessions.has(ctx.params.sessionId)) {
      throw new Error(`Unknown session: ${ctx.params.sessionId}`);
    }
    const turn = (sessions.get(ctx.params.sessionId) ?? 0) + 1;
    sessions.set(ctx.params.sessionId, turn);

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

    await streamThought(ctx, turn, "Checking project context and deciding the next UI action.");
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs * 2));
    await requestDemoPermission(ctx, turn);
    await streamText(ctx, turn, assistantText(turn));
    return { stopReason: "end_turn" };
  })
  .onNotification(acp.methods.agent.session.cancel, () => undefined);

app.connect(acp.ndJsonStream(WritableStreamFromStdout(), ReadableStreamFromStdin()));

async function requestDemoPermission(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
  turn: number,
): Promise<void> {
  const toolCallId = `demo-permission-${turn}`;
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
      toolCallId,
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
      toolCallId,
      sessionUpdate: "tool_call_update",
    },
  });
}

async function streamThought(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
  turn: number,
  text: string,
): Promise<void> {
  for (const chunk of textFragments(text)) {
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs));
    await ctx.client.notify(acp.methods.client.session.update, {
      sessionId: ctx.params.sessionId,
      update: {
        content: { text: chunk, type: "text" },
        messageId: `demo-thinking-${turn}`,
        sessionUpdate: "agent_thought_chunk",
      },
    });
  }
}

async function streamText(
  ctx: acp.AgentRequestContext<acp.PromptRequest>,
  turn: number,
  text: string,
): Promise<void> {
  for (const chunk of textFragments(text)) {
    await new Promise((resolve) => setTimeout(resolve, streamChunkDelayMs));
    await ctx.client.notify(acp.methods.client.session.update, {
      sessionId: ctx.params.sessionId,
      update: {
        content: { text: chunk, type: "text" },
        messageId: `demo-answer-${turn}`,
        sessionUpdate: "agent_message_chunk",
      },
    });
  }
}

function assistantText(turn: number) {
  if (turn > 1) {
    return [
      "Toro demo agent received your **follow-up**.\n\n",
      "- Same chat kept prior messages\n",
      "- Tool calls remained attached\n",
      "- Streaming state stayed consistent",
    ].join("");
  }
  return [
    "Toro demo agent received your **prompt**.\n\n",
    "- ACP session connected\n",
    "- Permission loop completed\n",
    "- Streaming transcript rendered\n\n",
    "`tool cards are working`.",
  ].join("");
}

function textFragments(text: string): readonly string[] {
  const fragments: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const nextBreak = nextFragmentBreak(text, cursor);
    fragments.push(text.slice(cursor, nextBreak));
    cursor = nextBreak;
  }

  return fragments;
}

function nextFragmentBreak(text: string, start: number): number {
  const target = Math.min(start + 7, text.length);
  if (target === text.length) {
    return target;
  }

  const wordBoundary = text.indexOf(" ", target);
  if (wordBoundary !== -1 && wordBoundary - start <= 12) {
    return wordBoundary + 1;
  }

  return target;
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
