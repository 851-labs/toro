import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { createVerifyUiHelpers } from "./verify-ui-helpers.mjs";

const appUrl = process.env.TORO_APP_URL ?? "http://127.0.0.1:1420";
const hostUrl = process.env.TORO_HOST_URL ?? "http://127.0.0.1:17345";
const workspacePath = process.env.TORO_VERIFY_WORKSPACE ?? resolve(".");
const workspaceName = basename(workspacePath);
const stepDelayMs = Number(process.env.TORO_VERIFY_STEP_DELAY_MS ?? 0);
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const artifactDir = resolve(".artifacts/verification", timestamp);
const {
  assertComposerAffordancesArePassive,
  assertComposerContextPicker,
  assertComposerFooterIsCodexCompact,
  assertComposerHeightIsCodexLike,
  assertComposerWidthIsCodexLike,
  assertCurrentChatIsFirstInProject,
  assertDeadControlsRemoved,
  assertDesktopDebugLogsHidden,
  assertEmptySessionPrompt,
  assertHeaderActions,
  assertHostSettingsToggle,
  assertOnlyFunctionalButtons,
  assertOpenInMenu,
  assertPermissionCardIsCompact,
  assertPrimarySidebarSimplified,
  assertProjectFormHidden,
  assertProjectPathHiddenInSidebar,
  assertReachable,
  assertSessionDetailsToggle,
  assertSidebarChatRowsAreNavigationOnly,
  assertSidebarWidthIsCodexLike,
  assertSidebarToggle,
  assertToolCallIsCompact,
  assertTranscriptAlignsWithComposer,
  assertTranscriptDisclosureIsCompact,
  assertTranscriptOrder,
  expectPressed,
  selectComposerOption,
} = createVerifyUiHelpers({ pause, screenshot, workspaceName, workspacePath });

await assertReachable(`${hostUrl}/api/state`, "Toro host");
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: artifactDir, size: { height: 900, width: 1440 } },
  viewport: { height: 900, width: 1440 },
});
const page = await context.newPage();

await page.goto(appUrl, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { exact: true, name: "Search" }).waitFor({ timeout: 5_000 });
await assertDeadControlsRemoved(page);
await assertPrimarySidebarSimplified(page);
await assertSidebarWidthIsCodexLike(page);
await assertPassiveReferenceSidebarRows(page);
await assertSidebarCommandGroupShared(page);
await assertSidebarFooterShared(page);
await assertProjectFormHidden(page);
await assertComposerFooterIsCodexCompact(page);
await assertComposerAffordancesArePassive(page);
await assertComposerHeightIsCodexLike(page);
await assertComposerWidthIsCodexLike(page);
await assertTranscriptAlignsWithComposer(page);
await assertOnlyFunctionalButtons(page);
await assertHostSettingsToggle(page);
const composer = page.getByLabel("Message agent");
await selectComposerOption(page, "Access mode", "Ask first");
await selectComposerOption(page, "Model", "5.5 High");
const initialComposerText = "Typing before a session should work.";
await composer.fill(initialComposerText);
if ((await composer.inputValue()) !== initialComposerText) {
  throw new Error("Composer did not accept text before a session was created.");
}
await composer.fill("");
await selectComposerOption(page, "Access mode", "Full access");
await selectComposerOption(page, "Model", "5.5 Medium");
await screenshot(page, "01-initial-shell.png");
await pause();

await assertSidebarToggle(page);

await page.getByRole("button", { exact: true, name: "Open project" }).click();
await assertSidebarInputsShared(page, 1);
await page.getByLabel("Project path").fill(workspacePath);
await page.getByRole("button", { exact: true, name: "Open" }).click();
await page.getByText("toro").first().waitFor({ timeout: 5_000 });
await assertProjectFormHidden(page);
await assertProjectPathHiddenInSidebar(page);
await assertComposerFooterIsCodexCompact(page);
await assertSharedEmptyState(page);
await assertSharedStarterCards(page);
await assertActiveSidebarRowsHaveStrongIcon(page);
await assertLightReferenceShell(page);
await assertEmptyWorkspaceHeaderIsQuiet(page);
await assertComposerContextPicker(page);
await assertLightComposerControlHover(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "02-workspace-opened.png");
await pause();

