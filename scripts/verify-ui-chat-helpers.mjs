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
