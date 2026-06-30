export function createVerifyUiHelpers({ pause, screenshot, workspaceName, workspacePath }) {
  async function assertDeadControlsRemoved(page) {
    const deadButtons = ["Chat settings", "Dictate", "Scheduled", "Plugins", /Remote Sandbox/];

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
  async function assertSidebarWidthIsCodexLike(page) {
    const width = await page
      .locator("[data-sidebar-rail='true']")
      .evaluate((node) => node.getBoundingClientRect().width);
    if (width < 370 || width > 410) {
      throw new Error(`Sidebar width should be close to Codex desktop width, got ${width}.`);
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

  async function assertEmptySessionPrompt(page) {
    const heading = page.getByRole("heading", {
      exact: true,
      name: `What should we build in ${workspaceName}?`,
    });
    await heading.waitFor({ timeout: 5_000 });
    const headingBox = await heading.boundingBox();
    const fontSize = await heading.evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    if (fontSize < 32) {
      throw new Error(`Empty project prompt should use Codex-scale type, got ${fontSize}.`);
    }
    const composerBox = await page.locator("[data-composer-surface='true']").boundingBox();
    if (!headingBox || !composerBox || composerBox.y - (headingBox.y + headingBox.height) > 220) {
      throw new Error("Empty project prompt should sit close to the composer like Codex.");
    }
    if (composerBox.y > 660) {
      throw new Error(`Empty project composer is too low: ${composerBox.y}.`);
    }
    if ((await page.getByText("Toro Demo is ready.").count()) > 0) {
      throw new Error("Empty project chat should not render redundant ready-state subcopy.");
    }
  }
  async function assertComposerFooterIsCodexCompact(page) {
    if ((await page.getByText("Open a project to start").count()) > 0) {
      throw new Error("Composer footer should not render old workspace status copy.");
    }
    const strip = page.locator("[data-composer-context-strip='true']");
    if ((await strip.count()) === 0) return;
    if ((await strip.locator("button").count()) > 0) {
      throw new Error("Composer context strip should render passive metadata, not inert buttons.");
    }
    for (const text of [workspaceName, "Work locally", "main"]) {
      if ((await strip.getByText(text, { exact: true }).count()) === 0) {
        throw new Error(`Composer context strip is missing Codex-like metadata: ${text}`);
      }
    }
    if ((await strip.locator("[data-composer-context-chevron='true']").count()) < 2) {
      throw new Error("Composer context strip should show passive chevrons.");
    }
  }
  async function assertComposerAffordancesArePassive(page) {
    const affordances = await page.locator("[data-composer-affordance]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        kind: node.getAttribute("data-composer-affordance"),
        insideButton: Boolean(node.closest("button")),
      })),
    );
    const kinds = new Set(affordances.map((affordance) => affordance.kind));

    for (const kind of ["status", "voice"]) {
      if (!kinds.has(kind)) {
        throw new Error(`Missing passive composer affordance: ${kind}`);
      }
    }

    const interactive = affordances.filter((affordance) => affordance.insideButton);
    if (interactive.length > 0) {
      throw new Error(
        `Passive composer affordances should not render inside buttons: ${JSON.stringify(interactive)}`,
      );
    }
  }

  async function assertComposerWidthIsCodexLike(page) {
    const width = await composerSurfaceBounds(page, "width");
    if (width < 720 || width > 800) {
      throw new Error(`Composer width should be close to Codex desktop width, got ${width}.`);
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
        `Transcript should align to composer surface, got left delta ${leftDelta} and width delta ${widthDelta}.`,
      );
    }
  }

  async function assertComposerHeightIsCodexLike(page) {
    const height = await composerSurfaceBounds(page, "height");
    if (height < 135 || height > 155) {
      throw new Error(`Composer height should be close to Codex desktop height, got ${height}.`);
    }
  }

  async function composerSurfaceBounds(page, dimension) {
    return page
      .locator("[data-composer-surface='true']")
      .evaluate((node, key) => node.getBoundingClientRect()[key], dimension);
  }

  async function surfaceBounds(page, selector) {
    return page.locator(selector).evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, width: rect.width };
    });
  }

  async function assertPermissionCardIsCompact(page) {
    const permissionCard = page
      .locator("section")
      .filter({ hasText: "Validate Toro permission UI" });
    const className = (await permissionCard.first().getAttribute("class")) ?? "";
    if (className.includes("rounded-[18px]") || className.includes("border ")) {
      throw new Error(
        "Permission card should render as a compact transcript row, not a framed card.",
      );
    }
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
    if (/rounded-full|border-emerald|text-emerald/.test(statusClassName))
      throw new Error("Tool call status should render as quiet metadata.");
    const outputClassName =
      (await toolCall.locator("[data-tool-output='true']").first().getAttribute("class")) ?? "";
    if (
      outputClassName.includes("rounded-xl") ||
      outputClassName.includes("bg-zinc-50") ||
      outputClassName.includes("border-l")
    ) {
      throw new Error("Expanded tool output should render as a quiet indented block.");
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
    const box = await disclosure.boundingBox();
    if (!box || box.width > 760) throw new Error(`${label} disclosure is too wide.`);
    const bodyClassName = await disclosure.evaluate(
      (node) => node.querySelector("[data-thinking-body='true']")?.getAttribute("class") ?? "",
    );
    if (bodyClassName.includes("border-l")) {
      throw new Error(`${label} body should render without a decorative vertical rule.`);
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
  async function assertOpenInMenu(page) {
    await page.getByRole("button", { exact: true, name: "Open in" }).click();
    const marks = await page.locator("[data-vscode-mark='true']").count();
    if (marks < 2) throw new Error("Open in should use VS Code marks.");
    await page.getByRole("button", { exact: true, name: "Open in VS Code" }).waitFor({
      timeout: 5_000,
    });
    await page.getByRole("button", { exact: true, name: "Reveal in Finder" }).waitFor({
      timeout: 5_000,
    });
    await page.getByRole("button", { exact: true, name: "Copy workspace path" }).click();
    await page.getByText("Copied workspace path").waitFor({ timeout: 5_000 });
    await assertOnlyFunctionalButtons(page);
    await screenshot(page, "02-open-in-menu.png");
    await page.getByRole("button", { exact: true, name: "Open in" }).click();
  }

  async function assertSessionDetailsToggle(page) {
    const toggle = page.getByRole("button", { exact: true, name: "Toggle session controls" });
    await toggle.click();
    await page.getByRole("complementary", { exact: true, name: "Session details" }).waitFor({
      timeout: 5_000,
    });
    await page.getByRole("heading", { exact: true, name: "Plan" }).waitFor({ timeout: 5_000 });
    await page.getByRole("heading", { exact: true, name: "Tool calls" }).waitFor({
      timeout: 5_000,
    });
    await assertOnlyFunctionalButtons(page);
    await screenshot(page, "04-session-details.png");
    await toggle.click();
    if (
      (await page.getByRole("complementary", { exact: true, name: "Session details" }).count()) > 0
    ) {
      throw new Error("Session details panel should close after toggling.");
    }
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
      throw new Error(
        `Sidebar chat rows should not show status pills: ${rowsWithStatus.join(", ")}`,
      );
    }
  }

  async function assertCurrentChatIsFirstInProject(page) {
    const sections = await page.locator("[data-sidebar-section='true']").evaluateAll((nodes) =>
      nodes.map((node) => ({
        chats: Array.from(node.querySelectorAll("button[aria-label^='Chat ']")).map((chat) =>
          chat.getAttribute("aria-current"),
        ),
        title: node.querySelector("h2")?.textContent?.trim() ?? "",
      })),
    );
    const projects = sections.find((section) => section.title === "Projects");
    const chats = sections.find((section) => section.title === "Chats");
    if (!projects || !chats) throw new Error("Missing Projects or Chats sidebar section.");
    if (projects.chats.length > 0)
      throw new Error("Project rows should not contain nested chat rows.");
    if (chats.chats.length === 0) throw new Error("Expected at least one chat row.");
    if (chats.chats[0] !== "page") throw new Error("Current chat should be first in Chats.");
  }
  async function assertOnlyFunctionalButtons(page, extraAllowedLabels = []) {
    const buttons = await page.locator("button").evaluateAll((nodes) =>
      nodes.map((node) => ({
        disabled: node.hasAttribute("disabled"),
        label:
          node.getAttribute("aria-label") ?? node.textContent?.replace(/\s+/g, " ").trim() ?? "",
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
        "Open in",
        "Open in VS Code",
        "Open project",
        "Reveal in Finder",
        "Search",
        "Send",
        "Stop",
        "Host settings",
        "Toggle sidebar",
        "Toggle session details",
        "Toggle session controls",
        "Toggle editor pane",
        "Collapse sidebar",
        "New chat",
        "Add context",
        "Back",
        "Forward",
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
    const visibleLabel = ((await settingsButton.textContent()) ?? "").trim();
    if (visibleLabel.length > 0) {
      throw new Error("Host settings should render as a compact icon button, not a text chip.");
    }
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

  return {
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
    assertTranscriptDisclosureIsCompact,
    assertTranscriptAlignsWithComposer,
    assertTranscriptOrder,
    expectPressed,
    selectComposerOption,
  };
}
