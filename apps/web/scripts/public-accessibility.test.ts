import { describe, expect, it } from "vitest";
import {
  controlNameFailures,
  pageAccessibilityFailures,
  parseAccessibilityArgs,
  type ControlAudit,
} from "./public-accessibility";

describe("public accessibility script helpers", () => {
  it("parses custom route additions", () => {
    const options = parseAccessibilityArgs([
      "--base-url",
      "https://papiskill.com",
      "--route",
      "/docs",
      "--json",
    ]);

    expect(options.baseUrl).toBe("https://papiskill.com");
    expect(options.routes).toContain("/docs");
    expect(options.json).toBe(true);
  });

  it("treats explicit labels as names and ignores placeholders", () => {
    const controls: ControlAudit[] = [
      control({ selector: "input search", ariaLabel: "Search skills", placeholder: "Search..." }),
      control({ selector: "input placeholder only", placeholder: "Search..." }),
      control({ selector: "button text", tag: "button", text: "Download" }),
      control({ selector: "input hidden", inputType: "hidden" }),
    ];

    expect(controlNameFailures(controls).map((item) => item.selector)).toEqual([
      "input placeholder only",
    ]);
  });

  it("reports landmark, skip-link, and unlabeled-control failures", () => {
    expect(
      pageAccessibilityFailures({
        route: "/skills",
        url: "https://papiskill.com/skills",
        status: 200,
        mainCount: 2,
        h1Texts: [],
        skipLinkText: null,
        skipTargetExists: false,
        skipLinkFirstFocusable: false,
        skipEnterTargetId: null,
        duplicateIds: ["main-content"],
        unlabeledControls: [control({ selector: "button" })],
        missingImageAltSelectors: ["img"],
        consoleWarnings: 1,
        consoleErrors: 1,
      }),
    ).toEqual([
      "1 console errors",
      "1 console warnings",
      "expected 1 main landmark, found 2",
      "expected 1 h1, found 0",
      "missing skip link",
      "missing skip link target",
      "skip link is not first focus target",
      "skip link does not move focus to main content",
      "duplicate ids: main-content",
      "unlabeled controls: button",
      "images missing alt: img",
    ]);
  });
});

function control(overrides: Partial<ControlAudit>): ControlAudit {
  return {
    tag: "input",
    selector: "input",
    text: "",
    ariaLabel: "",
    ariaLabelledBy: "",
    title: "",
    labelText: "",
    placeholder: "",
    inputType: null,
    ...overrides,
  };
}
