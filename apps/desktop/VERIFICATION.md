# Desktop Verification Notes

## Codex Chat UI Fidelity Pass

- Reference capture: `.artifacts/reference/codex-chat/codex-chat-reference.mov`
- Reference still: `.artifacts/reference/codex-chat/codex-chat-final.png`
- Toro capture: `.artifacts/verification/2026-06-30T02-08-55-723Z/page@a8f03d435f16b44636628220153b07d7.webm`
- Toro stills: `.artifacts/verification/2026-06-30T02-08-55-723Z/*.png`
- Composer regression capture: `.artifacts/verification/2026-06-30T02-22-13-334Z/page@6814474a5eab08ca6b6a66aaf7459f03.webm`
- Composer regression stills: `.artifacts/verification/2026-06-30T02-22-13-334Z/*.png`
- Edge-to-edge shell capture: `.artifacts/verification/2026-06-30T02-25-58-481Z/page@b0f7b439d2c6890a548e08d14bac02ef.webm`
- Edge-to-edge shell stills: `.artifacts/verification/2026-06-30T02-25-58-481Z/*.png`
- Inert-control cleanup capture: `.artifacts/verification/2026-06-30T02-35-09-746Z/page@255e5302a79ce0369749316ba4a4ae86.webm`
- Inert-control cleanup stills: `.artifacts/verification/2026-06-30T02-35-09-746Z/*.png`
- Design guide capture: `.artifacts/verification/design-guide/2026-06-30T02-49-12-104Z/page@ee2706e8fe8dc0331deadeaf46728eba.webm`
- Design guide stills: `.artifacts/verification/design-guide/2026-06-30T02-49-12-104Z/*.png`
- Shared chat primitives capture: `.artifacts/verification/2026-06-30T02-50-41-423Z/page@54a6eed9b721613c19910daf9db761ff.webm`
- Shared chat primitives stills: `.artifacts/verification/2026-06-30T02-50-41-423Z/*.png`

Manual verification:

- Started a new chat in the installed Codex Desktop app.
- Recorded the Codex chat transition and final chat state.
- Compared Toro against the Codex reference for sidebar, title bar, empty state, message layout, composer controls, and follow-up composer copy.
- Confirmed Toro still completes the deterministic ACP demo flow, including workspace open, session start, permission prompt, assistant response, tool activity, and file preview.
- Confirmed the desktop composer accepts typing before a session exists and that the rebuilt `Toro.app` accepts keyboard input in the composer.
- Confirmed the rebuilt `Toro.app` renders edge-to-edge without the blue inset or rounded outer app frame.
- Confirmed inert header, sidebar, and composer controls were removed while workspace open, session start, send, permission approval, and file preview still work.
- Confirmed the internal design guide renders shared chat messages, streaming state, permission prompt, expanded tool call, logs disclosure, and composer.
- Confirmed the desktop chat flow still passes after moving messages, composer, permission prompt, tool call, and logs into shared UI primitives.

Automated verification:

- `bun run verify`
- `TORO_VERIFY_STEP_DELAY_MS=300 bun run verify:design-guide`
- `TORO_VERIFY_STEP_DELAY_MS=1000 bun run verify:ui`
- `bun --filter @toro/desktop tauri build --debug --bundles app`
