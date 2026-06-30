import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CodexPlanDisclosure } from "./plan";

describe("CodexPlanDisclosure", () => {
  it("renders expanded plan status as quiet transcript metadata", () => {
    const html = renderToStaticMarkup(
      createElement(CodexPlanDisclosure, {
        defaultOpen: true,
        entries: [
          { content: "Match Codex message rhythm.", status: "completed" },
          { content: "Keep the verifier running.", status: "in_progress" },
          { content: "Record the visual evidence.", status: "pending" },
        ],
      }),
    );

    expect(html).toContain('data-plan-status-label="completed"');
    expect(html).toContain('data-base-ui-collapsible="true"');
    expect(html).toContain('data-collapsible-panel-animated="true"');
    expect(html).not.toMatch(/text-(emerald|amber)|bg-(emerald|amber)/);
    expect(html).toContain("1 of 3 complete");
  });
});
