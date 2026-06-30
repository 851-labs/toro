import { createFileRoute } from "@tanstack/react-router";
import {
  CodexChatMessage,
  CodexMarkdownMessage,
  CodexToolCall,
  CodexTranscriptSurface,
} from "@toro/ui";

export const Route = createFileRoute("/composer")({
  component: ComposerStatesRoute,
});

function ComposerStatesRoute() {
  return (
    <CodexTranscriptSurface>
      <CodexChatMessage role="assistant">
        <div className="space-y-4" data-message-tool-block="true">
          <CodexToolCall kind="read" status="completed" title="Load composer context candidates">
            app.tsx, composer.tsx, verify-ui.mjs
          </CodexToolCall>
          <CodexMarkdownMessage>
            Use app.tsx and composer.tsx as context for the next Toro chat pass.
          </CodexMarkdownMessage>
        </div>
      </CodexChatMessage>
    </CodexTranscriptSurface>
  );
}
