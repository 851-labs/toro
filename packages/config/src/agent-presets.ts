import { agentId } from "@toro/domain";
import type { AgentProfile } from "@toro/domain";

export const agentPresets: readonly AgentProfile[] = [
  {
    authHint: "Deterministic local ACP agent for screenshots, tests, and offline verification.",
    command: {
      args: ["src/demo-agent.ts"],
      command: "bun",
    },
    description: "Repeatable ACP agent used to validate Toro flows without model calls.",
    enabled: true,
    id: agentId("toro-demo"),
    name: "Toro Demo",
    transport: { kind: "stdio" },
    vendor: "toro-demo",
  },
  {
    authHint: "Uses the Codex ACP adapter. Configure CODEX_PATH or auth env vars if needed.",
    command: {
      args: ["-y", "@agentclientprotocol/codex-acp"],
      command: "npx",
    },
    description: "OpenAI Codex through the official ACP adapter.",
    enabled: true,
    id: agentId("codex"),
    name: "Codex",
    transport: { kind: "stdio" },
    vendor: "codex",
  },
  {
    authHint: "Uses the Claude Agent ACP adapter and your local Claude/Anthropic credentials.",
    command: {
      args: ["-y", "@agentclientprotocol/claude-agent-acp"],
      command: "npx",
    },
    description: "Claude Agent SDK through the official ACP adapter.",
    enabled: true,
    id: agentId("claude"),
    name: "Claude",
    transport: { kind: "stdio" },
    vendor: "claude",
  },
  {
    authHint: "Uses the installed OpenCode CLI ACP stdio server.",
    command: {
      args: ["acp", "--cwd", "{workspacePath}"],
      command: "opencode",
    },
    description: "OpenCode through its ACP command.",
    enabled: true,
    id: agentId("opencode"),
    name: "OpenCode",
    transport: { kind: "stdio" },
    vendor: "opencode",
  },
];
