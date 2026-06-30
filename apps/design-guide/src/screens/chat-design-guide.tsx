import {
  CodexChatMessage,
  CodexComposer,
  CodexSidebarCommand,
  CodexSidebarCommandGroup,
  CodexSidebarContent,
  CodexEmptyState,
  CodexChatHeader,
  CodexMarkdownMessage,
  CodexSidebarFooter,
  CodexSidebarAvatar,
  CodexPermissionCard,
  CodexPlanDisclosure,
  CodexSidebarRail,
  CodexSidebarRow,
  CodexSidebarSection,
  CodexSidebarTitlebar,
  CodexSidebarTitlebarControl,
  CodexStarterCards,
  CodexThinkingDisclosure,
  CodexToolCall,
  CodexToolCallGroup,
  CodexTranscriptSurface,
  StatusBadge,
  VsCodeMark,
} from "@toro/ui";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  FileText,
  FolderPlus,
  ListFilter,
  MessageSquare,
  MoreHorizontal,
  NotebookTabs,
  PanelLeft,
  PanelRight,
  PanelTop,
  Plug,
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

function SidebarGroups() {
  const [value, setValue] = useState("");

  return (
    <div
      className="grid h-full min-h-[620px] grid-cols-[390px_minmax(0,1fr)] overflow-hidden bg-white"
      data-sidebar-story-shell="true"
    >
      <CodexSidebarRail story>
        <CodexSidebarTitlebar ariaLabel="Sidebar titlebar controls">
          <CodexSidebarTitlebarControl icon={<PanelLeft size={17} />} label="Collapse sidebar" />
          <CodexSidebarTitlebarControl icon={<ChevronLeft size={18} />} label="Back" />
          <CodexSidebarTitlebarControl
            active={false}
            icon={<ChevronRight size={18} />}
            label="Forward"
          />
        </CodexSidebarTitlebar>
        <CodexSidebarCommandGroup>
          <CodexSidebarCommand icon={<SquarePen size={16} />} label="New chat" />
          <CodexSidebarCommand icon={<Search size={16} />} label="Search" />
          <CodexSidebarCommand icon={<Clock size={16} />} label="Scheduled" />
          <CodexSidebarCommand icon={<Plug size={16} />} label="Plugins" />
        </CodexSidebarCommandGroup>
        <CodexSidebarContent>
          <CodexSidebarSection actionIcon={<FolderPlus size={15} />} title="Projects">
            <CodexSidebarRow icon={<FileText size={16} />} label="toro" />
            <CodexSidebarRow icon={<FileText size={16} />} label="docs-beta" />
          </CodexSidebarSection>
          <CodexSidebarSection title="Chats">
            <div
              className="px-3 pb-1 pt-2 text-xs font-medium text-zinc-400"
              data-sidebar-chat-project="true"
            >
              toro
            </div>
            <CodexSidebarRow
              active
              icon={<MessageSquare size={14} />}
              indent
              label="Verify the Toro ACP UI loop"
            />
            <CodexSidebarRow
              icon={<MessageSquare size={14} />}
              indent
              label="Composer context picker"
            />
            <div
              className="px-3 pb-1 pt-2 text-xs font-medium text-zinc-400"
              data-sidebar-chat-project="true"
            >
              docs-beta
            </div>
            <CodexSidebarRow
              icon={<MessageSquare size={14} />}
              indent
              label="Quiet expanded tool output"
            />
          </CodexSidebarSection>
        </CodexSidebarContent>
        <CodexSidebarFooter
          action={
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500"
              data-sidebar-footer-action="true"
            >
              <SlidersHorizontal size={16} />
            </span>
          }
          avatar={<CodexSidebarAvatar>T</CodexSidebarAvatar>}
          subtitle="connected"
          title="Local host"
        />
      </CodexSidebarRail>
      <section className="grid min-h-0 grid-rows-[64px_1fr_auto] bg-white">
        <CodexChatHeader
          ariaLabel="Sidebar story chat header"
          actions={
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500">
              <MoreHorizontal size={18} />
            </span>
          }
          leading={
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center text-zinc-500"
            >
              <NotebookTabs size={18} />
            </span>
          }
          rightActions={
            <>
              <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 font-medium shadow-sm">
                <VsCodeMark size={16} />
                Open in
                <ChevronDown size={15} />
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500">
                <ListFilter size={18} />
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500">
                <PanelTop size={18} />
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500">
                <PanelRight size={18} />
              </span>
            </>
          }
          title="New chat"
          titleAs="h2"
        />
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
        >
          <CodexStarterCards className="mt-10" />
        </CodexComposer>
      </section>
    </div>
  );
}

function ComposerStates() {
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

function EmptyStates() {
  return (
    <CodexTranscriptSurface className="gap-0">
      <CodexEmptyState workspaceName="toro" />
      <CodexStarterCards className="mt-10" />
    </CodexTranscriptSurface>
  );
}
