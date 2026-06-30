import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  agentId,
  environmentId,
  type AgentId,
  type EnvironmentId,
  type SessionId,
  type WorkspaceId,
} from "@toro/domain";
import { PanelLeft, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentRail } from "./components/agent-rail";
import { ChatPanel } from "./components/chat-panel";
import { hostClient } from "./lib/host-client";
import { useHostState } from "./lib/use-host-state";

const defaultWorkspace = import.meta.env.VITE_TORO_DEFAULT_WORKSPACE ?? "";

export function App() {
  const queryClient = useQueryClient();
  const { state, streamStatus, error, isLoading } = useHostState();
  const [workspacePath, setWorkspacePath] = useState(defaultWorkspace);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>(agentId("toro-demo"));
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<EnvironmentId>(
    environmentId("local-desktop"),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<WorkspaceId | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<SessionId | null>(null);

  const selectedSession = useMemo(
    () => state.sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, state.sessions],
  );
  const activeWorkspace = useMemo(
    () =>
      state.workspaces.find(
        (workspace) =>
          workspace.id ===
          (selectedWorkspaceId ?? selectedSession?.workspaceId ?? state.workspaces.at(-1)?.id),
      ) ?? null,
    [selectedSession?.workspaceId, selectedWorkspaceId, state.workspaces],
  );
  const activeSession = useMemo(
    () =>
      selectedSession ??
      state.sessions.find(
        (session) =>
          session.id === state.activeSessionId && session.workspaceId === activeWorkspace?.id,
      ) ??
      state.sessions.findLast((session) => session.workspaceId === activeWorkspace?.id) ??
      null,
    [activeWorkspace?.id, selectedSession, state.activeSessionId, state.sessions],
  );
  const activeAgent = useMemo(
    () => state.agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [selectedAgentId, state.agents],
  );
  const openWorkspace = useMutation({
    mutationFn: async () => hostClient.openWorkspace(workspacePath, selectedEnvironmentId),
    onSuccess: (workspace) => {
      setSelectedWorkspaceId(workspace.id);
      setSelectedSessionId(null);
      void queryClient.invalidateQueries({ queryKey: ["host-state"] });
      void queryClient.invalidateQueries({ queryKey: ["files", workspace.id] });
    },
  });

  const createSession = useMutation({
    mutationFn: async () => {
      if (!activeWorkspace) {
        throw new Error("Open a workspace first");
      }
      return hostClient.createSession({
        agentId: selectedAgentId,
        environmentId: selectedEnvironmentId,
        workspaceId: activeWorkspace.id,
      });
    },
    onSuccess: (result) => {
      setSelectedSessionId(result.sessionId);
      void queryClient.invalidateQueries({ queryKey: ["host-state"] });
    },
  });

  function selectWorkspace(workspaceId: WorkspaceId) {
    setSelectedWorkspaceId(workspaceId);
    setSelectedSessionId(
      state.sessions.findLast((session) => session.workspaceId === workspaceId)?.id ?? null,
    );
  }

  function selectSession(sessionId: SessionId) {
    const session = state.sessions.find((candidate) => candidate.id === sessionId);
    if (session) {
      setSelectedWorkspaceId(session.workspaceId);
      setSelectedSessionId(session.id);
    }
  }

  return (
    <div
      className={
        sidebarOpen
          ? "grid h-full overflow-hidden bg-white text-zinc-950 md:grid-cols-[320px_minmax(0,1fr)]"
          : "grid h-full grid-cols-1 overflow-hidden bg-white text-zinc-950"
      }
    >
      {sidebarOpen ? (
        <AgentRail
          activeWorkspace={activeWorkspace}
          agents={state.agents}
          environments={state.environments}
          error={error ?? openWorkspace.error?.message ?? createSession.error?.message ?? null}
          activeSessionId={activeSession?.id ?? null}
          onCreateSession={() => createSession.mutate()}
          onOpenWorkspace={() => openWorkspace.mutate()}
          selectedAgentId={selectedAgentId}
          selectedEnvironmentId={selectedEnvironmentId}
          sessions={state.sessions}
          streamStatus={streamStatus}
          workspacePath={workspacePath}
          workspaces={state.workspaces}
          onSelectAgent={setSelectedAgentId}
          onSelectEnvironment={setSelectedEnvironmentId}
          onSelectSession={selectSession}
          onSelectWorkspace={selectWorkspace}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onWorkspacePathChange={setWorkspacePath}
        />
      ) : null}
      <main className="grid min-h-0 min-w-0 grid-cols-1">
        <section className="grid min-h-0 min-w-0 grid-rows-[64px_1fr] bg-white">
          <header className="flex items-center justify-between border-b border-zinc-200/80 px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-expanded={sidebarOpen}
                aria-label="Toggle sidebar"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setSidebarOpen((open) => !open)}
                type="button"
              >
                <PanelLeft size={18} />
              </button>
              <h1 className="truncate text-lg font-semibold">
                {activeSession?.title ?? "New chat"}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : null}
            </div>
          </header>
          <ChatPanel
            agentName={activeAgent?.name ?? "Agent"}
            session={activeSession}
            workspace={activeWorkspace}
          />
        </section>
      </main>
    </div>
  );
}
