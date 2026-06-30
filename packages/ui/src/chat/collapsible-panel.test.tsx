import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { CodexCollapsiblePanel } from "./collapsible-panel";

describe("CodexCollapsiblePanel", () => {
  it("uses Base UI transition-state classes for height animation", () => {
    const html = renderToStaticMarkup(
      createElement(
        Collapsible.Root,
        { defaultOpen: true },
        createElement(CodexCollapsiblePanel, null, "Panel content"),
      ),
    );

    expect(html).toContain('data-collapsible-panel-animated="true"');
    expect(html).toContain("h-[var(--collapsible-panel-height)]");
    expect(html).toContain("data-[starting-style]:h-0");
    expect(html).toContain("data-[ending-style]:h-0");
  });
});
