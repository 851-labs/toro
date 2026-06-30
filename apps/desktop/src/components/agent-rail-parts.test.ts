import { describe, expect, it } from "vitest";
import { agentId, environmentId, sessionId, workspaceId } from "@toro/domain";
import type { Session, Workspace } from "@toro/domain";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatRows, groupWorkspaces } from "./agent-rail-parts";

describe("agent rail grouping", () => {
  it("keeps chats grouped by project and sorted by recency", () => {
    const toro = workspace("workspace-toro", "toro");
    const docs = workspace("workspace-docs", "docs");
    const groups = groupWorkspaces(
      [toro, docs],
      [
        session("session-toro", toro.id, "Toro UI pass", "2026-06-30T10:00:00.000Z"),
        session("session-docs", docs.id, "Docs UI pass", "2026-06-30T11:00:00.000Z"),
      ],
    );

    expect(chatTitles(groups)).toEqual(["Toro UI pass", "Docs UI pass"]);
  });

  it("renders project labels only for groups that contain chats", () => {
    const toro = workspace("workspace-toro", "toro");
    const docs = workspace("workspace-docs", "docs");
    const empty = workspace("workspace-empty", "empty");
    const groups = groupWorkspaces(
      [toro, docs, empty],
      [
        session("session-toro", toro.id, "Toro UI pass", "2026-06-30T10:00:00.000Z"),
        session("session-docs", docs.id, "Docs UI pass", "2026-06-30T11:00:00.000Z"),
      ],
    );

    const html = renderToStaticMarkup(
      createElement(ChatRows, {
        activeSessionId: null,
        groups,
        onSelectSession: () => undefined,
      }),
    );

    expect(html).toContain('data-sidebar-chat-project="true"');
    expect(html).toContain(">toro<");
    expect(html).toContain(">docs<");
    expect(html).not.toContain(">empty<");
  });
});

function workspace(id: string, name: string): Workspace {
  return {
    environmentId: environmentId("local-desktop"),
    id: workspaceId(id),
    name,
    path: `/tmp/${name}`,
  };
}

function session(
  id: string,
  workspace: Workspace["id"],
  title: string,
  updatedAt: string,
): Session {
  return {
    agentId: agentId("toro-demo"),
    createdAt: "2026-06-30T09:00:00.000Z",
    environmentId: environmentId("local-desktop"),
    id: sessionId(id),
    logs: [],
    messages: [],
    permissions: [],
    plan: [],
    status: "completed",
    thoughts: [],
    title,
    toolCalls: [],
    updatedAt,
    workspaceId: workspace,
  };
}

function chatTitles(
  groups: readonly { readonly sessions: readonly Session[] }[],
): readonly string[] {
  return groups.flatMap((group) => group.sessions.map((session) => session.title));
}
