import { environmentId } from "@toro/domain";
import type { Workspace } from "@toro/domain";
import type { EnvironmentProvider, FileTreeEntry, OpenWorkspaceInput } from "./provider";

export class RemoteSandboxEnvironment implements EnvironmentProvider {
  readonly id = environmentId("remote-sandbox");

  openWorkspace(_input: OpenWorkspaceInput): Promise<Workspace> {
    return Promise.reject(new Error("Remote sandbox environments are not implemented in the MVP."));
  }

  listFiles(_workspace: Workspace): Promise<readonly FileTreeEntry[]> {
    return Promise.reject(new Error("Remote sandbox environments are not implemented in the MVP."));
  }

  readTextFile(_workspace: Workspace, _path: string): Promise<string> {
    return Promise.reject(new Error("Remote sandbox environments are not implemented in the MVP."));
  }
}
