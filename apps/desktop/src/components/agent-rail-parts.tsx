import type { SessionId, WorkspaceId } from "@toro/domain";
import type { Session, Workspace } from "@toro/domain";
import { cn } from "@toro/ui";
import { FileText, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

export interface ProjectGroupModel {
  readonly sessions: readonly Session[];
  readonly workspace: Workspace;
  readonly workspaceIds: readonly WorkspaceId[];
}

export function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-200/70",
        active && "bg-zinc-200/70",
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function ProjectGroup({
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
    <div className="space-y-0.5">
      <RailButton
        active={activeWorkspaceId ? workspaceIds.includes(activeWorkspaceId) : false}
        icon={<FileText size={16} />}
        label={workspace.name}
        onClick={() => onSelectWorkspace(workspace.id)}
        title={workspace.path}
      />
      <div className="space-y-0.5">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <button
              aria-current={activeSessionId === session.id ? "page" : undefined}
              aria-label={`Chat ${session.title}`}
              className={cn(
                "flex h-9 w-full items-center gap-2 rounded-lg py-1.5 pl-8 pr-3 text-left text-sm text-zinc-800 hover:bg-zinc-200/70",
                activeSessionId === session.id && "bg-zinc-200/80 text-zinc-950",
              )}
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              type="button"
            >
              <MessageSquare size={14} className="shrink-0 text-zinc-500" />
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-800">
                {session.title}
              </span>
            </button>
          ))
        ) : (
          <div className="px-3 py-1.5 text-sm text-zinc-400">No chats</div>
        )}
      </div>
    </div>
  );
}

export function filterProjectGroups(
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

export function groupWorkspaces(
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

  return Array.from(groups.values()).map((group) => ({
    ...group,
    sessions: group.sessions.toSorted(compareSessionsByRecency),
  }));
}

function compareSessionsByRecency(a: Session, b: Session) {
  return b.updatedAt.localeCompare(a.updatedAt) || b.createdAt.localeCompare(a.createdAt);
}

export function RailSection({
  actionIcon,
  actionLabel,
  actionPressed,
  title,
  onAction,
  children,
}: {
  readonly actionIcon?: ReactNode;
  readonly actionLabel?: string;
  readonly actionPressed?: boolean;
  readonly title: string;
  readonly onAction?: () => void;
  readonly children: ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-1 flex items-center justify-between px-3">
        <h2 className="text-sm font-medium text-zinc-400">{title}</h2>
        {onAction && actionLabel ? (
          <button
            aria-label={actionLabel}
            aria-pressed={actionPressed}
            className={cn(
              "flex size-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700",
              actionPressed && "bg-zinc-200 text-zinc-800",
            )}
            onClick={onAction}
            type="button"
          >
            {actionIcon}
          </button>
        ) : null}
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function RailButton(props: {
  readonly active?: boolean;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly icon: ReactNode;
  readonly label: string;
  readonly meta?: string;
  readonly onClick: () => void;
  readonly title?: string;
}) {
  const className = cn(
    "flex h-9 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-sm",
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
    <button
      aria-label={props.ariaLabel}
      className={className}
      onClick={props.onClick}
      title={props.title}
      type="button"
    >
      {content}
    </button>
  );
}
