import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

const appUrl = process.env.TORO_APP_URL ?? "http://127.0.0.1:1420";
const hostUrl = process.env.TORO_HOST_URL ?? "http://127.0.0.1:17345";
const workspacePath = process.env.TORO_VERIFY_WORKSPACE ?? resolve(".");
const workspaceName = basename(workspacePath);
const stepDelayMs = Number(process.env.TORO_VERIFY_STEP_DELAY_MS ?? 0);
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const artifactDir = resolve(".artifacts/verification", timestamp);

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
await assertProjectFormHidden(page);
await assertComposerFooterIsCodexCompact(page);
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
await screenshot(page, "01-initial-shell.png");
await pause();

await assertSidebarToggle(page);

await page.getByRole("button", { exact: true, name: "Open project" }).click();
await page.getByLabel("Project path").fill(workspacePath);
await page.getByRole("button", { exact: true, name: "Open" }).click();
await page.getByText("toro").first().waitFor({ timeout: 5_000 });
await assertProjectFormHidden(page);
await assertProjectPathHiddenInSidebar(page);
await assertComposerFooterIsCodexCompact(page);
await assertComposerContextPicker(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "02-workspace-opened.png");
await pause();

await page.getByRole("button", { exact: true, name: "Search" }).click();
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
await assertPrimarySidebarSimplified(page);
await assertSidebarChatRowsAreNavigationOnly(page);
await assertDesktopDebugLogsHidden(page);
await assertHeaderActions(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "04-session-created.png");
await pause();

await composer.fill("Verify the Toro ACP UI loop.");
await page.getByRole("button", { exact: true, name: "Send" }).click();
await page.getByText("Thinking").waitFor({ timeout: 10_000 });
await page.getByText("working").waitFor({ timeout: 10_000 });
await page.getByText(/Checking project context/).waitFor({ timeout: 10_000 });
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
await assertSidebarChatRowsAreNavigationOnly(page);
await assertOnlyFunctionalButtons(page, ["Allow once", "Reject"]);
await screenshot(page, "06-permission-request.png");
await pause();

await page.getByRole("button", { name: "Allow once" }).click();
await page.getByText(/Toro demo agent received your prompt/).waitFor({ timeout: 10_000 });
if ((await page.getByText(/tool cards are working/).count()) > 0) {
  throw new Error("Final assistant text appeared before the streaming checkpoint.");
}
await assertOnlyFunctionalButtons(page);
await screenshot(page, "07-streaming-in-progress.png");
await pause();

await page.getByText(/tool cards are working/).waitFor({ timeout: 10_000 });
await assertDesktopDebugLogsHidden(page);
await assertOnlyFunctionalButtons(page);
await assertTranscriptOrder(page);
const toolCall = page.locator("details").filter({ hasText: "Validate Toro permission UI" }).last();
await assertToolCallIsCompact(toolCall);
await toolCall.locator("summary").click();
await page.getByText("status: ok").waitFor({ timeout: 5_000 });
await screenshot(page, "08-tool-call-expanded.png");
await pause();

await page.getByRole("button", { exact: true, name: "Good response" }).last().click();
await expectPressed(page.getByRole("button", { exact: true, name: "Good response" }).last());
await page.getByRole("button", { exact: true, name: "Bad response" }).last().click();
await expectPressed(page.getByRole("button", { exact: true, name: "Bad response" }).last());
await page.getByRole("button", { exact: true, name: "Expand message" }).last().click();
await page.getByRole("button", { exact: true, name: "Collapse message" }).waitFor({
  timeout: 5_000,
});
await screenshot(page, "09-message-actions.png");
await pause();

await page.getByRole("button", { exact: true, name: "Copy message" }).last().click();
await page.getByRole("button", { exact: true, name: "Copied message" }).waitFor({ timeout: 5_000 });
await screenshot(page, "10-streaming-complete.png");
await pause();

