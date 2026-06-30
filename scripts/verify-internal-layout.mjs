const sidebarSelector = "[data-internal-sidebar='true']";
const itemSelector = "[data-internal-sidebar-item='true']";

export async function assertInternalSidebarLayout(page) {
  const shellStyle = await page
    .locator(".internal-shell")
    .evaluate((node) => getComputedStyle(node));
  const sidebar = page.locator(sidebarSelector);
  const item = page.locator(itemSelector).first();
  const box = await sidebar.boundingBox();
  const itemBox = await item.boundingBox();
  const sidebarStyle = await sidebar.evaluate((node) => getComputedStyle(node));
  const itemStyle = await item.evaluate((node) => getComputedStyle(node));

  if (!shellStyle.gridTemplateColumns.startsWith("256px ")) {
    throw new Error(`Internal shell grid is malformed: ${shellStyle.gridTemplateColumns}.`);
  }
  assertNear(box?.width ?? 0, 256, "Internal sidebar width");
  assertNear(parseFloat(sidebarStyle.paddingLeft), 12, "Internal sidebar left padding");
  assertNear(parseFloat(sidebarStyle.paddingRight), 12, "Internal sidebar right padding");
  assertNear(itemBox?.height ?? 0, 28, "Internal sidebar item height");
  assertNear(parseFloat(itemStyle.fontSize), 13, "Internal sidebar item font size");
}

function assertNear(actual, expected, label) {
  if (Math.abs(actual - expected) > 0.5) {
    throw new Error(`${label} should be ${expected}px, got ${actual}px.`);
  }
}
