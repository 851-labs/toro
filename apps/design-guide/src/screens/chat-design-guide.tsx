import {
  CodexChatMessage,
  CodexComposer,
  CodexEmptyState,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexThinkingDisclosure,
  CodexToolCall,
  StatusBadge,
} from "@toro/ui";
import { FolderPlus, MessageSquare, Search, SlidersHorizontal, SquarePen } from "lucide-react";
import { useState } from "react";

type GuideView = "chat" | "composer" | "empty" | "sidebar";

export function ChatDesignGuide() {
  const [activeView, setActiveView] = useState<GuideView>("chat");
  const [composerValue, setComposerValue] = useState("");
  const [permissionDecision, setPermissionDecision] = useState<
    "allowed once" | "rejected" | "waiting"
  >("waiting");
  const permissionTone = permissionDecision === "rejected" ? "bad" : "neutral";

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
          <GuideNavButton
            active={activeView === "chat"}
            label="Chat Elements"
            onClick={() => setActiveView("chat")}
          />
          <GuideNavButton
            active={activeView === "sidebar"}
            label="Sidebar Groups"
            onClick={() => setActiveView("sidebar")}
          />
          <GuideNavButton
            active={activeView === "empty"}
            label="Empty States"
            onClick={() => setActiveView("empty")}
          />
          <GuideNavButton
            active={activeView === "composer"}
            label="Composer States"
            onClick={() => setActiveView("composer")}
          />
        </nav>
      </aside>
      <section className="grid min-h-0 grid-rows-[64px_minmax(0,1fr)_auto]">
        <header className="flex items-center justify-between border-b border-zinc-200/80 px-5">
          <h1 className="text-lg font-semibold">{viewTitle(activeView)}</h1>
          <StatusBadge label="reference" tone="neutral" />
        </header>
        <div className="min-h-0 overflow-auto px-8 py-8">
          {activeView === "chat" ? (
            <ChatElements
              permissionDecision={permissionDecision}
              permissionTone={permissionTone}
              onPermissionDecision={setPermissionDecision}
            />
          ) : activeView === "sidebar" ? (
            <SidebarGroups />
          ) : activeView === "empty" ? (
            <EmptyStates />
          ) : (
            <ComposerStates />
          )}
        </div>
        {activeView === "composer" ? (
          <CodexComposer
            accessLabel="Full access"
            canSend={composerValue.trim().length > 0}
            contextItems={contextItems}
            modelLabel="5.5 Medium"
            onChange={setComposerValue}
            onSubmit={() => setComposerValue("")}
            placeholder="Ask for follow-up changes"
            value={composerValue}
          />
        ) : (
          <div />
        )}
      </section>
    </main>
  );
}

const contextItems = [
  { detail: "apps/desktop/src/app.tsx", id: "app", label: "app.tsx" },
  { detail: "packages/ui/src/chat/composer.tsx", id: "composer", label: "composer.tsx" },
  { detail: "scripts/verify-ui.mjs", id: "verify", label: "verify-ui.mjs" },
];

