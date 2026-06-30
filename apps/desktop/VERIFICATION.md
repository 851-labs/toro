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
- Grouped sidebar capture: `.artifacts/verification/2026-06-30T03-00-30-702Z/page@ce87e910aa84d417d31a69debfd97538.webm`
- Grouped sidebar stills: `.artifacts/verification/2026-06-30T03-00-30-702Z/*.png`
- Functional-button cleanup capture: `.artifacts/verification/2026-06-30T03-10-18-163Z/page@2b4fba00b8d84ffac67f189a8d838f48.webm`
- Functional-button cleanup stills: `.artifacts/verification/2026-06-30T03-10-18-163Z/*.png`
- Functional design-guide capture: `.artifacts/verification/design-guide/2026-06-30T03-10-18-163Z/page@c3cd3891c71fedb250393ac1331fe309.webm`
- Functional design-guide stills: `.artifacts/verification/design-guide/2026-06-30T03-10-18-163Z/*.png`
- Compact host settings capture: `.artifacts/verification/2026-06-30T03-15-05-528Z/page@bf2da4e5f2c4e88d816a12f2253d8808.webm`
- Compact host settings stills: `.artifacts/verification/2026-06-30T03-15-05-528Z/*.png`

Manual verification:

- Started a new chat in the installed Codex Desktop app.
- Recorded the Codex chat transition and final chat state.
- Compared Toro against the Codex reference for sidebar, title bar, empty state, message layout, composer controls, and follow-up composer copy.
- Confirmed Toro still completes the deterministic ACP demo flow, including workspace open, session start, permission prompt, assistant response, and tool activity.
- Confirmed the desktop composer accepts typing before a session exists and that the rebuilt `Toro.app` accepts keyboard input in the composer.
- Confirmed the rebuilt `Toro.app` renders edge-to-edge without the blue inset or rounded outer app frame.
- Confirmed inert header, sidebar, and composer controls were removed while workspace open, session start, send, and permission approval still work.
- Confirmed the internal design guide renders shared chat messages, streaming state, permission prompt, expanded tool call, logs disclosure, and composer.
- Confirmed the desktop chat flow still passes after moving messages, composer, permission prompt, tool call, and logs into shared UI primitives.
- Confirmed the sidebar visually groups chats under their project and coalesces duplicate opens of the same project path.
- Confirmed every rendered button in the desktop flow is limited to a wired action: new chat, add project, project/chat selection, send/stop, or permission response.
- Confirmed the design guide permission buttons update visible state instead of acting as no-op controls.
- Confirmed the sidebar footer matches Codex more closely by defaulting to a compact host row while the functional host settings button still exposes agent and environment selection.

Automated verification:

- `bun run verify`
- `TORO_VERIFY_STEP_DELAY_MS=300 bun run verify:design-guide`
- `TORO_VERIFY_STEP_DELAY_MS=300 bun run verify:ui`
- `bun --filter @toro/desktop tauri build --debug --bundles app`
