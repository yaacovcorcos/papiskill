import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillsLayout } from "./skills-layout";

describe("SkillsLayout", () => {
  it("reserves a collapsible filter rail from medium desktop layouts upward", () => {
    const html = renderToStaticMarkup(
      <SkillsLayout filters={<div>Filters</div>} detail={<aside>Preview</aside>}>
        <section>Skills</section>
      </SkillsLayout>,
    );

    expect(html).toContain("min-[900px]:grid-cols-[270px_minmax(0,1fr)]");
    expect(html).toContain("xl:grid-cols-[270px_minmax(0,1fr)_430px]");
    expect(html).toContain("min-[900px]:block");
    expect(html).toContain("focus-visible:outline-none");
    expect(html).not.toContain("focus-ring");
  });
});
