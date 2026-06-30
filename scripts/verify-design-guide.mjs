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

await page.goto(appUrl, { waitUntil: "domcontentloaded" });
await page.getByText("Codex Chat Surface").waitFor({ timeout: 5_000 });
await page.getByText("Streaming text keeps").waitFor({ timeout: 5_000 });
await page.getByText("Thinking").waitFor({ timeout: 5_000 });
await page.getByText("Reviewing project context").waitFor({ timeout: 5_000 });
await page.getByText("Validate Toro permission UI").first().waitFor({ timeout: 5_000 });
await page.getByText("tool cards are working").waitFor({ timeout: 5_000 });
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
await screenshot(page, "01-chat-elements.png");
await pause();

await page.getByRole("button", { exact: true, name: "Allow once" }).click();
await page.getByText("allowed once").waitFor({ timeout: 5_000 });
await screenshot(page, "02-permission-responded.png");
await pause();

const composer = page.getByLabel("Message agent");
await composer.fill("Design guide composer check");
await page.getByRole("button", { exact: true, name: "Send" }).click();
if ((await composer.inputValue()) !== "") {
  throw new Error("Design guide composer did not clear after send.");
}
await screenshot(page, "03-composer-cleared.png");
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
  const pressed = await locator.getAttribute("aria-pressed");
  if (pressed !== "true") {
    throw new Error("Expected design-guide message action to become pressed.");
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
