# Desktop Verification Notes

## Current Codex UI Fidelity Index

This file is the current verification index for the Toro desktop Codex-fidelity work. The full
historical evidence log for the June 30 pass is archived at:

- `apps/desktop/verification/2026-06-30-codex-ui-fidelity.md`

Current reference evidence:

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`

Latest verified desktop artifacts:

- Desktop capture: `.artifacts/verification/2026-06-30T14-58-35-788Z/page@acf2aa0c698637a443b39e2a784f0132.webm`
- Desktop stills: `.artifacts/verification/2026-06-30T14-58-35-788Z/*.png`
- Design-guide capture: `.artifacts/verification/design-guide/2026-06-30T14-59-02-575Z/page@c723759ae5e63430776322789816a384.webm`
- Design-guide stills: `.artifacts/verification/design-guide/2026-06-30T14-59-02-575Z/*.png`
- Native still: `.artifacts/verification/native/2026-06-30-live-tool-status.png`

Most recent manual checks:

- Confirmed the desktop sidebar no longer renders inert Scheduled or Plugins rows until those features are wired.
- Confirmed completed tool-call status renders as muted transcript metadata instead of bright emerald text.
- Confirmed assistant messages use a wider Codex-like transcript rail instead of the previous narrow 72% cap.
- Confirmed the UI verifier resets host state before loading the desktop shell.
- Confirmed the desktop sidebar renders Codex-like top-level Projects and Chats sections.
- Confirmed the desktop Chats section is scoped to the active project outside search mode.
- Confirmed the transcript and composer use a narrower Codex-like centered rail.
- Confirmed pending permission tool calls appear in the transcript before approval.
- Confirmed pending and running tool-call statuses show a live Codex-like activity dot.
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
