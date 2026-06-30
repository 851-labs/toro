import { describe, expect, it } from "vitest";
import type { FileTreeEntry } from "@toro/environments";
import { defaultPreviewFilePath, flattenFileEntries } from "./file-tree";

describe("file tree helpers", () => {
  it("flattens nested file entries in display order", () => {
    expect(flattenFileEntries(fileTree).map((entry) => entry.path)).toEqual([
      "/repo/apps/desktop/src/app.tsx",
      "/repo/package.json",
      "/repo/README.md",
    ]);
  });

  it("prefers package.json for the default preview pane", () => {
    expect(defaultPreviewFilePath(fileTree)).toBe("/repo/package.json");
  });

  it("prefers project files over vendored .repos files", () => {
    expect(
      defaultPreviewFilePath([
        { kind: "file", name: "package.json", path: "/repo/apps/desktop/package.json" },
        { kind: "file", name: "package.json", path: "/repo/.repos/sdk/package.json" },
        { kind: "file", name: "package.json", path: "/repo/package.json" },
      ]),
    ).toBe("/repo/package.json");
  });

  it("falls back to the first available file", () => {
    expect(
      defaultPreviewFilePath([{ kind: "file", name: "README.md", path: "/repo/README.md" }]),
    ).toBe("/repo/README.md");
  });
});

const fileTree: readonly FileTreeEntry[] = [
  {
    children: [
      {
        children: [{ kind: "file", name: "app.tsx", path: "/repo/apps/desktop/src/app.tsx" }],
        kind: "directory",
        name: "desktop",
        path: "/repo/apps/desktop",
      },
    ],
    kind: "directory",
    name: "apps",
    path: "/repo/apps",
  },
  { kind: "file", name: "package.json", path: "/repo/package.json" },
  { kind: "file", name: "README.md", path: "/repo/README.md" },
];
