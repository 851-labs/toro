import { isTauri } from "@tauri-apps/api/core";

const defaultWorkspace = import.meta.env.VITE_TORO_DEFAULT_WORKSPACE ?? "";

export async function pickProjectDirectory(): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open project",
    });
    return typeof selected === "string" ? selected : null;
  }

  if (defaultWorkspace.trim().length > 0) {
    return defaultWorkspace;
  }

  const selected = window.prompt("Project path");
  return selected?.trim() ? selected.trim() : null;
}
