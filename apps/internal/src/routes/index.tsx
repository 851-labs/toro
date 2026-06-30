import { createFileRoute } from "@tanstack/react-router";
import {
  CodexChatMessage,
  CodexMarkdownMessage,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexThinkingDisclosure,
  CodexToolCall,
  CodexToolCallGroup,
  CodexTranscriptSurface,
} from "@toro/ui";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: ChatElementsRoute,
});

function ChatElementsRoute() {
  const [permissionDecision, setPermissionDecision] = useState<
    "allowed once" | "rejected" | "waiting"
  >("waiting");

  return (
    <CodexTranscriptSurface>
      <CodexPlanDisclosure defaultOpen entries={planEntries} />
      <CodexChatMessage role="user">Make the chat UI look exactly like Codex.</CodexChatMessage>
      <CodexChatMessage
        copyText={[
          "I will compare the reference capture against Toro.",
          "",
          "- Move each chat atom into shared UI primitives",
          "- Keep markdown rendering shared",
        ].join("\n")}
        role="assistant"
      >
        {[
          "I will compare the **reference capture** against Toro.",
          "",
          "- Move each chat atom into shared UI primitives",
          "- Keep `markdown` rendering shared",
        ].join("\n")}
      </CodexChatMessage>
      <CodexChatMessage isStreaming role="assistant">
        Streaming **markdown** keeps a quiet inline cursor while the final response is still
        arriving
      </CodexChatMessage>
      <CodexThinkingDisclosure defaultOpen isStreaming>
        Reviewing project context and deciding which UI primitive should carry the state.
      </CodexThinkingDisclosure>
      <CodexPermissionCard
        onRespond={(optionId) =>
          setPermissionDecision(optionId === "allow" ? "allowed once" : "rejected")
        }
        options={[
          { id: "allow", kind: "allow_once", name: "Allow once" },
          { id: "reject", kind: "reject", name: "Reject" },
        ]}
        title={
          <span className="inline-flex min-w-0 items-baseline gap-2">
            <span>Validate Toro permission UI</span>
            <span className="text-xs font-normal text-zinc-400">{permissionDecision}</span>
          </span>
        }
      />
      <CodexChatMessage copyText="Tool calls now sit inside the assistant answer." role="assistant">
        <div className="space-y-4" data-message-tool-block="true">
          <CodexToolCallGroup completedCount={1} count={2} defaultOpen>
            <CodexToolCall kind="execute" status="in_progress" title="Run deterministic verifier" />
            <CodexToolCall
              defaultOpen
              kind="execute"
              status="completed"
              title="Validate Toro permission UI"
            >
              tool cards are working
            </CodexToolCall>
          </CodexToolCallGroup>
          <CodexMarkdownMessage>
            Tool calls now sit inside the **assistant answer** and stay grouped when there are
            multiple calls.
          </CodexMarkdownMessage>
        </div>
      </CodexChatMessage>
    </CodexTranscriptSurface>
  );
}

const planEntries = [
  { content: "Match Codex message rhythm and spacing.", status: "completed" as const },
  { content: "Render tool calls as compact disclosures.", status: "completed" as const },
  { content: "Keep composer controls functional only.", status: "in_progress" as const },
];
