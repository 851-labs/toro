export function createVerifyUiHelpers({ pause, screenshot, workspaceName, workspacePath }) {
  async function assertDeadControlsRemoved(page) {
    const deadButtons = [
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
    const width = await page
      .locator("[data-composer-surface='true']")
      .evaluate((node) => node.getBoundingClientRect().width);
    if (width < 880 || width > 980) {
      throw new Error(`Composer width should be close to Codex desktop width, got ${width}.`);
    }
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

  async function assertOpenInMenu(page) {
    await page.getByRole("button", { exact: true, name: "Open in" }).click();
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
    const toggle = page.getByRole("button", { exact: true, name: "Toggle session details" });
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
    assertSidebarToggle,
    assertToolCallIsCompact,
    assertTranscriptDisclosureIsCompact,
    assertTranscriptOrder,
    expectPressed,
    selectComposerOption,
  };
}
