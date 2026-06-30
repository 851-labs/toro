import type { EnvironmentId, WorkspaceId } from "@toro/domain";
import type { Workspace } from "@toro/domain";

export interface FileTreeEntry {
  readonly name: string;
  readonly path: string;
  readonly kind: "file" | "directory";
  readonly children?: readonly FileTreeEntry[];
}

export interface OpenWorkspaceInput {
  readonly id: WorkspaceId;
  readonly path: string;
  readonly environmentId: EnvironmentId;
}

export interface EnvironmentProvider {
  readonly id: EnvironmentId;
  openWorkspace(input: OpenWorkspaceInput): Promise<Workspace>;
  listFiles(workspace: Workspace): Promise<readonly FileTreeEntry[]>;
  readTextFile(workspace: Workspace, path: string): Promise<string>;
}