const packageJson = page.getByRole("button", { name: "package.json" }).first();
if (await packageJson.count()) {
  await packageJson.click();
  await page.waitForTimeout(500);
  await screenshot(page, "11-file-preview.png");
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

async function assertDeadControlsRemoved(page) {
  const deadButtons = [
    "Open in",
    "Chat settings",
    "Toggle preview",
    "Dictate",
    "Scheduled",
    "Plugins",
    /Remote Sandbox/,
  ];

  for (const name of deadButtons) {
    if ((await page.getByRole("button", { exact: true, name }).count()) > 0) {
      throw new Error(`Dead control is still rendered as a button: ${name}`);
    }
  }
}

async function assertPrimarySidebarSimplified(page) {
  const removedSections = ["Files", "Run With", "Environment"];

  for (const name of removedSections) {
    if ((await page.getByRole("heading", { exact: true, name }).count()) > 0) {
      throw new Error(`Non-Codex sidebar section is still rendered: ${name}`);
    }
  }
}

async function assertDesktopDebugLogsHidden(page) {
  if ((await page.getByText("Activity logs").count()) > 0) {
    throw new Error("Desktop chat should not render raw activity logs.");
  }
}

async function assertProjectFormHidden(page) {
  if ((await page.getByLabel("Project path").count()) > 0) {
    throw new Error("Project path form should be hidden until Open project is clicked.");
  }
}

async function assertProjectPathHiddenInSidebar(page) {
  if ((await page.locator("aside").getByText(workspacePath, { exact: true }).count()) > 0) {
    throw new Error("Sidebar project rows should not render the full filesystem path.");
  }
}

async function assertComposerFooterIsCodexCompact(page) {
  for (const text of ["Open a project to start", "Work locally"]) {
    if ((await page.getByText(text).count()) > 0) {
      throw new Error(`Composer footer should not render workspace status text: ${text}`);
    }
  }
}

async function assertPermissionCardIsCompact(page) {
  const permissionCard = page.locator("section").filter({ hasText: "Validate Toro permission UI" });
  const className = (await permissionCard.first().getAttribute("class")) ?? "";
  if (className.includes("bg-amber-50")) {
    throw new Error("Permission card should not use the old amber alert background.");
  }
}

async function assertToolCallIsCompact(toolCall) {
  const className = (await toolCall.getAttribute("class")) ?? "";
  if (className.includes("rounded-[18px]") || className.includes("border ")) {
    throw new Error("Tool call should render as a compact transcript row, not a framed card.");
  }

  const status = toolCall
    .locator("span")
    .filter({ hasText: /^completed$/ })
    .first();
  const statusClassName = (await status.getAttribute("class")) ?? "";
  if (statusClassName.includes("rounded-full") || statusClassName.includes("border-emerald")) {
    throw new Error("Tool call status should render as quiet metadata, not a status pill.");
  }
}

async function assertTranscriptOrder(page) {
  const userTop = await locatorTop(page.getByText("Verify the Toro ACP UI loop.").first());
  const thinkingTop = await locatorTop(
    page.locator("details").filter({ hasText: "Thinking" }).first(),
  );
  const toolTop = await locatorTop(
    page.locator("details").filter({ hasText: "Validate Toro permission UI" }).last(),
  );
  const assistantTop = await locatorTop(
    page.getByText(/Toro demo agent received your prompt/).first(),
  );

  if (!(userTop < thinkingTop && thinkingTop < toolTop && toolTop < assistantTop)) {
    throw new Error(
      `Transcript is not chronological: user=${userTop}, thinking=${thinkingTop}, tool=${toolTop}, assistant=${assistantTop}`,
    );
  }
}

async function locatorTop(locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Expected transcript locator to have a bounding box.");
  }
  return box.y;
}

async function assertTranscriptDisclosureIsCompact(disclosure, label) {
  const className = (await disclosure.getAttribute("class")) ?? "";
  if (className.includes("rounded-[18px]") || className.includes("border ")) {
    throw new Error(`${label} should render as a compact transcript row, not a framed card.`);
  }
}

async function assertSidebarToggle(page) {
  const collapse = page.getByRole("button", { exact: true, name: "Collapse sidebar" });
  await collapse.click();
  if ((await page.locator("aside").count()) > 0) {
    throw new Error("Sidebar should be hidden after toggling it closed.");
  }
  await screenshot(page, "01-sidebar-hidden.png");
  await pause();

  await page.getByRole("button", { exact: true, name: "Toggle sidebar" }).click();
  await page.locator("aside").waitFor({ timeout: 5_000 });
  await page.getByRole("heading", { exact: true, name: "Projects" }).waitFor({ timeout: 5_000 });
}

