import {
  CodexChatMessage,
  CodexComposer,
  CodexEmptyState,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexThinkingDisclosure,
  CodexToolCall,
  CodexTranscriptSurface,
  StatusBadge,
} from "@toro/ui";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderPlus,
  MessageSquare,
  PanelLeft,
  Search,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";
import { useState } from "react";

type GuideView = "chat" | "composer" | "empty" | "sidebar";

export function ChatDesignGuide() {
  const [activeView, setActiveView] = useState<GuideView>("chat");
  const [composerValue, setComposerValue] = useState("");
  const [permissionDecision, setPermissionDecision] = useState<
    "allowed once" | "rejected" | "waiting"
  >("waiting");

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
        <div
          className={
            activeView === "sidebar" ? "min-h-0 overflow-hidden" : "min-h-0 overflow-auto px-8 py-8"
          }
        >
          {activeView === "chat" ? (
            <ChatElements
              permissionDecision={permissionDecision}
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
            contextStrip={{
              branchLabel: "main",
              environmentLabel: "Work locally",
              projectLabel: "toro",
            }}
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
  onPermissionDecision,
}: {
  readonly permissionDecision: "allowed once" | "rejected" | "waiting";
  readonly onPermissionDecision: (decision: "allowed once" | "rejected") => void;
}) {
  return (
    <CodexTranscriptSurface>
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
          <span className="inline-flex min-w-0 items-baseline gap-2">
            <span>Validate Toro permission UI</span>
            <span className="text-xs font-normal text-zinc-400">{permissionDecision}</span>
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
    </CodexTranscriptSurface>
  );
}

const planEntries = [
  { content: "Match Codex message rhythm and spacing.", status: "completed" as const },
  { content: "Render tool calls as compact disclosures.", status: "completed" as const },
  { content: "Keep composer controls functional only.", status: "in_progress" as const },
];

function SidebarGroups() {
  const [value, setValue] = useState("");

  return (
    <div
      className="grid h-full min-h-[620px] grid-cols-[390px_minmax(0,1fr)] overflow-hidden bg-white"
      data-sidebar-story-shell="true"
    >
      <aside
        className="relative min-h-0 border-r border-zinc-200 bg-[#f7f8f8] px-3 py-4"
        data-sidebar-story-rail="true"
      >
        <div className="mb-5 flex h-8 items-center gap-3 px-2">
          <div aria-hidden="true" className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <div aria-label="Sidebar titlebar controls" className="ml-2 flex items-center gap-1">
            <span className="flex size-8 items-center justify-center rounded-lg text-zinc-500">
              <PanelLeft size={17} />
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg text-zinc-500">
              <ChevronLeft size={18} />
            </span>
            <span className="flex size-8 items-center justify-center rounded-lg text-zinc-300">
              <ChevronRight size={18} />
            </span>
          </div>
        </div>
        <SidebarRow icon={<SquarePen size={16} />} label="New chat" />
        <SidebarRow icon={<Search size={16} />} label="Search" />
        <div className="mt-8 flex items-center justify-between px-3 text-sm font-medium text-zinc-400">
          <span>Projects</span>
          <FolderPlus size={15} />
        </div>
        <div className="mt-2 flex h-9 items-center gap-3 rounded-lg px-3 text-sm">
          <FileText size={16} className="text-zinc-500" />
          <div className="truncate font-medium">toro</div>
        </div>
        <div className="mt-0.5 space-y-0.5">
          {[
            { active: true, label: "Verify the Toro ACP UI loop" },
            { active: false, label: "Composer context picker" },
            { active: false, label: "Quiet expanded tool output" },
          ].map((chat) => (
            <div
              className={
                chat.active
                  ? "flex h-9 items-center gap-2 rounded-lg bg-zinc-200/80 py-1.5 pl-8 pr-3 text-sm"
                  : "flex h-9 items-center gap-2 rounded-lg py-1.5 pl-8 pr-3 text-sm"
              }
              key={chat.label}
            >
              <MessageSquare size={14} className="text-zinc-500" />
              <span className="truncate">{chat.label}</span>
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
      <section className="grid min-h-0 grid-rows-[1fr_auto] bg-white">
        <div className="min-h-0 overflow-hidden px-6 py-8">
          <CodexTranscriptSurface className="h-full justify-end pb-16">
            <CodexEmptyState placement="composer" workspaceName="toro" />
          </CodexTranscriptSurface>
        </div>
        <CodexComposer
          accessLabel="Ask first"
          canSend={value.trim().length > 0}
          contextStrip={{
            branchLabel: "main",
            environmentLabel: "Work locally",
            projectLabel: "toro",
          }}
          modelLabel="5.5 High"
          onChange={setValue}
          onSubmit={() => setValue("")}
          placeholder="Do anything"
          value={value}
        />
      </section>
    </div>
  );
}

function SidebarRow({ icon, label }: { readonly icon: React.ReactNode; readonly label: string }) {
  return (
    <div className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-zinc-800">
      {icon}
      {label}
    </div>
  );
}

function ComposerStates() {
  return (
    <CodexTranscriptSurface>
      <CodexChatMessage role="assistant">
        Use app.tsx and composer.tsx as context for the next Toro chat pass.
      </CodexChatMessage>
      <CodexToolCall kind="read" status="completed" title="Load composer context candidates">
        app.tsx, composer.tsx, verify-ui.mjs
      </CodexToolCall>
    </CodexTranscriptSurface>
  );
}

function EmptyStates() {
  return (
    <CodexTranscriptSurface className="gap-0">
      <CodexEmptyState workspaceName="toro" />
    </CodexTranscriptSurface>
  );
}
