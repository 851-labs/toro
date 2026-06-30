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
  CirclePlus,
  FolderOpen,
  Layers,
  MessageSquare,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

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
  readonly onWorkspacePathChange: (path: string) => void;
}

export function AgentRail(props: AgentRailProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canOpenProject = props.workspacePath.trim().length > 0;
  const projectGroups = filterProjectGroups(
    groupWorkspaces(props.workspaces, props.sessions),
    searchQuery,
  );

  return (
    <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-[#f2f5f5]/95">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-7 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
          T
        </div>
        <div className="font-semibold">Toro</div>
      </div>

      <div className="space-y-1 px-3">
        {props.activeWorkspace ? (
          <button
            aria-label="Session"
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-200/70"
            onClick={props.onCreateSession}
            type="button"
          >
            <CirclePlus size={17} />
            New chat
          </button>
        ) : (
          <div className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-400">
            <CirclePlus size={17} />
            New chat
          </div>
        )}
        <button
          aria-expanded={searchOpen}
          aria-label="Search"
          className={cn(
            "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-200/70",
            searchOpen && "bg-zinc-200/70",
          )}
          onClick={() => setSearchOpen((open) => !open)}
          type="button"
        >
          <Search size={17} />
          Search
        </button>
      </div>

      {searchOpen ? (
        <div className="mt-3 border-t border-zinc-200/80 px-3 pt-3">
          <input
            aria-label="Search projects and chats"
            className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects and chats"
            value={searchQuery}
          />
        </div>
      ) : null}

      <form
        className="mt-3 border-y border-zinc-200/80 px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (canOpenProject) {
            props.onOpenWorkspace();
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

      <div className="min-h-0 flex-1 overflow-auto px-3 pb-3 pt-4">
        <RailSection title="Projects">
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
          <div className="mb-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="grid gap-2">
              <label className="sr-only" htmlFor="agent-select">
                Agent
              </label>
              <select
                className="h-8 min-w-0 rounded-xl border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 outline-none"
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
                className="h-8 min-w-0 rounded-xl border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 outline-none"
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
        <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-semibold text-white">
            T
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Local host</div>
            <div className="text-xs text-zinc-500">{props.streamStatus}</div>
          </div>
          <button
            aria-expanded={settingsOpen}
            aria-label="Host settings"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-800",
              settingsOpen && "bg-zinc-200 text-zinc-900",
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

function ProjectGroup({
  activeSessionId,
  activeWorkspaceId,
  sessions,
  workspace,
  workspaceIds,
  onSelectSession,
  onSelectWorkspace,
}: {
  readonly activeSessionId: SessionId | null;
  readonly activeWorkspaceId: WorkspaceId | null;
  readonly sessions: readonly Session[];
  readonly workspace: Workspace;
  readonly workspaceIds: readonly WorkspaceId[];
  readonly onSelectSession: (id: SessionId) => void;
  readonly onSelectWorkspace: (id: WorkspaceId) => void;
}) {
  return (
    <div className="space-y-1">
      <RailButton
        active={activeWorkspaceId ? workspaceIds.includes(activeWorkspaceId) : false}
        icon={<Layers size={16} />}
        label={workspace.name}
        meta={workspace.path}
        onClick={() => onSelectWorkspace(workspace.id)}
      />
      <div className="ml-6 space-y-1 border-l border-zinc-200 pl-2">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <button
              aria-label={`Chat ${session.title}`}
              className={cn(
                "flex min-h-9 w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-zinc-200/70",
                activeSessionId === session.id && "bg-zinc-200 text-zinc-950",
              )}
              key={session.id}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={14} className="shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-800">
                {session.title}
              </span>
            </button>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-zinc-400">No chats</div>
        )}
      </div>
    </div>
  );
}

interface ProjectGroupModel {
  readonly sessions: readonly Session[];
  readonly workspace: Workspace;
  readonly workspaceIds: readonly WorkspaceId[];
}

function filterProjectGroups(
  groups: readonly ProjectGroupModel[],
  query: string,
): readonly ProjectGroupModel[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return groups;
  }

  return groups
    .map((group) => {
      const projectMatches =
        group.workspace.name.toLowerCase().includes(normalizedQuery) ||
        group.workspace.path.toLowerCase().includes(normalizedQuery);
      const sessions = group.sessions.filter((session) =>
        session.title.toLowerCase().includes(normalizedQuery),
      );
      return projectMatches ? group : { ...group, sessions };
    })
    .filter((group) => {
      const projectMatches =
        group.workspace.name.toLowerCase().includes(normalizedQuery) ||
        group.workspace.path.toLowerCase().includes(normalizedQuery);
      return projectMatches || group.sessions.length > 0;
    });
}

function groupWorkspaces(
  workspaces: readonly Workspace[],
  sessions: readonly Session[],
): readonly ProjectGroupModel[] {
  const groups = new Map<
    string,
    { sessions: Session[]; workspace: Workspace; workspaceIds: WorkspaceId[] }
  >();
  for (const workspace of workspaces) {
    const key = `${workspace.environmentId}:${workspace.path}`;
    const existing = groups.get(key);
    if (existing) {
      existing.workspaceIds.push(workspace.id);
    } else {
      groups.set(key, { sessions: [], workspace, workspaceIds: [workspace.id] });
    }
  }

  for (const session of sessions) {
    const group = Array.from(groups.values()).find((candidate) =>
      candidate.workspaceIds.includes(session.workspaceId),
    );
    group?.sessions.push(session);
  }

  return Array.from(groups.values());
}

function RailSection({
  title,
  children,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="mb-1 px-3 text-sm font-medium text-zinc-400">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function RailButton(props: {
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly meta?: string;
  readonly onClick: () => void;
}) {
  const className = cn(
    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm",
    props.disabled ? "cursor-default opacity-45" : "hover:bg-zinc-200/70",
    props.active && "bg-zinc-200 text-zinc-950",
  );
  const content = (
    <>
      <span className="text-zinc-500">{props.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{props.label}</span>
        {props.meta ? (
          <span className="block truncate text-xs text-zinc-400">{props.meta}</span>
        ) : null}
      </span>
    </>
  );

  if (props.disabled) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <button className={className} onClick={props.onClick}>
      {content}
    </button>
  );
}