async function assertComposerContextPicker(page) {
  await page.getByRole("button", { exact: true, name: "Add context" }).click();
  await page.getByRole("region", { exact: true, name: "Context sources" }).waitFor({
    timeout: 5_000,
  });
  const sourceButton = page.getByRole("button", { name: /^Attach context / }).first();
  await sourceButton.waitFor({ timeout: 5_000 });
  const sourceLabel = ((await sourceButton.getAttribute("aria-label")) ?? "").replace(
    "Attach context ",
    "",
  );
  await sourceButton.click();
  await expectPressed(sourceButton);
  await page.getByRole("button", { exact: true, name: `Remove context ${sourceLabel}` }).waitFor({
    timeout: 5_000,
  });
  await assertOnlyFunctionalButtons(page);
  await screenshot(page, "02-context-attached.png");
  await page.getByRole("button", { exact: true, name: `Remove context ${sourceLabel}` }).click();
  await page.getByRole("button", { exact: true, name: "Add context" }).click();
}

async function assertHeaderActions(page) {
  await page.getByRole("button", { exact: true, name: "More chat actions" }).click();
  await page.getByRole("button", { exact: true, name: "Copy chat title" }).click();
  await page.getByText("Copied chat title").waitFor({ timeout: 5_000 });
  await page.getByRole("button", { exact: true, name: "Copy workspace path" }).click();
  await page.getByText("Copied workspace path").waitFor({ timeout: 5_000 });
  await assertOnlyFunctionalButtons(page);
  await screenshot(page, "04-header-actions.png");
  await page.getByRole("button", { exact: true, name: "More chat actions" }).click();
}

async function assertSidebarChatRowsAreNavigationOnly(page) {
  const chatRows = await page
    .locator("aside button[aria-label^='Chat ']")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));
  const statusWords = ["completed", "running", "waiting", "failed", "cancelled", "connecting"];
  const rowsWithStatus = chatRows.filter((row) =>
    statusWords.some((status) => row.toLowerCase().includes(status)),
  );

  if (rowsWithStatus.length > 0) {
    throw new Error(`Sidebar chat rows should not show status pills: ${rowsWithStatus.join(", ")}`);
  }
}

async function assertOnlyFunctionalButtons(page, extraAllowedLabels = []) {
  const buttons = await page.locator("button").evaluateAll((nodes) =>
    nodes.map((node) => ({
      disabled: node.hasAttribute("disabled"),
      label: node.getAttribute("aria-label") ?? node.textContent?.replace(/\s+/g, " ").trim() ?? "",
    })),
  );
  const unexpected = buttons.filter(
    ({ disabled, label }) => disabled || !isKnownFunctionalButton(label, extraAllowedLabels),
  );

  if (unexpected.length > 0) {
    throw new Error(`Unexpected or disabled button controls: ${JSON.stringify(unexpected)}`);
  }
}

function isKnownFunctionalButton(label, extraAllowedLabels) {
  if (
    [
      "Open",
      "Open project",
      "Search",
      "Send",
      "Stop",
      "Host settings",
      "Toggle sidebar",
      "Collapse sidebar",
      "New chat",
      "Add context",
      "More chat actions",
      "Copy chat title",
      "Copy workspace path",
      "Copy message",
      "Copied message",
      "Good response",
      "Bad response",
      "Expand message",
      "Collapse message",
      ...extraAllowedLabels,
    ].includes(label)
  ) {
    return true;
  }
  return (
    label.startsWith("Attach context ") ||
    label.startsWith("Chat ") ||
    label.startsWith("Remove context ") ||
    label.startsWith(workspaceName)
  );
}

async function expectPressed(locator) {
  const started = Date.now();
  while (Date.now() - started < 5_000) {
    if ((await locator.getAttribute("aria-pressed")) === "true") {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Expected message action to become pressed.");
}

async function selectComposerOption(page, label, value) {
  const select = page.getByLabel(label);
  await select.selectOption(value);
  if ((await select.inputValue()) !== value) {
    throw new Error(`Composer ${label} did not select ${value}.`);
  }
}

async function assertHostSettingsToggle(page) {
  const settingsButton = page.getByRole("button", { exact: true, name: "Host settings" });
  if ((await page.getByRole("combobox", { exact: true, name: "Agent" }).count()) > 0) {
    throw new Error("Agent selector should be hidden until host settings are opened.");
  }

  await settingsButton.click();
  await page.getByRole("combobox", { exact: true, name: "Agent" }).waitFor({ timeout: 5_000 });
  await page
    .getByRole("combobox", { exact: true, name: "Environment" })
    .waitFor({ timeout: 5_000 });
  await assertOnlyFunctionalButtons(page);
  await screenshot(page, "00-host-settings.png");
  await settingsButton.click();

  if ((await page.getByRole("combobox", { exact: true, name: "Agent" }).count()) > 0) {
    throw new Error("Agent selector should hide after closing host settings.");
  }
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
