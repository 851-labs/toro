import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexChatMessage } from "./message";

describe("CodexChatMessage", () => {
  it("renders completed text messages through react-markdown", () => {
    const html = renderToStaticMarkup(
      createElement(CodexChatMessage, {
        children: "**Done** with `markdown`.",
        role: "assistant",
      }),
    );

    expect(html).toContain('data-markdown-renderer="react-markdown"');
    expect(html).toContain("<strong>Done</strong>");
    expect(html).toContain("<code");
    expect(html).not.toContain("**Done**");
  });

  it("renders streaming text messages through streamdown", () => {
    const html = renderToStaticMarkup(
      createElement(CodexChatMessage, {
        children: "Streaming **markdown",
        isStreaming: true,
        role: "assistant",
      }),
    );

    expect(html).toContain('data-markdown-renderer="streamdown"');
    expect(html).toContain("Streaming");
  });
});