await page.getByRole("button", { exact: true, name: "Search" }).click();
await assertSidebarInputsShared(page, 1);
await page.getByLabel("Search projects and chats").fill("definitely-not-a-project");
await page.getByText("No matches").waitFor({ timeout: 5_000 });
await page.getByLabel("Search projects and chats").fill(workspaceName);
await page.getByRole("button", { name: workspaceName }).first().waitFor({ timeout: 5_000 });
await screenshot(page, "03-search-filtered.png");
await page.getByRole("button", { exact: true, name: "Search" }).click();
await pause();

await page.getByRole("button", { exact: true, name: "New chat" }).click();
await page
  .getByText(/Toro Demo in/)
  .first()
  .waitFor({ timeout: 10_000 });
await page
  .getByRole("button", { name: /Chat Toro Demo in toro/ })
  .first()
  .waitFor({ timeout: 5_000 });
await page.locator("aside button[aria-current='page']").waitFor({ timeout: 5_000 });
await assertPrimarySidebarSimplified(page);
await assertSidebarChatRowsAreNavigationOnly(page);
await assertCurrentChatIsFirstInProject(page);
await assertEmptySessionPrompt(page);
await assertSharedEmptyState(page);
await assertSharedStarterCards(page);
await assertLightReferenceShell(page);
await assertComposerFooterIsCodexCompact(page);
await assertDesktopDebugLogsHidden(page);
await assertOpenInMenu(page);
await assertHeaderActions(page);
await assertSessionDetailsToggle(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "04-session-created.png");
await pause();

await page.getByRole("button", { exact: true, name: "Back" }).click();
await page
  .getByRole("heading", { exact: true, name: `What should we build in ${workspaceName}?` })
  .waitFor({
    timeout: 5_000,
  });
await assertEmptySessionPrompt(page);
await assertSharedEmptyState(page);
await assertSharedStarterCards(page);
await assertLightReferenceShell(page);
await assertEmptyWorkspaceHeaderIsQuiet(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "04-history-back.png");
await page.getByRole("button", { exact: true, name: "Forward" }).click();
await page
  .getByText(/Toro Demo in/)
  .first()
  .waitFor({ timeout: 5_000 });
await assertCurrentChatIsFirstInProject(page);
await pause();

await composer.fill("Verify the Toro ACP UI loop.");
await page.getByRole("button", { exact: true, name: "Send" }).click();
await page.getByText("Thinking").waitFor({ timeout: 10_000 });
await page.getByText("working").waitFor({ timeout: 10_000 });
await page.getByText(/Checking project context/).waitFor({ timeout: 10_000 });
await assertSharedChatMessages(page);
await assertSharedThinkingDisclosure(page);
await assertSharedPlanAndSummaries(page);
await assertLightReferenceShell(page);
await assertStreamingCursorAnimated(page.locator("[data-thinking-body='true']").first());
await assertTranscriptDisclosureIsCompact(
  page.locator("details").filter({ hasText: "Plan" }).first(),
  "Plan",
);
await assertTranscriptDisclosureIsCompact(
  page.locator("details").filter({ hasText: "Thinking" }).first(),
  "Thinking",
);
if ((await page.getByText(/deciding the next UI action/).count()) > 0) {
  throw new Error("Full thinking text appeared before the partial streaming checkpoint.");
}
if ((await page.getByText("Validate Toro permission UI").count()) > 0) {
  throw new Error("Permission prompt appeared before the thinking checkpoint.");
}
await assertOnlyFunctionalButtons(page);
await screenshot(page, "05-thinking.png");
await pause();

await page.getByText("Validate Toro permission UI").waitFor({ timeout: 10_000 });
await assertPermissionCardIsCompact(page);
await assertSharedPermissionElements(page);
await assertSidebarChatRowsAreNavigationOnly(page);
await assertOnlyFunctionalButtons(page, ["Allow once", "Reject"]);
await screenshot(page, "06-permission-request.png");
await pause();

