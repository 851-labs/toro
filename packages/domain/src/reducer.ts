import { messageId } from "./ids";
import type { HostEvent } from "./events";
import type { ChatMessage, Session, ToroState } from "./model";

export const emptyToroState: ToroState = {
  activeSessionId: null,
  agents: [],
  environments: [],
  sessions: [],
  workspaces: [],
};

export function applyHostEvent(state: ToroState, event: HostEvent): ToroState {
  switch (event.type) {
    case "catalog_loaded":
      return { ...state, agents: event.agents, environments: event.environments };
    case "workspace_opened":
      return { ...state, workspaces: upsertById(state.workspaces, event.workspace) };
    case "session_created":
      return {
        ...state,
        activeSessionId: event.sessionId,
        sessions: upsertById(state.sessions, {
          agentId: event.agentId,
          createdAt: event.createdAt,
          environmentId: event.environmentId,
          id: event.sessionId,
          logs: [],
          messages: [],
          permissions: [],
          plan: [],
          status: "idle",
          title: event.title,
          toolCalls: [],
          updatedAt: event.createdAt,
          workspaceId: event.workspaceId,
        }),
      };
    case "session_status_changed":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        status: event.status,
        updatedAt: event.at,
      }));
    case "message_appended":
      return updateSession(state, event.message.sessionId, (session) => ({
        ...session,
        messages: upsertById(session.messages, event.message),
        updatedAt: event.message.createdAt,
      }));
    case "message_delta":
      return appendMessageDelta(state, event);
    case "message_completed":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        messages: session.messages.map((message) =>
          message.id === event.messageId ? { ...message, status: "complete" } : message,
        ),
        updatedAt: event.at,
      }));
    case "tool_call_updated":
      return updateSession(state, event.toolCall.sessionId, (session) => ({
        ...session,
        toolCalls: upsertById(session.toolCalls, event.toolCall),
        updatedAt: event.toolCall.updatedAt,
      }));
    case "plan_updated":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        plan: event.entries,
      }));
    case "permission_requested":
      return updateSession(state, event.toolCall.sessionId, (session) => ({
        ...session,
        permissions: upsertById(session.permissions, {
          createdAt: event.at,
          id: event.requestId,
          options: event.options,
          sessionId: event.toolCall.sessionId,
          toolCall: event.toolCall,
        }),
        status: "waiting",
      }));
    case "permission_resolved":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        permissions: session.permissions.filter((request) => request.id !== event.requestId),
        status: "running",
      }));
    case "session_log":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        logs: [...session.logs, `[${event.at}] ${event.line}`].slice(-200),
      }));
    case "session_failed":
      return updateSession(state, event.sessionId, (session) => ({
        ...session,
        logs: [...session.logs, event.message],
        status: "failed",
        updatedAt: event.at,
      }));
  }
}

function appendMessageDelta(
  state: ToroState,
  event: Extract<HostEvent, { type: "message_delta" }>,
): ToroState {
  return updateSession(state, event.sessionId, (session) => {
    const existing = session.messages.find((message) => message.id === event.messageId);
    const messages = existing
      ? session.messages.map((message) =>
          message.id === event.messageId
            ? { ...message, content: `${message.content}${event.delta}` }
            : message,
        )
      : [...session.messages, streamingMessage(event)];
    return { ...session, messages, updatedAt: event.at };
  });
}

function streamingMessage(event: Extract<HostEvent, { type: "message_delta" }>): ChatMessage {
  return {
    content: event.delta,
    createdAt: event.at,
    id: messageId(event.messageId),
    role: event.role,
    sessionId: event.sessionId,
    status: "streaming",
  };
}

function updateSession(
  state: ToroState,
  sessionIdValue: string,
  update: (session: Session) => Session,
): ToroState {
  return {
    ...state,
    sessions: state.sessions.map((session) =>
      session.id === sessionIdValue ? update(session) : session,
    ),
  };
}

function upsertById<Item extends { readonly id: string }>(
  items: readonly Item[],
  item: Item,
): readonly Item[] {
  const exists = items.some((current) => current.id === item.id);
  return exists
    ? items.map((current) => (current.id === item.id ? item : current))
    : [...items, item];
}
