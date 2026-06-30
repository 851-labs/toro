# Desktop Verification Notes

## Current Codex UI Fidelity Index

This file is the current verification index for the Toro desktop Codex-fidelity work. The full
historical evidence log for the June 30 pass is archived at:

- `apps/desktop/verification/2026-06-30-codex-ui-fidelity.md`

Current reference evidence:

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`

Latest verified desktop artifacts:

- Desktop capture: `.artifacts/verification/2026-06-30T14-52-26-452Z/page@32762010db64ce4e8b58b6faa050d6df.webm`
- Desktop stills: `.artifacts/verification/2026-06-30T14-52-26-452Z/*.png`
- Design-guide capture: `.artifacts/verification/design-guide/2026-06-30T14-53-56-651Z/page@28271dd940de90ac649116adc0225bf6.webm`
- Design-guide stills: `.artifacts/verification/design-guide/2026-06-30T14-53-56-651Z/*.png`
- Native still: `.artifacts/verification/native/2026-06-30-pending-tool-call-lifecycle.png`

Most recent manual checks:

- Confirmed the desktop sidebar no longer renders inert Scheduled or Plugins rows until those features are wired.
- Confirmed completed tool-call status renders as muted transcript metadata instead of bright emerald text.
- Confirmed assistant messages use a wider Codex-like transcript rail instead of the previous narrow 72% cap.
- Confirmed the UI verifier resets host state before loading the desktop shell.
- Confirmed the desktop sidebar renders Codex-like top-level Projects and Chats sections.
- Confirmed the desktop Chats section is scoped to the active project outside search mode.
- Confirmed the transcript and composer use a narrower Codex-like centered rail.
- Confirmed pending permission tool calls appear in the transcript before approval.
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
