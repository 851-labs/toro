import type { SessionId, WorkspaceId } from "@toro/domain";
import type { Session, Workspace } from "@toro/domain";
import { CodexSidebarRow, cn } from "@toro/ui";
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
  const activeChatInGroup = sessions.some((session) => session.id === activeSessionId);
  return (
    <div className="space-y-0.5">
      <RailButton
        active={Boolean(
          activeWorkspaceId && workspaceIds.includes(activeWorkspaceId) && !activeChatInGroup,
        )}
        icon={<FileText size={16} />}
        label={workspace.name}
        onClick={() => onSelectWorkspace(workspace.id)}
        title={workspace.path}
      />
      <div className="space-y-0.5">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <CodexSidebarRow
              active={activeSessionId === session.id}
              ariaCurrent={activeSessionId === session.id ? "page" : undefined}
              ariaLabel={`Chat ${session.title}`}
              icon={<MessageSquare size={14} />}
              indent
              key={session.id}
              label={session.title}
              onClick={() => onSelectSession(session.id)}
            />
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
  if (props.disabled) {
    return (
      <CodexSidebarRow
        active={props.active}
        ariaLabel={props.ariaLabel}
        icon={props.icon}
        label={props.label}
        meta={props.meta}
        title={props.title}
      />
    );
  }

  return (
    <CodexSidebarRow
      active={props.active}
      ariaLabel={props.ariaLabel}
      icon={props.icon}
      label={props.label}
      meta={props.meta}
      onClick={props.onClick}
      title={props.title}
    />
  );
}
