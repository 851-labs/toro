import { createFileRoute } from "@tanstack/react-router";
import { CodexEmptyState, CodexStarterCards, CodexTranscriptSurface } from "@toro/ui";

export const Route = createFileRoute("/empty")({
  component: EmptyStatesRoute,
});

function EmptyStatesRoute() {
  return (
    <CodexTranscriptSurface className="gap-0">
      <CodexEmptyState workspaceName="toro" />
      <CodexStarterCards className="mt-10" />
    </CodexTranscriptSurface>
  );
}
