import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const appUrl = process.env.TORO_DESIGN_GUIDE_URL ?? "http://127.0.0.1:1430";
const stepDelayMs = Number(process.env.TORO_VERIFY_STEP_DELAY_MS ?? 0);
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const artifactDir = resolve(".artifacts/verification/design-guide", timestamp);

await assertReachable(appUrl, "Toro design guide");
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: artifactDir, size: { height: 900, width: 1440 } },
  viewport: { height: 900, width: 1440 },
});
const page = await context.newPage();

await page.goto(appUrl, { waitUntil: "networkidle" });
await page.getByText("Codex Chat Surface").waitFor({ timeout: 5_000 });
await page.getByText("Streaming text keeps").waitFor({ timeout: 5_000 });
await page.getByText("Thinking").waitFor({ timeout: 5_000 });
await page.getByText("Reviewing project context").waitFor({ timeout: 5_000 });
await assertSharedChatMessages(page);
await assertSharedThinkingDisclosure(page);
await assertSharedPlanAndSummaries(page);
await assertStreamingCursorAnimated(
  page.locator("article").filter({ hasText: "Streaming text keeps" }).first(),
);
await assertStreamingCursorAnimated(page.locator("[data-thinking-body='true']").first());
await page.getByText("Validate Toro permission UI").first().waitFor({ timeout: 5_000 });
await page.getByText("tool cards are working").waitFor({ timeout: 5_000 });
await assertSharedPermissionElements(page);
await assertSharedToolCall(page);
await page.waitForFunction(() => Boolean(window.__TSR_ROUTER__), null, { timeout: 5_000 });
await screenshot(page, "01-chat-elements.png");
await pause();

