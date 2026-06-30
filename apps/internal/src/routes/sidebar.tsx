import { createFileRoute } from "@tanstack/react-router";
import {
  CodexChatHeader,
  CodexComposer,
  CodexEmptyState,
  CodexSidebarAvatar,
  CodexSidebarCommand,
  CodexSidebarCommandGroup,
  CodexSidebarContent,
  CodexSidebarFooter,
  CodexSidebarRail,
  CodexSidebarRow,
  CodexSidebarSection,
  CodexSidebarTitlebar,
  CodexSidebarTitlebarControl,
  CodexStarterCards,
  CodexTranscriptSurface,
  VsCodeMark,
} from "@toro/ui";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { useState } from "react";

export const Route = createFileRoute("/sidebar")({
  component: SidebarGroupsRoute,
});

function SidebarGroupsRoute() {
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
