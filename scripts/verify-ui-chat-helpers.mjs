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
  await screenshot(page, "12-editor-pane.png");
  await toggle.click();
  if ((await page.locator("[data-editor-pane='true']").count()) > 0) {
    throw new Error("Editor pane should close after toggling.");
  }
}
