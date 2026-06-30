import { basename, resolve } from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";
import type { Workspace } from "@toro/domain";
import { environmentId } from "@toro/domain";
import type { EnvironmentProvider, FileTreeEntry, OpenWorkspaceInput } from "./provider";

const MAX_DEPTH = 3;
const MAX_ENTRIES_PER_DIR = 80;
const IGNORED_NAMES = new Set([".artifacts", ".git", ".turbo", "dist", "node_modules", "target"]);

export class LocalDesktopEnvironment implements EnvironmentProvider {
  readonly id = environmentId("local-desktop");

  async openWorkspace(input: OpenWorkspaceInput): Promise<Workspace> {
    const absolutePath = resolve(input.path);
    const info = await stat(absolutePath);
    if (!info.isDirectory()) {
      throw new Error(`Workspace path is not a directory: ${absolutePath}`);
    }

    return {
      environmentId: input.environmentId,
      id: input.id,
      name: basename(absolutePath) || absolutePath,
      path: absolutePath,
    };
  }

  async listFiles(workspace: Workspace): Promise<readonly FileTreeEntry[]> {
    return readDirectory(workspace.path, 0);
  }

  async readTextFile(workspace: Workspace, path: string): Promise<string> {
    const absolutePath = resolve(workspace.path, path);
    if (!absolutePath.startsWith(resolve(workspace.path))) {
      throw new Error("Refusing to read outside the workspace");
    }
    return readFile(absolutePath, "utf8");
  }
}

async function readDirectory(path: string, depth: number): Promise<readonly FileTreeEntry[]> {
  if (depth > MAX_DEPTH) {
    return [];
  }

  const entries = await readdir(path, { withFileTypes: true });
  const visible = entries
    .filter((entry) => !IGNORED_NAMES.has(entry.name))
    .sort(
      (left, right) =>
        Number(right.isDirectory()) - Number(left.isDirectory()) ||
        left.name.localeCompare(right.name),
    )
    .slice(0, MAX_ENTRIES_PER_DIR);

  return Promise.all(
    visible.map(async (entry): Promise<FileTreeEntry> => {
      const childPath = resolve(path, entry.name);
      if (!entry.isDirectory()) {
        return { kind: "file", name: entry.name, path: childPath };
      }
      return {
        children: await readDirectory(childPath, depth + 1),
        kind: "directory",
        name: entry.name,
        path: childPath,
      };
    }),
  );
}
