import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillsLayout } from "./skills-layout";

describe("SkillsLayout", () => {
  it("uses a two-pane desktop layout without a permanent filter sidebar", () => {
    const html = renderToStaticMarkup(
      <SkillsLayout detail={<aside>Preview</aside>}>
        <section>Skills</section>
      </SkillsLayout>,
    );

    expect(html).toContain("xl:grid-cols-[minmax(0,1fr)_430px]");
    expect(html).toContain("<section>Skills</section>");
    expect(html).toContain("<aside>Preview</aside>");
    expect(html).not.toContain("Filters");
  });
});
