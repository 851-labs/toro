import { chromium } from "@playwright/test";
import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const appUrl = process.env.TORO_APP_URL ?? "http://127.0.0.1:1420";
const hostUrl = process.env.TORO_HOST_URL ?? "http://127.0.0.1:17345";
const workspacePath = process.env.TORO_VERIFY_WORKSPACE ?? resolve(".");
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
const composer = page.getByLabel("Message agent");
const initialComposerText = "Typing before a session should work.";
await composer.fill(initialComposerText);
if ((await composer.inputValue()) !== initialComposerText) {
  throw new Error("Composer did not accept text before a session was created.");
}
await composer.fill("");
await screenshot(page, "01-initial-shell.png");
await pause();

await page.getByPlaceholder("/path/to/workspace").fill(workspacePath);
await page.getByRole("button", { exact: true, name: "Add" }).click();
await page.getByText("toro").first().waitFor({ timeout: 5_000 });
await screenshot(page, "02-workspace-opened.png");
await pause();

await page.getByRole("button", { exact: true, name: "Session" }).click();
await page
  .getByText(/Toro Demo in/)
  .first()
  .waitFor({ timeout: 10_000 });
await page.getByRole("button", { name: /Chat Toro Demo in toro/ }).waitFor({ timeout: 5_000 });
await screenshot(page, "03-session-created.png");
await pause();

await composer.fill("Verify the Toro ACP UI loop.");
await page.getByRole("button", { exact: true, name: "Send" }).click();
await page.getByText("Validate Toro permission UI").waitFor({ timeout: 10_000 });
await screenshot(page, "04-permission-request.png");
await pause();

await page.getByRole("button", { name: "Allow once" }).click();
await page.getByText(/tool cards are working/).waitFor({ timeout: 10_000 });
await screenshot(page, "05-streaming-complete.png");
await pause();

const packageJson = page.getByRole("button", { name: "package.json" }).first();
if (await packageJson.count()) {
  await packageJson.click();
  await page.waitForTimeout(500);
  await screenshot(page, "06-file-preview.png");
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
    "Search",
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