await page.getByRole("button", { exact: true, name: "Good response" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Good response" }));
await page.getByRole("button", { exact: true, name: "Bad response" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Bad response" }));
await page.getByRole("button", { exact: true, name: "Expand message" }).click();
await page.getByRole("button", { exact: true, name: "Collapse message" }).waitFor({
  timeout: 5_000,
});
await page.getByRole("button", { exact: true, name: "Copy message" }).click();
await page.getByRole("button", { exact: true, name: "Copied message" }).waitFor({ timeout: 5_000 });
await assertSharedMessageActions(page);
await screenshot(page, "02-message-actions.png");
await pause();

await page.getByRole("button", { exact: true, name: "Allow once" }).click();
await page.getByText("allowed once").waitFor({ timeout: 5_000 });
await screenshot(page, "03-permission-responded.png");
await pause();

await page.getByRole("button", { exact: true, name: "Sidebar Groups" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Sidebar Groups" }));
await page.getByText("Codex Sidebar Groups").waitFor({ timeout: 5_000 });
await page.getByLabel("Sidebar titlebar controls").waitFor({ timeout: 5_000 });
await assertSidebarStoryRail(page);
await assertSidebarStoryTitlebar(page);
await page.getByText("Verify the Toro ACP UI loop").waitFor({ timeout: 5_000 });
await page.getByText("Composer context picker").waitFor({ timeout: 5_000 });
await page
  .getByRole("heading", { exact: true, name: "What should we build in toro?" })
  .waitFor({ timeout: 5_000 });
await assertSharedStarterCards(page);
await assertSidebarStoryHeader(page);
await assertSidebarStoryCommandGroup(page);
await assertSidebarStoryCommands(page);
await assertPassiveReferenceSidebarRows(page);
await assertSidebarStoryContent(page);
await assertSidebarStoryRows(page);
await assertActiveSidebarRowsHaveStrongIcon(page);
await assertSidebarStorySections(page);
await assertSidebarStoryFooter(page);
await assertSidebarStoryShell(page);
await assertSidebarStoryWidth(page);
await screenshot(page, "04-sidebar-groups.png");
await pause();

await page.getByRole("button", { exact: true, name: "Empty States" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Empty States" }));
await page.getByText("Codex Empty States").waitFor({ timeout: 5_000 });
await page
  .getByRole("heading", { exact: true, name: "What should we build in toro?" })
  .waitFor({ timeout: 5_000 });
await assertSharedEmptyState(page);
await assertSharedStarterCards(page);
if ((await page.getByText("Toro Demo is ready.").count()) > 0) {
  throw new Error("Design-guide empty state should not render ready-state subcopy.");
}
await screenshot(page, "05-empty-states.png");
await pause();

await page.getByRole("button", { exact: true, name: "Composer States" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Composer States" }));
await page.getByText("Codex Composer States").waitFor({ timeout: 5_000 });
await page.getByText("Use app.tsx and composer.tsx").waitFor({ timeout: 5_000 });
await assertTranscriptAlignsWithComposer(page);
await assertComposerContextStrip(page);
const composer = page.getByLabel("Message agent");
await selectComposerOption(page, "Access mode", "Read only");
await selectComposerOption(page, "Model", "5.5 Low");
await page.getByRole("button", { exact: true, name: "Add context" }).click();
await page.getByRole("region", { exact: true, name: "Context sources" }).waitFor({
  timeout: 5_000,
});
await page.getByRole("button", { exact: true, name: "Attach context composer.tsx" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Attach context composer.tsx" }));
await page.getByRole("button", { exact: true, name: "Remove context composer.tsx" }).waitFor({
  timeout: 5_000,
});
await screenshot(page, "06-context-attached.png");
await page.getByRole("button", { exact: true, name: "Remove context composer.tsx" }).click();
await page.getByRole("button", { exact: true, name: "Add context" }).click();
await pause();
await composer.fill("Design guide composer check");
await page.getByRole("button", { exact: true, name: "Send" }).click();
if ((await composer.inputValue()) !== "") {
  throw new Error("Design guide composer did not clear after send.");
}
await screenshot(page, "07-composer-cleared.png");
await pause();

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

async function expectPressed(locator) {
  const started = Date.now();
  while (Date.now() - started < 5_000) {
    if ((await locator.getAttribute("aria-pressed")) === "true") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Expected design-guide message action to become pressed.");
}

async function selectComposerOption(page, label, value) {
  const select = page.getByLabel(label);
  await select.selectOption(value);
  if ((await select.inputValue()) !== value) {
    throw new Error(`Design-guide composer ${label} did not select ${value}.`);
  }
}

async function assertSidebarStoryWidth(page) {
  const width = await page
    .locator("[data-sidebar-story-rail='true']")
    .evaluate((node) => node.getBoundingClientRect().width);
  if (width < 370 || width > 410) {
    throw new Error(`Design-guide sidebar story should match desktop rail width, got ${width}.`);
  }
}

async function assertSharedMessageActions(page) {
  const actions = await page.locator("[data-message-action='true']").count();
  if (actions < 4) {
    throw new Error(
      `Design-guide assistant actions should use shared message actions, got ${actions}.`,
    );
  }
}

async function assertSharedPermissionElements(page) {
  const cards = await page.locator("[data-permission-card='true']").count();
  const actions = await page.locator("[data-permission-action='true']").count();
  if (cards < 1 || actions < 2) {
    throw new Error(
      `Design-guide permission prompt should use shared permission primitives, got cards=${cards}, actions=${actions}.`,
    );
  }
}

async function assertSharedToolCall(page) {
  const toolCall = page.locator("[data-tool-call='true']");
  const toolCalls = await toolCall.count();
  if (toolCalls < 1) {
    throw new Error("Design-guide tool rows should use the shared Codex tool-call primitive.");
  }
  await assertCompactTranscriptDisclosure(toolCall.first(), "Tool call");
}

async function assertSharedChatMessages(page) {
  const messages = await page.locator("[data-chat-message='true']").count();
  if (messages < 2) {
    throw new Error(
      `Design-guide chat surface should use shared message primitives, got ${messages}.`,
    );
  }
}

async function assertSharedThinkingDisclosure(page) {
  const thinkingRow = page.locator("[data-thinking-disclosure='true']");
  const thinking = await thinkingRow.count();
  if (thinking < 1) {
    throw new Error(
      "Design-guide thinking rows should use the shared Codex thinking disclosure primitive.",
    );
  }
  await assertCompactTranscriptDisclosure(thinkingRow.first(), "Thinking");
}

async function assertSharedPlanAndSummaries(page) {
  const plan = page.locator("[data-plan-disclosure='true']");
  const plans = await plan.count();
  const summaries = await page.locator("[data-disclosure-summary='true']").count();
  if (plans < 1 || summaries < 3) {
    throw new Error(
      `Design-guide chat surface should use shared plan and disclosure summaries, got plans=${plans}, summaries=${summaries}.`,
    );
  }
  await assertCompactTranscriptDisclosure(plan.first(), "Plan");
}

async function assertCompactTranscriptDisclosure(locator, label) {
  const box = await locator.boundingBox();
  if (!box || box.width > 760) {
    throw new Error(`Design-guide ${label} disclosure is too wide.`);
  }
}

async function assertSharedEmptyState(page) {
  const emptyStates = await page.locator("[data-empty-state='true']").count();
  if (emptyStates < 1) {
    throw new Error("Design-guide empty state should use the shared Codex empty-state primitive.");
  }
}

async function assertSharedStarterCards(page) {
  const cardGrid = page.locator("[data-starter-cards='true']");
  const grids = await cardGrid.count();
  const cards = await page.locator("[data-starter-card='true']").count();
  if (grids < 1 || cards < 3) {
    throw new Error(
      `Design-guide empty project should render shared Codex starter cards, got grids=${grids}, cards=${cards}.`,
    );
  }
  if ((await cardGrid.locator("button").count()) > 0) {
    throw new Error("Design-guide starter cards should be passive until integrations are wired.");
  }
  await assertStarterCardIcons(page);
}

async function assertStarterCardIcons(page) {
  const icons = await page
    .locator("[data-starter-card-icon]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-starter-card-icon")));
  for (const icon of ["slack", "github", "linear"]) {
    if (!icons.includes(icon)) {
      throw new Error(`Design-guide starter cards should render the ${icon} reference icon.`);
    }
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
    throw new Error("Design-guide streaming cursor should pulse like Codex.");
  }
}

async function assertSidebarStoryRail(page) {
  const rails = await page
    .locator("[data-sidebar-story-rail='true'][data-sidebar-rail='true']")
    .count();
  if (rails !== 1) {
    throw new Error(`Design-guide sidebar story should use one shared rail, got ${rails}.`);
  }
}

async function assertSidebarStoryTitlebar(page) {
  const titlebars = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-titlebar='true']")
    .count();
  if (titlebars !== 1) {
    throw new Error(`Design-guide sidebar story should use one shared titlebar, got ${titlebars}.`);
  }
}

async function assertSidebarStoryShell(page) {
  const className =
    (await page.locator("[data-sidebar-story-shell='true']").getAttribute("class")) ?? "";
  if (className.includes("rounded") || className.includes("border ")) {
    throw new Error("Design-guide sidebar story should render as an unframed app shell.");
  }
}

async function assertSidebarStoryHeader(page) {
  const header = page.getByLabel("Sidebar story chat header");
  await header.getByText("New chat", { exact: true }).waitFor({ timeout: 5_000 });
  await header.getByText("Open in", { exact: true }).waitFor({ timeout: 5_000 });
  await header.locator("[data-vscode-mark='true']").waitFor({ timeout: 5_000 });
  if ((await header.getAttribute("data-chat-header")) !== "true") {
    throw new Error("Design-guide sidebar story should use the shared chat header primitive.");
  }
  const height = await header.evaluate((node) => node.getBoundingClientRect().height);
  if (height < 60 || height > 68) {
    throw new Error(
      `Design-guide sidebar story header should match desktop height, got ${height}.`,
    );
  }
}

async function assertSidebarStoryRows(page) {
  const rows = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-row='true']")
    .count();
  if (rows < 4) {
    throw new Error(`Design-guide sidebar story should use shared sidebar rows, got ${rows}.`);
  }
}

async function assertActiveSidebarRowsHaveStrongIcon(page) {
  const activeRows = page.locator(
    "[data-sidebar-story-rail='true'] [data-sidebar-row-active='true']",
  );
  if ((await activeRows.count()) < 1) {
    throw new Error("Design-guide sidebar story should expose active row state.");
  }
  const mutedIcons = await activeRows.evaluateAll(
    (nodes) =>
      nodes.filter((node) => node.querySelector("span")?.className.includes("text-zinc-400"))
        .length,
  );
  if (mutedIcons > 0) {
    throw new Error("Design-guide active sidebar row icons should not keep muted styling.");
  }
}

async function assertSidebarStoryCommands(page) {
  const commands = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-command='true']")
    .count();
  if (commands < 2) {
    throw new Error(
      `Design-guide sidebar story should use shared sidebar commands, got ${commands}.`,
    );
  }
}

async function assertSidebarStoryCommandGroup(page) {
  const groups = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-command-group='true']")
    .count();
  if (groups !== 1) {
    throw new Error(
      `Design-guide sidebar story should use one shared command group, got ${groups}.`,
    );
  }
}

async function assertPassiveReferenceSidebarRows(page) {
  const rail = page.locator("[data-sidebar-story-rail='true']");
  for (const label of ["Scheduled", "Plugins"]) {
    await rail.getByText(label, { exact: true }).waitFor({ timeout: 5_000 });
    if ((await rail.getByRole("button", { exact: true, name: label }).count()) > 0) {
      throw new Error(`Design-guide ${label} row should be passive until the feature is wired.`);
    }
  }
}

async function assertSidebarStoryContent(page) {
  const content = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-content='true']")
    .count();
  if (content !== 1) {
    throw new Error(
      `Design-guide sidebar story should use one shared content area, got ${content}.`,
    );
  }
}

async function assertSidebarStorySections(page) {
  const sections = await page
    .locator("[data-sidebar-story-rail='true'] [data-sidebar-section='true']")
    .count();
  if (sections < 1) {
    throw new Error("Design-guide sidebar story should use the shared sidebar section primitive.");
  }
}

async function assertSidebarStoryFooter(page) {
  const footer = page.locator("[data-sidebar-story-rail='true'] [data-sidebar-footer='true']");
  const footers = await footer.count();
  if (footers !== 1) {
    throw new Error(`Design-guide sidebar story should use one shared footer, got ${footers}.`);
  }
  await footer.getByText("Local host", { exact: true }).waitFor({ timeout: 5_000 });
  await footer.getByText("connected", { exact: true }).waitFor({ timeout: 5_000 });
  if ((await footer.getByText("Toro Demo", { exact: true }).count()) > 0) {
    throw new Error(
      "Design-guide sidebar footer should not use the selected agent as account text.",
    );
  }
}

async function assertTranscriptAlignsWithComposer(page) {
  const [composer, transcript] = await Promise.all([
    surfaceBounds(page, "[data-composer-surface='true']"),
    surfaceBounds(page, "[data-transcript-surface='true']"),
  ]);
  const leftDelta = Math.abs(composer.left - transcript.left);
  const widthDelta = Math.abs(composer.width - transcript.width);

  if (leftDelta > 2 || widthDelta > 2) {
    throw new Error(
      `Design-guide transcript should align to composer surface, got left delta ${leftDelta} and width delta ${widthDelta}.`,
    );
  }
}

async function assertComposerContextStrip(page) {
  const strip = page.locator("[data-composer-context-strip='true']");
  await strip.getByText("toro", { exact: true }).waitFor({ timeout: 5_000 });
  for (const text of ["Work locally", "main"]) {
    if ((await strip.getByText(text, { exact: true }).count()) === 0) {
      throw new Error(`Design-guide composer context strip is missing ${text}.`);
    }
  }
  if ((await strip.locator("button").count()) > 0) {
    throw new Error("Design-guide composer context strip should not render buttons.");
  }
  if ((await strip.locator("[data-composer-context-chevron='true']").count()) < 2) {
    throw new Error("Design-guide composer context strip should show passive chevrons.");
  }
}

async function surfaceBounds(page, selector) {
  return page.locator(selector).evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  });
}

async function assertReachable(url, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw new Error(
      `${label} is not reachable at ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
