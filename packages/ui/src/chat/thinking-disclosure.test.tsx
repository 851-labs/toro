import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexThinkingDisclosure } from "./thinking-disclosure";

describe("CodexThinkingDisclosure", () => {
  it("does not append an inline cursor dot to streaming thinking text", () => {
    const html = renderToStaticMarkup(
      createElement(
        CodexThinkingDisclosure,
        { defaultOpen: true, isStreaming: true },
        "Checking project context",
      ),
    );

    expect(html).toContain("Checking project context");
    expect(html).not.toContain("after:motion-safe:animate-pulse");
  });
});
