# Toro

Toro is an Agent Client Protocol desktop client built with Tauri, React, Bun,
Turbo, Tailwind, TanStack, Effect, and strict TypeScript.

The MVP is local-first: the desktop shell talks to a local host process that owns
ACP sessions and launches configurable ACP agent commands. The frontend depends
on a host API abstraction so the same workbench can later run in a browser
against remote sandbox or machine environments.

## Commands

```bash
bun install
bun run dev
bun run host:dev
bun run desktop:dev
bun run verify
```

Verification artifacts are written to `.artifacts/verification/` and ignored by
Git.
