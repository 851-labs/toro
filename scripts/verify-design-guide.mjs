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
await page.getByText("Validate Toro permission UI").first().waitFor({ timeout: 5_000 });
await page.getByText("tool cards are working").waitFor({ timeout: 5_000 });
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
await screenshot(page, "02-message-actions.png");
await pause();

await page.getByRole("button", { exact: true, name: "Allow once" }).click();
await page.getByText("allowed once").waitFor({ timeout: 5_000 });
await screenshot(page, "03-permission-responded.png");
await pause();

await page.getByRole("button", { exact: true, name: "Sidebar Groups" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Sidebar Groups" }));
await page.getByText("Codex Sidebar Groups").waitFor({ timeout: 5_000 });
await page.getByText("Composer context picker").waitFor({ timeout: 5_000 });
await assertSidebarStoryWidth(page);
await screenshot(page, "04-sidebar-groups.png");
await pause();

await page.getByRole("button", { exact: true, name: "Empty States" }).click();
await expectPressed(page.getByRole("button", { exact: true, name: "Empty States" }));
await page.getByText("Codex Empty States").waitFor({ timeout: 5_000 });
await page
  .getByRole("heading", { exact: true, name: "What should we build in toro?" })
  .waitFor({ timeout: 5_000 });
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