await page.getByRole("button", { name: "Allow once" }).click();
await page.getByText(/Toro demo agent received your prompt/).waitFor({ timeout: 10_000 });
await assertStreamingCursorAnimated(
  page
    .locator("article")
    .filter({ hasText: /Toro demo agent received your prompt/ })
    .first(),
);
if ((await page.getByText(/tool cards are working/).count()) > 0) {
  throw new Error("Final assistant text appeared before the streaming checkpoint.");
}
await assertOnlyFunctionalButtons(page);
await screenshot(page, "07-streaming-in-progress.png");
await pause();

await page.getByText(/tool cards are working/).waitFor({ timeout: 10_000 });
await page
  .getByRole("heading", { exact: true, name: "Verify the Toro ACP UI loop" })
  .waitFor({ timeout: 5_000 });
await page
  .locator("aside button[aria-current='page'][aria-label='Chat Verify the Toro ACP UI loop']")
  .waitFor({ timeout: 5_000 });
await assertDesktopDebugLogsHidden(page);
await assertOnlyFunctionalButtons(page);
await assertTranscriptOrder(page);
const toolCall = page.locator("details").filter({ hasText: "Validate Toro permission UI" }).last();
await assertToolCallIsCompact(toolCall);
await assertSharedToolCall(toolCall);
await screenshot(page, "08-streaming-complete.png");
await pause();

await toolCall.locator("summary").click();
await page.getByText("status: ok").waitFor({ timeout: 5_000 });
await screenshot(page, "09-tool-call-expanded.png");
await pause();

await page.getByRole("button", { exact: true, name: "Good response" }).last().click();
await expectPressed(page.getByRole("button", { exact: true, name: "Good response" }).last());
await page.getByRole("button", { exact: true, name: "Bad response" }).last().click();
await expectPressed(page.getByRole("button", { exact: true, name: "Bad response" }).last());
await page.getByRole("button", { exact: true, name: "Expand message" }).last().click();
await page.getByRole("button", { exact: true, name: "Collapse message" }).waitFor({
  timeout: 5_000,
});
await assertSharedMessageActions(page);
await screenshot(page, "10-message-actions.png");
await pause();

await page.getByRole("button", { exact: true, name: "Copy message" }).last().click();
await page.getByRole("button", { exact: true, name: "Copied message" }).waitFor({ timeout: 5_000 });
await screenshot(page, "11-copy-feedback.png");
await pause();

const packageJson = page.getByRole("button", { name: "package.json" }).first();
if (await packageJson.count()) {
  await packageJson.click();
  await page.waitForTimeout(500);
  await screenshot(page, "12-file-preview.png");
  await pause();
}

await context.close();
await browser.close();

const files = await readdir(artifactDir);
console.log(JSON.stringify({ artifactDir, files: files.sort() }, null, 2));

async function screenshot(page, name) {
  await page.screenshot({ fullPage: true, path: resolve(artifactDir, name) });
}

async function pause() {
  if (stepDelayMs > 0) {
    await new Promise((resolvePause) => setTimeout(resolvePause, stepDelayMs));
  }
}

async function assertStreamingCursorAnimated(locator) {
  const className = await locator.first().evaluate((node) => {
    const target = node.matches("[class*='after:']")
      ? node
      : node.querySelector("[class*='after:']");
    return target?.getAttribute("class") ?? "";
  });
  if (!className.includes("after:motion-safe:animate-pulse")) {
    throw new Error("Streaming cursor should pulse like Codex while text is arriving.");
  }
}

