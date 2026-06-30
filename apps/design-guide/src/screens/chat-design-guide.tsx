import {
  CodexChatMessage,
  CodexComposer,
  CodexDisclosure,
  CodexPermissionCard,
  CodexToolCall,
  StatusBadge,
} from "@toro/ui";
import { ClipboardList, Terminal } from "lucide-react";
import { useState } from "react";

export function ChatDesignGuide() {
  const [composerValue, setComposerValue] = useState("");

  return (
    <main className="grid h-full grid-cols-[280px_minmax(0,1fr)] overflow-hidden bg-white text-zinc-950">
      <aside className="border-r border-zinc-200 bg-[#f2f5f5] px-5 py-5">
        <div className="mb-8 flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-950 text-sm text-white">
            T
          </div>
          Toro UI
        </div>
        <nav className="space-y-1 text-sm">
          <div className="rounded-xl bg-zinc-200 px-3 py-2 font-medium">Chat Elements</div>
          <div className="px-3 py-2 text-zinc-500">Sidebar Groups</div>
          <div className="px-3 py-2 text-zinc-500">Composer States</div>
        </nav>
      </aside>
      <section className="grid min-h-0 grid-rows-[64px_minmax(0,1fr)_auto]">
        <header className="flex items-center justify-between border-b border-zinc-200/80 px-5">
          <h1 className="text-lg font-semibold">Codex Chat Surface</h1>
          <StatusBadge label="reference" tone="neutral" />
        </header>
        <div className="min-h-0 overflow-auto px-8 py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <CodexDisclosure icon={<ClipboardList size={16} />} title="Plan">
              <ol className="space-y-2">
                <li>Match Codex message rhythm and spacing.</li>
                <li>Render tool calls as compact disclosures.</li>
                <li>Keep composer controls functional only.</li>
              </ol>
            </CodexDisclosure>
            <CodexChatMessage role="user">
              Make the chat UI look exactly like Codex.
            </CodexChatMessage>
            <CodexChatMessage role="assistant">
              I will compare the reference capture against Toro and move each chat atom into shared
              UI primitives.
            </CodexChatMessage>
            <CodexChatMessage isStreaming role="assistant">
              Streaming text keeps a quiet inline cursor while the final response is still arriving
            </CodexChatMessage>
            <CodexPermissionCard
              onRespond={() => undefined}
              options={[
                { id: "allow", kind: "allow_once", name: "Allow once" },
                { id: "reject", kind: "reject", name: "Reject" },
              ]}
              title="Validate Toro permission UI"
            />
            <CodexToolCall
              defaultOpen
              kind="execute"
              status="completed"
              title="Validate Toro permission UI"
            >
              tool cards are working
            </CodexToolCall>
            <CodexDisclosure icon={<Terminal size={16} />} title="Activity logs">
              [2026-06-30T02:35:09.746Z] Connected to ACP agent protocol=1
            </CodexDisclosure>
          </div>
        </div>
        <CodexComposer
          accessLabel="Full access"
          canSend={composerValue.trim().length > 0}
          modelLabel="5.5 Medium"
          onChange={setComposerValue}
          onSubmit={() => setComposerValue("")}
          placeholder="Ask for follow-up changes"
          value={composerValue}
          workspaceLabel="toro / Work locally"
        />
      </section>
    </main>
  );
}
