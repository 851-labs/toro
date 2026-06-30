export async function assertSharedChatMessages(page) {
  if ((await page.locator("[data-chat-message='true']").count()) < 1)
    throw new Error("Desktop transcript should use shared Codex chat message primitives.");
  if (
    await page
      .locator("[data-chat-message-role='assistant'] [data-chat-message-shell='true']")
      .evaluateAll((nodes) =>
        nodes.some((node) => node.getAttribute("class")?.includes("max-w-[72%]")),
      )
  )
    throw new Error("Assistant messages should use the wider Codex transcript rail.");
}

export async function assertPendingPermissionToolCall(page) {
  const pending = page
    .locator("[data-tool-call='true']")
    .filter({ hasText: /Validate Toro permission UI/ })
    .filter({ hasText: "pending" });
  await pending.waitFor({ timeout: 5_000 });
  await pending.locator("[data-tool-call-live='true']").waitFor({ timeout: 5_000 });
}

export async function assertEditorPaneToggle(page, screenshot) {
  const toggle = page.getByRole("button", { exact: true, name: "Toggle editor pane" });
  await toggle.click();
  const pane = page.locator("[data-editor-pane='true']");
  await pane.waitFor({ timeout: 5_000 });
  await page.waitForFunction(() => {
    const text = document.querySelector("[data-editor-pane='true']")?.textContent ?? "";
    return text.includes("package.json") && text.includes('"scripts"');
  });
  await screenshot(page, "13-editor-pane.png");
  await toggle.click();
  if ((await page.locator("[data-editor-pane='true']").count()) > 0) {
    throw new Error("Editor pane should close after toggling.");
  }
}

export async function assertNoFeedbackMessageActions(page) {
  for (const label of ["Good response", "Bad response"]) {
    if ((await page.getByRole("button", { exact: true, name: label }).count()) > 0) {
      throw new Error(`${label} action should not render.`);
    }
  }
}

export async function assertMultiMessageSameChat(page) {
  const messages = page.locator("[data-chat-message='true']");
  const roles = await messages.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-chat-message-role")),
  );
  if (roles.join(",") !== "user,assistant,user,assistant") {
    throw new Error(`Expected two user/assistant turns in one chat, got ${roles.join(",")}.`);
  }
  const activeChats = await page.locator("aside button[aria-current='page']").count();
  if (activeChats !== 1) throw new Error(`Expected one active chat row, got ${activeChats}.`);
  await page.getByText("Keep this in the same chat.").waitFor({ timeout: 5_000 });
  await page.getByText(/received your follow-up/).waitFor({ timeout: 5_000 });
  await page.getByText(/same chat kept prior messages/).waitFor({ timeout: 10_000 });
  await page.getByRole("button", { exact: true, name: "Stop" }).waitFor({
    state: "detached",
    timeout: 10_000,
  });
}
