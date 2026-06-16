import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SkillMarkdown } from "./skill-markdown";
import { SkillMarkdownEditor } from "./skill-markdown-editor";
import { SkillSourceBlock } from "./skill-source-block";

describe("SkillMarkdown", () => {
  it("renders designed markdown without YAML frontmatter", () => {
    const html = renderToStaticMarkup(
      <SkillMarkdown
        markdown={`---
name: sample
description: Internal metadata
---

# Sample Skill

Use \`SKILL.md\` well.

| Field | Value |
| --- | --- |
| Scope | Clear |
`}
      />,
    );

    expect(html).toContain('class="skill-markdown"');
    expect(html).toContain("<h1>Sample Skill</h1>");
    expect(html).toContain("<table>");
    expect(html).toContain("<code>SKILL.md</code>");
    expect(html).not.toContain("description: Internal metadata");
  });
});

describe("SkillMarkdownEditor", () => {
  it("keeps the named markdown textarea in the form while rendering preview controls", () => {
    const html = renderToStaticMarkup(
      <SkillMarkdownEditor name="skillMarkdown" defaultValue="# Editable Skill" />,
    );

    expect(html).toContain('name="skillMarkdown"');
    expect(html).toContain("Write");
    expect(html).toContain("Preview");
    expect(html).toContain("Split");
    expect(html).toContain("<h1>Editable Skill</h1>");
  });
});

describe("SkillSourceBlock", () => {
  it("renders the exact raw SKILL.md source with a copy affordance", () => {
    const html = renderToStaticMarkup(
      <SkillSourceBlock markdown={"---\nname: sample\n---\n\n# Sample"} />,
    );

    expect(html).toContain("Raw SKILL.md");
    expect(html).toContain("Copy Raw SKILL.md");
    expect(html).toContain("name: sample");
    expect(html).toContain("# Sample");
  });
});
