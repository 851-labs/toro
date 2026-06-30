import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  agentId,
  environmentId,
  type AgentId,
  type EnvironmentId,
  type WorkspaceId,
} from "@toro/domain";
import {
  ChevronDown,
  Code2,
  ListFilter,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  RefreshCw,
} from "lucide-react";
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
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  const activeWorkspace = useMemo(
    () =>
      state.workspaces.find(
        (workspace) => workspace.id === (selectedWorkspaceId ?? state.workspaces.at(-1)?.id),
      ) ?? null,
    [selectedWorkspaceId, state.workspaces],
  );
  const activeSession = useMemo(
    () =>
      state.sessions.find((session) => session.id === state.activeSessionId) ??
      state.sessions.at(-1) ??
      null,
    [state.activeSessionId, state.sessions],
  );
  const activeAgent = useMemo(
    () => state.agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [selectedAgentId, state.agents],
  );
  const activeEnvironment = useMemo(
    () =>
      state.environments.find((environment) => environment.id === selectedEnvironmentId) ?? null,
    [selectedEnvironmentId, state.environments],
  );

  const openWorkspace = useMutation({
    mutationFn: async () => hostClient.openWorkspace(workspacePath, selectedEnvironmentId),
    onSuccess: (workspace) => {
      setSelectedWorkspaceId(workspace.id);
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["host-state"] });
    },
  });

  return (
    <div className="grid h-full overflow-hidden bg-white text-zinc-950 md:grid-cols-[320px_minmax(0,1fr)]">
      <AgentRail
        activeWorkspace={activeWorkspace}
        agents={state.agents}
        environments={state.environments}
        error={error ?? openWorkspace.error?.message ?? createSession.error?.message ?? null}
        isLoading={isLoading}
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
        onSelectWorkspace={setSelectedWorkspaceId}
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
              <button
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
                aria-label="More chat actions"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : null}
              <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 font-medium text-zinc-700 shadow-sm">
                <Code2 size={16} />
                Open in
                <ChevronDown size={15} />
              </button>
              <button className="rounded-full p-2 hover:bg-zinc-100" aria-label="Chat settings">
                <ListFilter size={18} />
              </button>
              <button className="rounded-full p-2 hover:bg-zinc-100" aria-label="Toggle preview">
                <PanelRight size={18} />
              </button>
              <span className="sr-only">{activeEnvironment?.name ?? "Environment"}</span>
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
