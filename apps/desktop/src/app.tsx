import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentId,
  environmentId,
  type AgentId,
  type EnvironmentId,
  type SessionId,
  type WorkspaceId,
} from "@toro/domain";
import { CodexChatHeader } from "@toro/ui";
import { ListFilter, NotebookTabs, PanelLeft, PanelRight, PanelTop, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AgentRail } from "./components/agent-rail";
import { ChatHeaderActions } from "./components/chat-header-actions";
import { ChatPanel } from "./components/chat-panel";
import { EditorPane } from "./components/editor-pane";
import { InspectorPanel } from "./components/inspector-panel";
import { OpenInMenu } from "./components/open-in-menu";
import { defaultPreviewFilePath } from "./lib/file-tree";
import { hostClient } from "./lib/host-client";
import { useHostState } from "./lib/use-host-state";

const defaultWorkspace = import.meta.env.VITE_TORO_DEFAULT_WORKSPACE ?? "";

interface NavigationEntry {
  readonly sessionId: SessionId | null;
  readonly workspaceId: WorkspaceId | null;
}

export function App() {
  const queryClient = useQueryClient();
  const { state, streamStatus, error, isLoading } = useHostState();
  const [workspacePath, setWorkspacePath] = useState(defaultWorkspace);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>(agentId("toro-demo"));
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<EnvironmentId>(
    environmentId("local-desktop"),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<WorkspaceId | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<SessionId | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<readonly NavigationEntry[]>([]);
  const [navigationIndex, setNavigationIndex] = useState(-1);

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
  const activeSession = useMemo(() => {
    const hostActiveSession =
      state.sessions.find(
        (session) =>
          session.id === state.activeSessionId && session.workspaceId === activeWorkspace?.id,
      ) ?? null;
    if (selectedSessionId) return selectedSession ?? hostActiveSession;
    if (selectedWorkspaceId) return null;
    return (
      hostActiveSession ??
      state.sessions.findLast((session) => session.workspaceId === activeWorkspace?.id) ??
      null
    );
  }, [
    activeWorkspace?.id,
    selectedSession,
    selectedSessionId,
    selectedWorkspaceId,
    state.activeSessionId,
    state.sessions,
  ]);
  const files = useQuery({
    enabled: Boolean(activeWorkspace),
    queryFn: () => hostClient.listFiles(activeWorkspace!.id),
    queryKey: ["editor-files", activeWorkspace?.id],
  });
  const previewFilePath = useMemo(() => defaultPreviewFilePath(files.data ?? []), [files.data]);
  const openWorkspace = useMutation({
    mutationFn: async () => hostClient.openWorkspace(workspacePath, selectedEnvironmentId),
    onSuccess: (workspace) => {
      setSelectedWorkspaceId(workspace.id);
      setSelectedSessionId(null);
      recordNavigation({ sessionId: null, workspaceId: workspace.id });
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
      recordNavigation({
        sessionId: result.sessionId,
        workspaceId: activeWorkspace?.id ?? selectedWorkspaceId,
      });
      void queryClient.invalidateQueries({ queryKey: ["host-state"] });
    },
  });

  function selectWorkspace(workspaceId: WorkspaceId) {
    const sessionId =
      state.sessions.findLast((session) => session.workspaceId === workspaceId)?.id ?? null;
    setSelectedWorkspaceId(workspaceId);
    setSelectedSessionId(sessionId);
    recordNavigation({ sessionId, workspaceId });
  }

  function selectSession(sessionId: SessionId) {
    const session = state.sessions.find((candidate) => candidate.id === sessionId);
    if (session) {
      setSelectedWorkspaceId(session.workspaceId);
      setSelectedSessionId(session.id);
      recordNavigation({ sessionId: session.id, workspaceId: session.workspaceId });
    }
  }

  function recordNavigation(entry: NavigationEntry) {
    if (navigationIndex >= 0 && sameEntry(navigationHistory.at(navigationIndex) ?? null, entry)) {
      return;
    }
    const nextHistory = [...navigationHistory.slice(0, navigationIndex + 1), entry];
    setNavigationHistory(nextHistory);
    setNavigationIndex(nextHistory.length - 1);
  }

  function applyNavigation(entry: NavigationEntry) {
    setSelectedWorkspaceId(entry.workspaceId);
    setSelectedSessionId(entry.sessionId);
  }

  function navigateBack() {
    const nextIndex = Math.max(0, navigationIndex - 1);
    const entry = navigationHistory.at(nextIndex);
    if (entry) applyNavigation(entry);
    setNavigationIndex(nextIndex);
  }

  function navigateForward() {
    const nextIndex = Math.min(navigationHistory.length - 1, navigationIndex + 1);
    const entry = navigationHistory.at(nextIndex);
    if (entry) applyNavigation(entry);
    setNavigationIndex(nextIndex);
  }

  return (
    <div
      className={
        sidebarOpen
          ? "grid h-full overflow-hidden bg-white text-zinc-950 dark:bg-[#101010] dark:text-zinc-100 md:grid-cols-[390px_minmax(0,1fr)]"
          : "grid h-full grid-cols-1 overflow-hidden bg-white text-zinc-950 dark:bg-[#101010] dark:text-zinc-100"
      }
    >
      {sidebarOpen ? (
        <AgentRail
          activeWorkspace={activeWorkspace}
          agents={state.agents}
          environments={state.environments}
          error={error ?? openWorkspace.error?.message ?? createSession.error?.message ?? null}
          activeSessionId={selectedSessionId ?? activeSession?.id ?? null}
          canNavigateBack={navigationIndex > 0}
          canNavigateForward={navigationIndex < navigationHistory.length - 1}
          onCreateSession={() => createSession.mutate()}
          onNavigateBack={navigateBack}
          onNavigateForward={navigateForward}
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
        <section className="grid min-h-0 min-w-0 grid-rows-[64px_1fr] bg-white dark:bg-[#101010]">
          <CodexChatHeader
            actions={
              activeSession ? (
                <ChatHeaderActions
                  title={activeSession.title}
                  workspacePath={activeWorkspace?.path ?? null}
                />
              ) : null
            }
            leading={
              sidebarOpen && activeSession ? (
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center text-zinc-500"
                >
                  <NotebookTabs size={18} />
                </span>
              ) : (
                <button
                  aria-expanded={sidebarOpen}
                  aria-label="Toggle sidebar"
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  onClick={() => setSidebarOpen(true)}
                  type="button"
                >
                  <PanelLeft size={18} />
                </button>
              )
            }
            rightActions={
              <>
                {activeWorkspace && activeSession ? (
                  <OpenInMenu
                    workspaceId={activeWorkspace.id}
                    workspacePath={activeWorkspace.path}
                  />
                ) : null}
                {activeSession ? (
                  <button
                    aria-expanded={detailsOpen}
                    aria-label="Toggle session controls"
                    className={
                      detailsOpen
                        ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900"
                        : "flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    }
                    onClick={() => setDetailsOpen((open) => !open)}
                    type="button"
                  >
                    <ListFilter size={18} />
                  </button>
                ) : null}
                {activeWorkspace && activeSession ? (
                  <button
                    aria-expanded={editorOpen}
                    aria-label="Toggle editor pane"
                    className={
                      editorOpen
                        ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900"
                        : "flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    }
                    onClick={() => setEditorOpen((open) => !open)}
                    type="button"
                  >
                    <PanelTop size={18} />
                  </button>
                ) : null}
                {activeSession ? (
                  <button
                    aria-expanded={detailsOpen}
                    aria-label="Toggle session details"
                    className={
                      detailsOpen
                        ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900"
                        : "flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    }
                    onClick={() => setDetailsOpen((open) => !open)}
                    type="button"
                  >
                    <PanelRight size={18} />
                  </button>
                ) : null}
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : null}
              </>
            }
            title={activeSession?.title ?? null}
          />
          <div
            className={
              activeSession
                ? activeLayoutClassName(editorOpen, detailsOpen)
                : "grid min-h-0 min-w-0 grid-cols-1"
            }
          >
            <ChatPanel session={activeSession} workspace={activeWorkspace} />
            {editorOpen && activeSession ? (
              <EditorPane filePath={previewFilePath} workspace={activeWorkspace} />
            ) : null}
            {detailsOpen && activeSession ? <InspectorPanel session={activeSession} /> : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function activeLayoutClassName(editorOpen: boolean, detailsOpen: boolean) {
  if (editorOpen && detailsOpen) {
    return "grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_minmax(300px,34vw)_320px]";
  }
  if (editorOpen) {
    return "grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_minmax(340px,38vw)]";
  }
  if (detailsOpen) {
    return "grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_320px]";
  }
  return "grid min-h-0 min-w-0 grid-cols-1";
}

function sameEntry(left: NavigationEntry | null, right: NavigationEntry) {
  return left?.sessionId === right.sessionId && left.workspaceId === right.workspaceId;
}
