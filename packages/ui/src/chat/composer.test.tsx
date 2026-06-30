import { describe, expect, it } from "vitest";
import { shouldSubmitComposerKey } from "./composer";

describe("CodexComposer keyboard handling", () => {
  it("submits on plain Enter only", () => {
    expect(shouldSubmitComposerKey(key())).toBe(true);
    expect(shouldSubmitComposerKey(key({ shiftKey: true }))).toBe(false);
    expect(shouldSubmitComposerKey(key({ key: "a" }))).toBe(false);
    expect(shouldSubmitComposerKey(key({ metaKey: true }))).toBe(false);
    expect(shouldSubmitComposerKey(key({ nativeEvent: { isComposing: true } }))).toBe(false);
  });
});

function key(
  overrides: Partial<Parameters<typeof shouldSubmitComposerKey>[0]> = {},
): Parameters<typeof shouldSubmitComposerKey>[0] {
  return {
    altKey: false,
    ctrlKey: false,
    key: "Enter",
    metaKey: false,
    shiftKey: false,
    ...overrides,
  };
}
