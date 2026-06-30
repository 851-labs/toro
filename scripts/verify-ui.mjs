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
  assertDeadControlsRemoved,
  assertDesktopDebugLogsHidden,
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
await assertOpenInMenu(page);
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
await assertSessionDetailsToggle(page);
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