async function assertSidebarFooterShared(page) {
  const footer = page.locator("[data-sidebar-rail='true'] [data-sidebar-footer='true']");
  const footers = await footer.count();
  if (footers !== 1)
    throw new Error(`Desktop sidebar should use one shared footer, got ${footers}.`);
  if ((await footer.locator("[data-sidebar-avatar='true']").textContent()) !== "T")
    throw new Error("Desktop sidebar footer should use the shared initial avatar.");
  await footer.getByText("Local host", { exact: true }).waitFor({ timeout: 5_000 });
  await footer.getByText("connected", { exact: true }).waitFor({ timeout: 5_000 });
  if ((await footer.getByText("Toro Demo", { exact: true }).count()) > 0) {
    throw new Error("Desktop sidebar footer should not use the selected agent as account text.");
  }
}

async function assertActiveSidebarRowsHaveStrongIcon(page) {
  const activeRows = page.locator("[data-sidebar-row-active='true']");
  if ((await activeRows.count()) < 1) {
    throw new Error("Desktop sidebar should expose active row state.");
  }
  const mutedIcons = await activeRows.evaluateAll(
    (nodes) =>
      nodes.filter((node) => node.querySelector("span")?.className.includes("text-zinc-400"))
        .length,
  );
  if (mutedIcons > 0) {
    throw new Error("Active sidebar row icons should not keep muted inactive styling.");
  }
}

async function assertSharedMessageActions(page) {
  const actions = await page.locator("[data-message-action='true']").count();
  if (actions < 4) {
    throw new Error(`Desktop assistant actions should use shared message actions, got ${actions}.`);
  }
}

async function assertSharedPermissionElements(page) {
  const cards = await page.locator("[data-permission-card='true']").count();
  const actions = await page.locator("[data-permission-action='true']").count();
  if (cards < 1 || actions < 2) {
    throw new Error(
      `Desktop permission prompt should use shared permission primitives, got cards=${cards}, actions=${actions}.`,
    );
  }
}

async function assertSharedToolCall(toolCall) {
  if ((await toolCall.getAttribute("data-tool-call")) !== "true") {
    throw new Error("Desktop tool calls should use the shared Codex tool-call primitive.");
  }
}

async function assertSharedChatMessages(page) {
  const messages = await page.locator("[data-chat-message='true']").count();
  if (messages < 1) {
    throw new Error("Desktop transcript should use shared Codex chat message primitives.");
  }
}

async function assertSharedThinkingDisclosure(page) {
  const thinking = await page.locator("[data-thinking-disclosure='true']").count();
  if (thinking < 1) {
    throw new Error(
      "Desktop thinking rows should use the shared Codex thinking disclosure primitive.",
    );
  }
}

async function assertSharedPlanAndSummaries(page) {
  const plans = await page.locator("[data-plan-disclosure='true']").count();
  const summaries = await page.locator("[data-disclosure-summary='true']").count();
  if (plans < 1 || summaries < 2) {
    throw new Error(
      `Desktop transcript should use shared plan and disclosure summaries, got plans=${plans}, summaries=${summaries}.`,
    );
  }
}

async function assertSharedEmptyState(page) {
  const emptyStates = await page.locator("[data-empty-state='true']").count();
  if (emptyStates < 1) {
    throw new Error("Desktop empty chat should use the shared Codex empty-state primitive.");
  }
}

async function assertSharedStarterCards(page) {
  const cardGrid = page.locator("[data-starter-cards='true']");
  const grids = await cardGrid.count();
  const cards = await page.locator("[data-starter-card='true']").count();
  if (grids < 1 || cards < 3) {
    throw new Error(
      `Desktop empty project should render shared Codex starter cards, got grids=${grids}, cards=${cards}.`,
    );
  }
  if ((await cardGrid.locator("button").count()) > 0) {
    throw new Error("Desktop starter cards should be passive until integrations are wired.");
  }
  await assertStarterCardIcons(page);
}

async function assertStarterCardIcons(page) {
  const icons = await page
    .locator("[data-starter-card-icon]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-starter-card-icon")));
  for (const icon of ["slack", "github", "linear"]) {
    if (!icons.includes(icon)) {
      throw new Error(`Desktop starter cards should render the ${icon} reference icon.`);
    }
  }
}

