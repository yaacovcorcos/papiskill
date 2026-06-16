import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillsLayout } from "./skills-layout";

describe("SkillsLayout", () => {
  it("reserves the persistent filter rail for extra-wide registry layouts", () => {
    const html = renderToStaticMarkup(
      <SkillsLayout filters={<div>Filters</div>} detail={<aside>Preview</aside>}>
        <section>Skills</section>
      </SkillsLayout>,
    );

    expect(html).toContain("xl:grid-cols-[250px_minmax(0,1fr)_430px]");
    expect(html).toContain("xl:block");
    expect(html).not.toContain("min-[900px]:block");
  });
});
