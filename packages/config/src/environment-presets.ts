import { environmentId } from "@toro/domain";
import type { EnvironmentProfile } from "@toro/domain";

export const environmentPresets: readonly EnvironmentProfile[] = [
  {
    description: "Runs ACP agents as local child processes through the desktop host.",
    id: environmentId("local-desktop"),
    kind: "local-desktop",
    name: "Local Desktop",
    status: "available",
  },
  {
    description: "Reserved Host API target for future remote machines and sandbox providers.",
    id: environmentId("remote-sandbox"),
    kind: "remote-sandbox",
    name: "Remote Sandbox",
    status: "unavailable",
  },
];
