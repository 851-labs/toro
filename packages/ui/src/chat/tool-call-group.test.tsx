import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexToolCall } from "./tool-call";
import { CodexToolCallGroup } from "./tool-call-group";

describe("CodexToolCallGroup", () => {
  it("renders a Base UI disclosure that groups individual tool calls", () => {
    const html = renderToStaticMarkup(
      createElement(
        CodexToolCallGroup,
        { completedCount: 1, count: 2 },
        createElement(CodexToolCall, {
          children: "ok",
          kind: "execute",
          status: "completed",
          title: "Validate Toro permission UI",
        }),
        createElement(CodexToolCall, {
          kind: "execute",
          status: "in_progress",
          title: "Collect workspace context",
        }),
      ),
    );

    expect(html).toContain('data-base-ui-collapsible="true"');
    expect(html).toContain('data-tool-call-group="true"');
    expect(html).toContain("2 tool calls");
    expect(html).toContain("1 of 2 complete");
    expect(html.match(/data-tool-call="true"/g)).toHaveLength(2);
  });
});
