import type { SessionId, WorkspaceId } from "@toro/domain";
import type { Session, Workspace } from "@toro/domain";
import { CodexSidebarRow, CodexSidebarSection } from "@toro/ui";
import { FileText, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

export interface ProjectGroupModel {
  readonly sessions: readonly Session[];
  readonly workspace: Workspace;
  readonly workspaceIds: readonly WorkspaceId[];
}

export function ProjectRows({
  activeSessionId,
  activeWorkspaceId,
  groups,
  onSelectWorkspace,
}: {
  readonly activeSessionId: SessionId | null;
  readonly activeWorkspaceId: WorkspaceId | null;
  readonly groups: readonly ProjectGroupModel[];
  readonly onSelectWorkspace: (id: WorkspaceId) => void;
}) {
  if (groups.length === 0) {
    return <div className="px-3 py-2 text-sm text-zinc-400">No projects</div>;
  }

  return groups.map((group) => {
    const activeChatInGroup = group.sessions.some((session) => session.id === activeSessionId);
    return (
      <CodexSidebarRow
        active={Boolean(
          activeWorkspaceId && group.workspaceIds.includes(activeWorkspaceId) && !activeChatInGroup,
        )}
        icon={<FileText size={16} />}
        key={`${group.workspace.environmentId}:${group.workspace.path}`}
        label={group.workspace.name}
        onClick={() => onSelectWorkspace(group.workspace.id)}
        title={group.workspace.path}
      />
    );
  });
}

export function ChatRows({
  activeSessionId,
  groups,
  onSelectSession,
}: {
  readonly activeSessionId: SessionId | null;
  readonly groups: readonly ProjectGroupModel[];
  readonly onSelectSession: (id: SessionId) => void;
}) {
  const rows = groups.flatMap((group) =>
    group.sessions.map((session) => ({
      projectName: group.workspace.name,
      session,
    })),
  );
  if (rows.length === 0) {
    return <div className="px-3 py-2 text-sm text-zinc-400">No chats</div>;
  }

  return rows.map(({ projectName, session }) => (
    <CodexSidebarRow
      active={activeSessionId === session.id}
      ariaCurrent={activeSessionId === session.id ? "page" : undefined}
      ariaLabel={`Chat ${session.title}`}
      icon={<MessageSquare size={14} />}
      key={session.id}
      label={session.title}
      meta={groups.length > 1 ? projectName : undefined}
      onClick={() => onSelectSession(session.id)}
    />
  ));
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
    <CodexSidebarSection
      actionIcon={actionIcon}
      actionLabel={actionLabel}
      actionPressed={actionPressed}
      title={title}
      onAction={onAction}
    >
      {children}
    </CodexSidebarSection>
  );
}
