# Desktop Verification Notes

## Current Codex UI Fidelity Index

This file is the current verification index for the Toro desktop Codex-fidelity work. The full
historical evidence log for the June 30 pass is archived at:

- `apps/desktop/verification/2026-06-30-codex-ui-fidelity.md`

Current reference evidence:

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`

Latest verified desktop artifacts:

- Desktop capture: `.artifacts/verification/2026-06-30T15-27-45-136Z/page@81412b173dc6280ae3055c3e973edf46.webm`
- Desktop stills: `.artifacts/verification/2026-06-30T15-27-45-136Z/*.png`
- Grouped-sidebar capture: `.artifacts/verification/sidebar-groups/2026-06-30T15-10-20-395Z/page@d9d7ed776cdd64de9144ac1f4a6ab547.webm`
- Grouped-sidebar still: `.artifacts/verification/sidebar-groups/2026-06-30T15-10-20-395Z/01-project-grouped-chats.png`
- Design-guide capture: `.artifacts/verification/design-guide/2026-06-30T15-30-52-932Z/page@3105c0e5b0d76b93912f15531c84aabb.webm`
- Design-guide stills: `.artifacts/verification/design-guide/2026-06-30T15-30-52-932Z/*.png`
- Native still: `.artifacts/verification/native/2026-06-30-header-controls-button.png`

Most recent manual checks:

- Confirmed the desktop sidebar no longer renders inert Scheduled or Plugins rows until those features are wired.
- Confirmed completed tool-call status renders as muted transcript metadata instead of bright emerald text.
- Confirmed assistant messages use a wider Codex-like transcript rail instead of the previous narrow 72% cap.
- Confirmed the UI verifier resets host state before loading the desktop shell.
- Confirmed the desktop sidebar renders Codex-like top-level Projects and Chats sections.
- Confirmed the desktop New chat command opens the project picker before a project exists.
- Confirmed the desktop Chats section shows chats grouped by project across opened projects.
- Confirmed the transcript and composer use a narrower Codex-like centered rail.
- Confirmed pending permission tool calls appear in the transcript before approval.
- Confirmed pending and running tool-call statuses show a live Codex-like activity dot.
- Confirmed expanded plan rows use muted transcript metadata instead of bright status colors.
- Confirmed the chat header includes a Codex-like controls glyph that opens session details.
- Confirmed the design guide catalogs both live and completed tool-call states.
- Confirmed the design guide catalogs project-grouped sidebar chats.
- Confirmed native Tauri renders the latest Codex-like chat shell after rebuild.

Automated verification:

- `bun run fmt`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`
- `bun run verify`
- `TORO_VERIFY_STEP_DELAY_MS=200 bun run verify:ui`
- `TORO_VERIFY_STEP_DELAY_MS=200 bun run verify:design-guide`
- `bun --filter @toro/desktop tauri build --debug --bundles app`
