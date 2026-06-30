import {
  agentId,
  environmentId,
  type AgentId,
  type EnvironmentId,
  type SessionId,
  type WorkspaceId,
} from "@toro/domain";
import type { AgentProfile, EnvironmentProfile, Session, Workspace } from "@toro/domain";
import {
  CodexSidebarAvatar,
  CodexSidebarCommand,
  CodexSidebarCommandGroup,
  CodexSidebarContent,
  CodexSidebarFooter,
  CodexSidebarRail,
  CodexSidebarTitlebar,
  CodexSidebarTitlebarControl,
  cn,
} from "@toro/ui";
import {
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  PanelLeft,
  Plug,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";
import { useState } from "react";
import { ChatRows, groupWorkspaces, ProjectRows, RailSection } from "./agent-rail-parts";

interface AgentRailProps {
  readonly activeWorkspace: Workspace | null;
  readonly activeSessionId: SessionId | null;
  readonly agents: readonly AgentProfile[];
  readonly canNavigateBack: boolean;
  readonly canNavigateForward: boolean;
  readonly environments: readonly EnvironmentProfile[];
  readonly error: string | null;
  readonly selectedAgentId: AgentId;
  readonly selectedEnvironmentId: EnvironmentId;
  readonly sessions: readonly Session[];
  readonly streamStatus: "connecting" | "connected" | "disconnected";
  readonly workspaces: readonly Workspace[];
  readonly onCreateSession: () => void;
  readonly onNavigateBack: () => void;
  readonly onNavigateForward: () => void;
  readonly onOpenWorkspace: () => void;
  readonly onSelectAgent: (id: AgentId) => void;
  readonly onSelectEnvironment: (id: EnvironmentId) => void;
  readonly onSelectSession: (id: SessionId) => void;
  readonly onSelectWorkspace: (id: WorkspaceId) => void;
  readonly onToggleSidebar: () => void;
}

export function AgentRail(props: AgentRailProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeWorkspaceId = props.activeWorkspace?.id ?? null;
  const projectGroups = groupWorkspaces(props.workspaces, props.sessions);

  return (
    <CodexSidebarRail>
      <CodexSidebarTitlebar ariaLabel="Sidebar titlebar controls">
        <CodexSidebarTitlebarControl
          icon={<PanelLeft size={17} />}
          label="Collapse sidebar"
          onClick={props.onToggleSidebar}
        />
        <CodexSidebarTitlebarControl
          active={props.canNavigateBack}
          icon={<ChevronLeft size={18} />}
          label="Back"
          onClick={props.onNavigateBack}
        />
        <CodexSidebarTitlebarControl
          active={props.canNavigateForward}
          icon={<ChevronRight size={18} />}
          label="Forward"
          onClick={props.onNavigateForward}
        />
      </CodexSidebarTitlebar>

      <CodexSidebarCommandGroup>
        <CodexSidebarCommand
          icon={<SquarePen size={17} />}
          label="New chat"
          onClick={() => {
            if (props.activeWorkspace) {
              props.onCreateSession();
            } else {
              props.onOpenWorkspace();
            }
          }}
        />
        <CodexSidebarCommand icon={<Plug size={17} />} label="Plugins" />
      </CodexSidebarCommandGroup>

      <CodexSidebarContent>
        <RailSection
          actionIcon={<FolderPlus size={15} />}
          actionLabel="Open project"
          title="Projects"
          onAction={props.onOpenWorkspace}
        >
          <ProjectRows
            activeSessionId={props.activeSessionId}
            activeWorkspaceId={activeWorkspaceId}
            groups={projectGroups}
            onSelectWorkspace={props.onSelectWorkspace}
          />
        </RailSection>
        <RailSection title="Chats">
          <ChatRows
            activeSessionId={props.activeSessionId}
            groups={projectGroups}
            onSelectSession={props.onSelectSession}
          />
        </RailSection>
      </CodexSidebarContent>

      {props.error ? (
        <div className="mx-3 mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {props.error}
        </div>
      ) : null}

      <CodexSidebarFooter
        action={
          <button
            aria-expanded={settingsOpen}
            aria-label="Host settings"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-900",
              settingsOpen ? "bg-zinc-200 text-zinc-950" : "bg-transparent",
            )}
            data-sidebar-footer-action="true"
            onClick={() => setSettingsOpen((open) => !open)}
            type="button"
          >
            <SlidersHorizontal size={16} />
          </button>
        }
        avatar={<CodexSidebarAvatar>T</CodexSidebarAvatar>}
        subtitle={props.streamStatus}
        title="Local host"
      >
        {settingsOpen ? (
          <div className="mb-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="grid gap-1.5">
              <label className="sr-only" htmlFor="agent-select">
                Agent
              </label>
              <select
                className="h-8 min-w-0 rounded-lg border-0 bg-zinc-100 px-2 text-xs font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-300"
                id="agent-select"
                onChange={(event) => props.onSelectAgent(agentId(event.target.value))}
                value={props.selectedAgentId}
              >
                {props.agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="environment-select">
                Environment
              </label>
              <select
                className="h-8 min-w-0 rounded-lg border-0 bg-zinc-100 px-2 text-xs font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-300"
                id="environment-select"
                onChange={(event) => props.onSelectEnvironment(environmentId(event.target.value))}
                value={props.selectedEnvironmentId}
              >
                {props.environments.map((environment) => (
                  <option
                    disabled={environment.status !== "available"}
                    key={environment.id}
                    value={environment.id}
                  >
                    {environment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </CodexSidebarFooter>
    </CodexSidebarRail>
  );
}
