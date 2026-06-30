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
await page.getByText("Toro").first().waitFor({ timeout: 5_000 });
await assertDeadControlsRemoved(page);
await assertPrimarySidebarSimplified(page);
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

await page.getByLabel("Project path").fill(workspacePath);
await page.getByRole("button", { exact: true, name: "Open" }).click();
await page.getByText("toro").first().waitFor({ timeout: 5_000 });
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

await page.getByRole("button", { exact: true, name: "Session" }).click();
await page
  .getByText(/Toro Demo in/)
  .first()
  .waitFor({ timeout: 10_000 });
await page
  .getByRole("button", { name: /Chat Toro Demo in toro/ })
  .first()
  .waitFor({ timeout: 5_000 });
await assertPrimarySidebarSimplified(page);
await assertDesktopDebugLogsHidden(page);
await assertOnlyFunctionalButtons(page);
await screenshot(page, "04-session-created.png");
await pause();

await composer.fill("Verify the Toro ACP UI loop.");
await page.getByRole("button", { exact: true, name: "Send" }).click();
await page.getByText("Thinking").waitFor({ timeout: 10_000 });
await page.getByText("working").waitFor({ timeout: 10_000 });
await page.getByText(/Checking project context/).waitFor({ timeout: 10_000 });
if ((await page.getByText("Validate Toro permission UI").count()) > 0) {
  throw new Error("Permission prompt appeared before the thinking checkpoint.");
}
await assertOnlyFunctionalButtons(page);
await screenshot(page, "05-thinking.png");
await pause();

await page.getByText("Validate Toro permission UI").waitFor({ timeout: 10_000 });
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
const toolCall = page.locator("details").filter({ hasText: "Validate Toro permission UI" }).last();
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
    "More chat actions",
    "Open in",
    "Chat settings",
    "Toggle preview",
    "Add context",
    "Dictate",
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
      "Session",
      "Open",
      "Search",
      "Send",
      "Stop",
      "Host settings",
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
  return label.startsWith("Chat ") || label.startsWith(workspaceName);
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
