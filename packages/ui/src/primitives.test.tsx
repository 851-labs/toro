import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./button";
import { ToroSelect } from "./select";

describe("Toro primitives", () => {
  it("renders buttons through Base UI", () => {
    const html = renderToStaticMarkup(createElement(Button, { children: "Save" }));

    expect(html).toContain('data-base-ui-button="true"');
    expect(html).toContain("<button");
  });

  it("renders selects through Base UI", () => {
    const html = renderToStaticMarkup(
      createElement(ToroSelect, {
        ariaLabel: "Model",
        onValueChange: () => undefined,
        options: ["5.5 Medium", "5.5 High"],
        value: "5.5 Medium",
      }),
    );

    expect(html).toContain('data-base-ui-select="true"');
    expect(html).toContain("5.5 Medium");
  });
});
