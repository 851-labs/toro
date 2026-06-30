import type { AgentId, EnvironmentId, WorkspaceId } from "@toro/domain";
import type { AgentProfile, EnvironmentProfile, Session, Workspace } from "@toro/domain";
import { Button, StatusBadge, cn } from "@toro/ui";
import {
  Bot,
  CirclePlus,
  FolderOpen,
  Layers,
  Monitor,
  Server,
} from "lucide-react";
import { FileExplorer } from "./file-explorer";

interface AgentRailProps {
  readonly activeWorkspace: Workspace | null;
  readonly agents: readonly AgentProfile[];
  readonly environments: readonly EnvironmentProfile[];
  readonly error: string | null;
  readonly selectedAgentId: AgentId;
  readonly selectedEnvironmentId: EnvironmentId;
  readonly selectedFilePath: string | null;
  readonly sessions: readonly Session[];
  readonly streamStatus: "connecting" | "connected" | "disconnected";
  readonly workspacePath: string;
  readonly workspaces: readonly Workspace[];
  readonly onCreateSession: () => void;
  readonly onOpenWorkspace: () => void;
  readonly onSelectAgent: (id: AgentId) => void;
  readonly onSelectEnvironment: (id: EnvironmentId) => void;
  readonly onSelectFile: (path: string) => void;
  readonly onSelectWorkspace: (id: WorkspaceId) => void;
  readonly onWorkspacePathChange: (path: string) => void;
}

export function AgentRail(props: AgentRailProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-[#f2f5f5]/95">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-7 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
          T
        </div>
        <div className="font-semibold">Toro</div>
      </div>

      <div className="space-y-1 px-3">
        <button
          aria-label="Session"
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-200/70 disabled:opacity-50"
          disabled={!props.activeWorkspace}
          onClick={props.onCreateSession}
        >
          <CirclePlus size={17} />
          New chat
        </button>
      </div>

      <div className="mt-3 border-t border-zinc-200/80 px-3 pt-3">
        <div className="flex gap-2">
          <input
            className="h-9 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
            onChange={(event) => props.onWorkspacePathChange(event.target.value)}
            placeholder="/path/to/workspace"
            value={props.workspacePath}
          />
          <Button
            className="h-9 shrink-0"
            disabled={!props.workspacePath}
            icon={<FolderOpen size={15} />}
            onClick={props.onOpenWorkspace}
          >
            Open
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 pb-3 pt-4">
        <RailSection title="Agents">
          {props.agents.map((agent) => (
            <RailButton
              active={props.selectedAgentId === agent.id}
              icon={<Bot size={16} />}
              key={agent.id}
              label={agent.name}
              meta={agent.vendor}
              onClick={() => props.onSelectAgent(agent.id)}
            />
          ))}
        </RailSection>

        <RailSection title="Environments">
          {props.environments.map((environment) => (
            <RailButton
              active={props.selectedEnvironmentId === environment.id}
              disabled={environment.status !== "available"}
              icon={
                environment.kind === "local-desktop" ? <Monitor size={16} /> : <Server size={16} />
              }
              key={environment.id}
              label={environment.name}
              meta={environment.status}
              onClick={() => props.onSelectEnvironment(environment.id)}
            />
          ))}
        </RailSection>

        <RailSection title="Projects">
          {props.workspaces.length > 0 ? (
            props.workspaces.map((workspace) => (
              <RailButton
                active={props.activeWorkspace?.id === workspace.id}
                icon={<Layers size={16} />}
                key={workspace.id}
                label={workspace.name}
                meta={workspace.path}
                onClick={() => props.onSelectWorkspace(workspace.id)}
              />
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-zinc-400">No projects</div>
          )}
        </RailSection>

        <RailSection title="Chats">
          {props.sessions.length > 0 ? (
            props.sessions.map((session) => (
              <div className="rounded-xl px-3 py-2 text-sm hover:bg-zinc-200/70" key={session.id}>
                <div className="truncate font-medium text-zinc-800">{session.title}</div>
                <StatusBadge label={session.status} tone={statusTone(session.status)} />
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-zinc-400">No chats</div>
          )}
        </RailSection>

        {props.activeWorkspace ? (
          <RailSection title="Files">
            <FileExplorer
              selectedFilePath={props.selectedFilePath}
              workspace={props.activeWorkspace}
              onSelectFile={props.onSelectFile}
            />
          </RailSection>
        ) : null}
      </div>

      {props.error ? (
        <div className="mx-3 mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {props.error}
        </div>
      ) : null}

      <div className="border-t border-zinc-200/80 p-3">
        <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-semibold text-white">
            T
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Local host</div>
            <div className="text-xs text-zinc-500">{props.streamStatus}</div>
          </div>
        </div>
      </div>
    </aside>
  );
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
  return (
    <button
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-45",
        props.active && "bg-zinc-200 text-zinc-950",
      )}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <span className="text-zinc-500">{props.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{props.label}</span>
        {props.meta ? (
          <span className="block truncate text-xs text-zinc-400">{props.meta}</span>
        ) : null}
      </span>
    </button>
  );
}

function statusTone(status: Session["status"]) {
  if (status === "completed") return "good";
  if (status === "failed" || status === "cancelled") return "bad";
  if (status === "running" || status === "waiting" || status === "connecting") return "warn";
  return "neutral";
}
