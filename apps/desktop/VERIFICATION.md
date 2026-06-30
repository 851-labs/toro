# Desktop Verification Notes

## Current Codex UI Fidelity Index

This file is the current verification index for the Toro desktop Codex-fidelity work. The full
historical evidence log for the June 30 pass is archived at:

- `apps/desktop/verification/2026-06-30-codex-ui-fidelity.md`

Current reference evidence:

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`

Latest verified desktop artifacts:

- Desktop capture: `.artifacts/verification/2026-06-30T18-22-58-026Z/page@a46228b1852e59379c30d769f0787dea.webm`
- Desktop stills: `.artifacts/verification/2026-06-30T18-22-58-026Z/*.png`
- Grouped-sidebar capture: `.artifacts/verification/sidebar-groups/2026-06-30T15-10-20-395Z/page@d9d7ed776cdd64de9144ac1f4a6ab547.webm`
- Grouped-sidebar still: `.artifacts/verification/sidebar-groups/2026-06-30T15-10-20-395Z/01-project-grouped-chats.png`
- Internal capture: `.artifacts/verification/internal/2026-06-30T18-37-10-487Z/page@3fe12087bfdec3ce860bf61f2de93f82.webm`
- Internal stills: `.artifacts/verification/internal/2026-06-30T18-37-10-487Z/*.png`
- Native still: `.artifacts/verification/native/2026-06-30-native-project-picker.png`

Most recent manual checks:

- Confirmed the desktop sidebar renders Plugins as a passive non-button until the feature is wired.
- Confirmed assistant message actions omit thumbs up/down feedback buttons.
- Confirmed a single chat renders two user/assistant turns with thinking and grouped tool-call blocks in the assistant response flow.
- Confirmed completed thinking rows and grouped tool-call blocks use shared Codex-like collapsible activity summaries.
- Confirmed thinking and tool-call collapsible panels use the shared animated Base UI panel wrapper.
- Confirmed shared buttons, composer selects, and activity collapsibles are built on Base UI primitives.
- Confirmed streaming assistant markdown renders through Streamdown and completed chat markdown renders through React Markdown.
- Confirmed streaming assistant and thinking text no longer append an inline cursor dot.
- Confirmed composer plain Enter submits the message and Shift+Enter inserts a newline.
- Confirmed the composer no longer renders the passive microphone affordance.
- Confirmed completed tool-call status renders as muted transcript metadata instead of bright emerald text.
- Confirmed assistant messages use a wider Codex-like transcript rail instead of the previous narrow 72% cap.
- Confirmed assistant messages default to the wider rail without an expand/collapse message action.
- Confirmed the UI verifier resets host state before loading the desktop shell.
- Confirmed the desktop sidebar renders Codex-like top-level Projects and Chats sections.
- Confirmed the desktop New chat command opens the project picker before a project exists.
- Confirmed the desktop Projects add action opens the native macOS Finder directory picker and no longer renders an in-app path form.
- Confirmed the desktop sidebar Search command and project/chat filtering UI are removed.
- Confirmed the desktop sidebar Scheduled command is removed.
- Confirmed the desktop Chats section shows chats grouped by project across opened projects.
- Confirmed the transcript and composer use a narrower Codex-like centered rail.
- Confirmed pending permission tool calls appear in the transcript before approval.
- Confirmed pending and running tool-call statuses show a live Codex-like activity dot.
- Confirmed multiple tool calls group behind one disclosure, and expanding it reveals each individual tool call.
- Confirmed tool-call rows render with quieter Codex-like spacing, width, and no persistent card-like hover fill.
- Confirmed expanded plan rows use muted transcript metadata instead of bright status colors.
- Confirmed the chat header includes a Codex-like controls glyph that opens session details.
- Confirmed the internal app catalogs both live and completed tool-call states.
- Confirmed the internal app catalogs project-grouped sidebar chats.
- Confirmed the internal app sidebar header no longer renders the T circle logo.
- Confirmed the internal app uses TanStack Start routes for each sidebar item instead of local view state.
- Confirmed the internal app sidebar uses a 256px rail, 12px content padding, and 28px rows at 13px type.
- Confirmed desktop and internal dev scripts defer host and port settings to their Vite configs.
- Confirmed desktop and internal Vite client types live in app tsconfigs instead of separate vite-env files.
- Confirmed empty newly-created sessions use a Codex-like New chat title until the first prompt renames them.
- Confirmed the chat header includes a Codex-like editor-pane toggle that opens a Host API backed file preview.
- Confirmed native Tauri renders the latest Codex-like chat shell after rebuild.

Automated verification:

- `bun run fmt`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`
- `bun run verify`
- `TORO_VERIFY_STEP_DELAY_MS=200 bun run verify:ui`
- `TORO_VERIFY_STEP_DELAY_MS=200 bun run verify:internal`
- `bun --filter @toro/desktop tauri build --debug --bundles app`
