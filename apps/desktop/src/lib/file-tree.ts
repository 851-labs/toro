import type { FileTreeEntry } from "@toro/environments";

export function flattenFileEntries(entries: readonly FileTreeEntry[]): readonly FileTreeEntry[] {
  return entries.flatMap((entry) => {
    if (entry.kind === "file") {
      return [entry];
    }
    return flattenFileEntries(entry.children ?? []);
  });
}

export function defaultPreviewFilePath(entries: readonly FileTreeEntry[]): string | null {
  const files = flattenFileEntries(entries);
  const projectFiles = files.filter((entry) => !entry.path.includes("/.repos/"));
  const packageFiles = projectFiles
    .filter((entry) => entry.name === "package.json")
    .toSorted((left, right) => pathDepth(left.path) - pathDepth(right.path));
  return packageFiles[0]?.path ?? projectFiles[0]?.path ?? files[0]?.path ?? null;
}

function pathDepth(path: string) {
  return path.split("/").filter(Boolean).length;
}
