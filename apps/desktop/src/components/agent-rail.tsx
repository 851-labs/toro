import {
  agentId,
  environmentId,
  type AgentId,
  type EnvironmentId,
  type SessionId,
  type WorkspaceId,
} from "@toro/domain";
import type { AgentProfile, EnvironmentProfile, Session, Workspace } from "@toro/domain";
import { Button, cn } from "@toro/ui";
import {
  FolderOpen,
  FolderPlus,
  PanelLeft,
  Search,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react";
import { useState } from "react";
import {
  filterProjectGroups,
  groupWorkspaces,
  NavButton,
  ProjectGroup,
  RailSection,
} from "./agent-rail-parts";

type RailView = "projects" | "search";

interface AgentRailProps {
  readonly activeWorkspace: Workspace | null;
  readonly activeSessionId: SessionId | null;
  readonly agents: readonly AgentProfile[];
  readonly environments: readonly EnvironmentProfile[];
  readonly error: string | null;
  readonly selectedAgentId: AgentId;
  readonly selectedEnvironmentId: EnvironmentId;
  readonly sessions: readonly Session[];
  readonly streamStatus: "connecting" | "connected" | "disconnected";
  readonly workspacePath: string;
  readonly workspaces: readonly Workspace[];
  readonly onCreateSession: () => void;
  readonly onOpenWorkspace: () => void;
  readonly onSelectAgent: (id: AgentId) => void;
  readonly onSelectEnvironment: (id: EnvironmentId) => void;
  readonly onSelectSession: (id: SessionId) => void;
  readonly onSelectWorkspace: (id: WorkspaceId) => void;
  readonly onToggleSidebar: () => void;
  readonly onWorkspacePathChange: (path: string) => void;
}

export function AgentRail(props: AgentRailProps) {
  const [activeView, setActiveView] = useState<RailView>("projects");
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canOpenProject = props.workspacePath.trim().length > 0;
  const searchOpen = activeView === "search";
  const selectedAgent = props.agents.find((agent) => agent.id === props.selectedAgentId);
  const projectGroups = filterProjectGroups(
    groupWorkspaces(props.workspaces, props.sessions),
    searchQuery,
  );

  return (
    <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-[#f2f5f5]/95">
      <div className="flex h-14 items-center justify-between px-5">
        <div aria-hidden="true" className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <button
          aria-label="Collapse sidebar"
          className="flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900"
          onClick={props.onToggleSidebar}
          type="button"
        >
          <PanelLeft size={17} />
        </button>
      </div>

      <div className="space-y-1 px-3">
        {props.activeWorkspace ? (
          <button
            aria-label="New chat"
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-200/70"
            onClick={() => {
              setActiveView("projects");
              props.onCreateSession();
            }}
            type="button"
          >
            <SquarePen size={17} />
            New chat
          </button>
        ) : (
          <div className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-400">
            <SquarePen size={17} />
            New chat
          </div>
        )}
        <NavButton
          active={searchOpen}
          icon={<Search size={17} />}
          label="Search"
          onClick={() => setActiveView((view) => (view === "search" ? "projects" : "search"))}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 pb-3 pt-4">
        <RailSection
          actionIcon={<FolderPlus size={15} />}
          actionLabel="Open project"
          actionPressed={projectFormOpen}
          title="Projects"
          onAction={() => setProjectFormOpen((open) => !open)}
        >
          {searchOpen ? (
            <div className="mb-3">
              <input
                aria-label="Search projects and chats"
                className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search projects and chats"
                value={searchQuery}
              />
            </div>
          ) : null}
          {projectFormOpen ? (
            <form
              className="mb-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (canOpenProject) {
                  props.onOpenWorkspace();
                  setProjectFormOpen(false);
                }
              }}
            >
              <div className="flex gap-2">
                <input
                  aria-label="Project path"
                  className="h-9 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                  onChange={(event) => props.onWorkspacePathChange(event.target.value)}
                  placeholder="/path/to/workspace"
                  value={props.workspacePath}
                />
                {canOpenProject ? (
                  <Button className="h-9 shrink-0" icon={<FolderOpen size={15} />} type="submit">
                    Open
                  </Button>
                ) : (
                  <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-400">
                    <FolderOpen size={15} />
                    Open
                  </span>
                )}
              </div>
            </form>
          ) : null}
          {projectGroups.length > 0 ? (
            projectGroups.map((group) => (
              <ProjectGroup
                activeSessionId={props.activeSessionId}
                activeWorkspaceId={props.activeWorkspace?.id ?? null}
                key={`${group.workspace.environmentId}:${group.workspace.path}`}
                sessions={group.sessions}
                workspace={group.workspace}
                workspaceIds={group.workspaceIds}
                onSelectSession={props.onSelectSession}
                onSelectWorkspace={props.onSelectWorkspace}
              />
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-zinc-400">
              {props.workspaces.length > 0 ? "No matches" : "No projects"}
            </div>
          )}
        </RailSection>
      </div>

      {props.error ? (
        <div className="mx-3 mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {props.error}
        </div>
      ) : null}

      <div className="border-t border-zinc-200/80 p-3">
        {settingsOpen ? (
          <div className="mb-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
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
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-sm font-semibold text-white">
            T
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Local host</div>
            <div className="truncate text-xs text-zinc-500">
              {selectedAgent?.name ?? "Agent"} / {props.streamStatus}
            </div>
          </div>
          <button
            aria-expanded={settingsOpen}
            aria-label="Host settings"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-900",
              settingsOpen ? "bg-zinc-200 text-zinc-950" : "bg-transparent",
            )}
            onClick={() => setSettingsOpen((open) => !open)}
            type="button"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
