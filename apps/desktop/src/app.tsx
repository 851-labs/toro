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
import { EditorPane } from "./components/editor-pane";
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
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<WorkspaceId | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<SessionId | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

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
      setSelectedFilePath(null);
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
    setSelectedFilePath(null);
    setSelectedSessionId(
      state.sessions.findLast((session) => session.workspaceId === workspaceId)?.id ?? null,
    );
  }

  function selectSession(sessionId: SessionId) {
    const session = state.sessions.find((candidate) => candidate.id === sessionId);
    if (session) {
      setSelectedWorkspaceId(session.workspaceId);
      setSelectedSessionId(session.id);
      setSelectedFilePath(null);
    }
  }

  return (
    <div className="grid h-full overflow-hidden bg-white text-zinc-950 md:grid-cols-[320px_minmax(0,1fr)]">
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
        selectedFilePath={selectedFilePath}
        sessions={state.sessions}
        streamStatus={streamStatus}
        workspacePath={workspacePath}
        workspaces={state.workspaces}
        onSelectAgent={setSelectedAgentId}
        onSelectEnvironment={setSelectedEnvironmentId}
        onSelectFile={setSelectedFilePath}
        onSelectSession={selectSession}
        onSelectWorkspace={selectWorkspace}
        onWorkspacePathChange={setWorkspacePath}
      />
      <main
        className={
          selectedFilePath
            ? "grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_minmax(360px,440px)]"
            : "grid min-h-0 min-w-0 grid-cols-1"
        }
      >
        <section className="grid min-h-0 min-w-0 grid-rows-[64px_1fr] bg-white">
          <header className="flex items-center justify-between border-b border-zinc-200/80 px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="text-zinc-500">
                <PanelLeft size={18} />
              </div>
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
            workspaceName={activeWorkspace?.name ?? null}
          />
        </section>
        {selectedFilePath ? (
          <EditorPane filePath={selectedFilePath} workspace={activeWorkspace} />
        ) : null}
      </main>
    </div>
  );
}
