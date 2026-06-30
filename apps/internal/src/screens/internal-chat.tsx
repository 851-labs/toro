import { Link, useRouterState } from "@tanstack/react-router";
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
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type GuideRoute = "/" | "/composer" | "/empty" | "/sidebar";

export function InternalLayout({ children }: { readonly children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeRoute = guideRouteFromPathname(pathname);
  const [composerValue, setComposerValue] = useState("");

  return (
    <main className="grid h-full grid-cols-[280px_minmax(0,1fr)] overflow-hidden bg-white text-zinc-950">
      <aside className="border-r border-zinc-200 bg-[#f2f5f5] px-5 py-5">
        <div className="mb-8 font-semibold">Toro UI</div>
        <nav className="space-y-1 text-sm">
          {guideNavItems.map((item) => (
            <GuideNavLink active={activeRoute === item.to} key={item.to} {...item} />
          ))}
        </nav>
      </aside>
      <section className="grid min-h-0 grid-rows-[64px_minmax(0,1fr)_auto]">
        <header className="flex items-center justify-between border-b border-zinc-200/80 px-5">
          <h1 className="text-lg font-semibold">{viewTitle(activeRoute)}</h1>
          <StatusBadge label="reference" tone="neutral" />
        </header>
        <div
          className={
            activeRoute === "/sidebar"
              ? "min-h-0 overflow-hidden"
              : "min-h-0 overflow-auto px-8 py-8"
          }
        >
          {children}
        </div>
        {activeRoute === "/composer" ? (
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

const guideNavItems = [
  { label: "Chat Elements", to: "/" },
  { label: "Sidebar Groups", to: "/sidebar" },
  { label: "Empty States", to: "/empty" },
  { label: "Composer States", to: "/composer" },
] satisfies ReadonlyArray<{ readonly label: string; readonly to: GuideRoute }>;

const contextItems = [
  { detail: "apps/desktop/src/app.tsx", id: "app", label: "app.tsx" },
  { detail: "packages/ui/src/chat/composer.tsx", id: "composer", label: "composer.tsx" },
  { detail: "scripts/verify-ui.mjs", id: "verify", label: "verify-ui.mjs" },
];

function GuideNavLink({
  active,
  label,
  to,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly to: GuideRoute;
}) {
  return (
    <Link
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "block w-full rounded-xl bg-zinc-200 px-3 py-2 text-left font-medium"
          : "block w-full rounded-xl px-3 py-2 text-left text-zinc-500 hover:bg-zinc-200/70"
      }
      to={to}
    >
      {label}
    </Link>
  );
}

function guideRouteFromPathname(pathname: string): GuideRoute {
  if (pathname === "/sidebar" || pathname === "/empty" || pathname === "/composer") {
    return pathname;
  }
  return "/";
}

function viewTitle(route: GuideRoute) {
  if (route === "/sidebar") {
    return "Codex Sidebar Groups";
  }
  if (route === "/composer") {
    return "Codex Composer States";
  }
  if (route === "/empty") {
    return "Codex Empty States";
  }
  return "Codex Chat Surface";
}

export function ChatElements({
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

export function SidebarGroups() {
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

export function ComposerStates() {
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

export function EmptyStates() {
  return (
    <CodexTranscriptSurface className="gap-0">
      <CodexEmptyState workspaceName="toro" />
      <CodexStarterCards className="mt-10" />
    </CodexTranscriptSurface>
  );
}
