import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function readWorkspaceTextFile(
  workspacePath: string,
  requestedPath: string,
  line?: number | null,
  limit?: number | null,
): Promise<string> {
  const content = await readFile(assertInsideWorkspace(workspacePath, requestedPath), "utf8");
  if (!line && !limit) {
    return content;
  }

  const lines = content.split("\n");
  const start = Math.max((line ?? 1) - 1, 0);
  const end = limit ? start + limit : undefined;
  return lines.slice(start, end).join("\n");
}

export async function writeWorkspaceTextFile(
  workspacePath: string,
  requestedPath: string,
  content: string,
): Promise<void> {
  await writeFile(assertInsideWorkspace(workspacePath, requestedPath), content, "utf8");
}

function assertInsideWorkspace(workspacePath: string, requestedPath: string): string {
  const workspaceRoot = resolve(workspacePath);
  const absolutePath = resolve(requestedPath);
  if (!absolutePath.startsWith(workspaceRoot)) {
    throw new Error("Refusing ACP file access outside the workspace");
  }
  return absolutePath;
}