function GuideNavButton({
  active,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={
        active
          ? "w-full rounded-xl bg-zinc-200 px-3 py-2 text-left font-medium"
          : "w-full rounded-xl px-3 py-2 text-left text-zinc-500 hover:bg-zinc-200/70"
      }
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function viewTitle(view: GuideView) {
  if (view === "sidebar") {
    return "Codex Sidebar Groups";
  }
  if (view === "composer") {
    return "Codex Composer States";
  }
  if (view === "empty") {
    return "Codex Empty States";
  }
  return "Codex Chat Surface";
}

function ChatElements({
  permissionDecision,
  permissionTone,
  onPermissionDecision,
}: {
  readonly permissionDecision: "allowed once" | "rejected" | "waiting";
  readonly permissionTone: "bad" | "neutral";
  readonly onPermissionDecision: (decision: "allowed once" | "rejected") => void;
}) {
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-5" data-transcript-surface="true">
      <CodexPlanDisclosure defaultOpen entries={planEntries} />
      <CodexChatMessage role="user">Make the chat UI look exactly like Codex.</CodexChatMessage>
      <CodexChatMessage
        copyText="I will compare the reference capture against Toro and move each chat atom into shared UI primitives."
        role="assistant"
      >
        I will compare the reference capture against Toro and move each chat atom into shared UI
        primitives.
      </CodexChatMessage>
      <CodexChatMessage isStreaming role="assistant">
        Streaming text keeps a quiet inline cursor while the final response is still arriving
      </CodexChatMessage>
      <CodexThinkingDisclosure defaultOpen isStreaming>
        Reviewing project context and deciding which UI primitive should carry the state.
      </CodexThinkingDisclosure>
      <CodexPermissionCard
        onRespond={(optionId) =>
          onPermissionDecision(optionId === "allow" ? "allowed once" : "rejected")
        }
        options={[
          { id: "allow", kind: "allow_once", name: "Allow once" },
          { id: "reject", kind: "reject", name: "Reject" },
        ]}
        title={
          <span className="inline-flex min-w-0 items-center gap-2">
            <span>Validate Toro permission UI</span>
            <StatusBadge label={permissionDecision} tone={permissionTone} />
          </span>
        }
      />
      <CodexToolCall
        defaultOpen
        kind="execute"
        status="completed"
        title="Validate Toro permission UI"
      >
        tool cards are working
      </CodexToolCall>
    </div>
  );
}

const planEntries = [
  { content: "Match Codex message rhythm and spacing.", status: "completed" as const },
  { content: "Render tool calls as compact disclosures.", status: "completed" as const },
  { content: "Keep composer controls functional only.", status: "in_progress" as const },
];

function SidebarGroups() {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-[390px_minmax(0,1fr)] overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <aside
        className="relative min-h-[620px] border-r border-zinc-200 bg-[#f2f5f5] px-3 py-4"
        data-sidebar-story-rail="true"
      >
        <div aria-hidden="true" className="mb-5 flex items-center gap-2 px-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <SidebarRow icon={<SquarePen size={16} />} label="New chat" />
        <SidebarRow icon={<Search size={16} />} label="Search" />
        <div className="mt-8 flex items-center justify-between px-3 text-sm font-medium text-zinc-400">
          <span>Projects</span>
          <FolderPlus size={15} />
        </div>
        <div className="mt-2 rounded-xl bg-zinc-200 px-3 py-3">
          <div className="font-medium">toro</div>
        </div>
        <div className="ml-6 mt-2 space-y-1 border-l border-zinc-200 pl-2">
          {["Toro Demo in toro", "Codex in toro", "Composer context picker"].map((label) => (
            <div className="flex h-9 items-center gap-2 rounded-xl px-2 text-sm" key={label}>
              <MessageSquare size={14} className="text-zinc-500" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-3 right-3 flex items-center gap-3 border-t border-zinc-200 pt-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-sm font-semibold text-white">
            T
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Local host</div>
            <div className="truncate text-xs text-zinc-500">Toro Demo / connected</div>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500">
            <SlidersHorizontal size={16} />
          </span>
        </div>
      </aside>
      <div className="flex items-center justify-center text-2xl font-medium tracking-tight">
        What should we build in toro?
      </div>
    </div>
  );
}

function SidebarRow({ icon, label }: { readonly icon: React.ReactNode; readonly label: string }) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-800">
      {icon}
      {label}
    </div>
  );
}

function ComposerStates() {
  return (
    <div className="mx-auto max-w-[960px] space-y-5" data-transcript-surface="true">
      <CodexChatMessage role="assistant">
        Use app.tsx and composer.tsx as context for the next Toro chat pass.
      </CodexChatMessage>
      <CodexToolCall kind="read" status="completed" title="Load composer context candidates">
        app.tsx, composer.tsx, verify-ui.mjs
      </CodexToolCall>
    </div>
  );
}

function EmptyStates() {
  return (
    <div className="mx-auto max-w-[960px]" data-transcript-surface="true">
      <CodexEmptyState workspaceName="toro" />
    </div>
  );
}
