# Desktop Verification Notes

## Current Codex UI Fidelity Index

This file is the current verification index for the Toro desktop Codex-fidelity work. The full
historical evidence log for the June 30 pass is archived at:

- `apps/desktop/verification/2026-06-30-codex-ui-fidelity.md`

Current reference evidence:

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`

Latest verified desktop artifacts:

- Desktop capture: `.artifacts/verification/2026-06-30T14-44-44-099Z/page@9fbb6c43cd7582dfe7dc0ba184329a12.webm`
- Desktop stills: `.artifacts/verification/2026-06-30T14-44-44-099Z/*.png`
- Design-guide capture: `.artifacts/verification/design-guide/2026-06-30T14-37-50-367Z/page@f6a4c2e96fafac1d8916adc70f77d981.webm`
- Design-guide stills: `.artifacts/verification/design-guide/2026-06-30T14-37-50-367Z/*.png`
- Native still: `.artifacts/verification/native/2026-06-30-project-scoped-chats.png`

Most recent manual checks:

- Confirmed the desktop sidebar no longer renders inert Scheduled or Plugins rows until those features are wired.
- Confirmed completed tool-call status renders as muted transcript metadata instead of bright emerald text.
- Confirmed assistant messages use a wider Codex-like transcript rail instead of the previous narrow 72% cap.
- Confirmed the UI verifier resets host state before loading the desktop shell.
- Confirmed the desktop sidebar renders Codex-like top-level Projects and Chats sections.
- Confirmed the desktop Chats section is scoped to the active project outside search mode.
- Confirmed the transcript and composer use a narrower Codex-like centered rail.
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