async function assertLightReferenceShell(page) {
  await assertLightSurface(page, "[data-chat-header='true']", "chat header");
  await assertLightSurface(page, "[data-sidebar-rail='true']", "sidebar rail");
  await assertLightSurface(page, "[data-composer-surface='true']", "composer");
  if ((await page.locator("[data-starter-card='true']").count()) > 0) {
    await assertLightSurface(page, "[data-starter-card='true']", "starter card");
  }
}

async function assertEmptyWorkspaceHeaderIsQuiet(page) {
  const header = page.locator("[data-chat-header='true']");
  if ((await header.getByText("New chat", { exact: true }).count()) > 0) {
    throw new Error("Empty project header should not render a redundant New chat title.");
  }
  if ((await header.getByRole("button", { exact: true, name: "More chat actions" }).count()) > 0) {
    throw new Error("Empty project header should not render session-only overflow actions.");
  }
  if ((await header.getByRole("button", { exact: true, name: "Open in" }).count()) > 0) {
    throw new Error("Empty project header should not render the session-scoped Open in menu.");
  }
}

async function assertLightSurface(page, selector, label) {
  const color = await page
    .locator(selector)
    .first()
    .evaluate((node) => {
      const background = getComputedStyle(node).backgroundColor;
      const text = getComputedStyle(node).color;
      return { background, text };
    });
  const backgroundLuma = rgbLuma(color.background);
  const textLuma = rgbLuma(color.text);
  if (backgroundLuma < 215) {
    throw new Error(`${label} should use light Codex shell, got ${color.background}.`);
  }
  if (label === "sidebar rail" && backgroundLuma > 247) {
    throw new Error(`sidebar rail should use a visible gray shell, got ${color.background}.`);
  }
  if (textLuma > 170) {
    throw new Error(`${label} text should stay readable in light mode, got ${color.text}.`);
  }
}

async function assertLightComposerControlHover(page) {
  const addContext = page.getByRole("button", { exact: true, name: "Add context" });
  await addContext.hover();
  const background = await addContext.evaluate((node) => getComputedStyle(node).backgroundColor);
  const backgroundLuma = rgbLuma(background);
  if (backgroundLuma < 225) {
    throw new Error(`Light composer Add context hover should stay subtle, got ${background}.`);
  }
  const send = page.locator("[data-composer-send-disabled='true']");
  const sendBackground = await send.evaluate((node) => getComputedStyle(node).backgroundColor);
  if (rgbLuma(sendBackground) < 230) {
    throw new Error(`Light disabled send should stay pale gray, got ${sendBackground}.`);
  }
}

function rgbLuma(color) {
  if (color.startsWith("oklch(")) {
    const lightness = Number(color.match(/oklch\(([\d.]+)/)?.[1]);
    if (Number.isFinite(lightness)) {
      return lightness <= 1 ? lightness * 255 : (lightness / 100) * 255;
    }
  }

  const channels = color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (channels[3] === 0) return 255;
  if (channels.length < 3) {
    throw new Error(`Could not parse rgb color: ${color}`);
  }
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

async function assertSidebarCommandGroupShared(page) {
  const groups = await page
    .locator("[data-sidebar-rail='true'] [data-sidebar-command-group='true']")
    .count();
  if (groups !== 1) {
    throw new Error(`Desktop sidebar should use one shared command group, got ${groups}.`);
  }
}

async function assertPassiveReferenceSidebarRows(page) {
  const rail = page.locator("[data-sidebar-rail='true']");
  for (const label of ["Scheduled", "Plugins"]) {
    await rail.getByText(label, { exact: true }).waitFor({ timeout: 5_000 });
    if ((await rail.getByRole("button", { exact: true, name: label }).count()) > 0) {
      throw new Error(`${label} should render as a passive Codex reference row, not a button.`);
    }
  }
}

async function assertSidebarInputsShared(page, minimum) {
  const inputs = await page
    .locator("[data-sidebar-rail='true'] [data-sidebar-input='true']")
    .count();
  if (inputs < minimum) {
    throw new Error(`Desktop sidebar should use shared sidebar inputs, got ${inputs}.`);
  }
}
