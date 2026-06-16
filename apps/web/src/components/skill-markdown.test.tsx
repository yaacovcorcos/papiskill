import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  RegistrySourceCard,
  registrySourcePath,
} from "./registry-source-card";
import { SkillMarkdown } from "./skill-markdown";
import { SkillMarkdownEditor } from "./skill-markdown-editor";
import { SkillSourceBlock } from "./skill-source-block";
import { SkillValidationBadges, SkillValidationPanel, validationSummary } from "./skill-validation";

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

describe("RegistrySourceCard", () => {
  it("builds exact git registry source paths for global and community skills", () => {
    expect(
      registrySourcePath({ registryKind: "global", slug: "code-review" }),
    ).toBe("registry/official/code-review");
    expect(
      registrySourcePath({ registryKind: "community", slug: "docs" }),
    ).toBe("registry/community/docs");
    expect(
      registrySourcePath({ registryKind: "profile", slug: "mine" }),
    ).toBeNull();
  });

  it("renders source and edit links for global registry packages", () => {
    const html = renderToStaticMarkup(
      <RegistrySourceCard registryKind="global" slug="code-review" />,
    );

    expect(html).toContain("registry/official/code-review/");
    expect(html).toContain(
      "https://github.com/yaacovcorcos/papiskill/tree/main/registry/official/code-review",
    );
    expect(html).toContain(
      "https://github.com/yaacovcorcos/papiskill/edit/main/registry/official/code-review/SKILL.md",
    );
    expect(html).toContain("Contribution guide");
  });
});

describe("SkillValidation", () => {
  it("renders warning counts and warning messages", () => {
    const issues = [
      {
        level: "warning" as const,
        code: "mentions-network",
        message: "Skill mentions network access.",
        path: "SKILL.md",
      },
    ];

    const badges = renderToStaticMarkup(<SkillValidationBadges issues={issues} />);
    const panel = renderToStaticMarkup(
      <SkillValidationPanel issues={issues} note="Review before installing." />,
    );

    expect(validationSummary(issues)).toBe("1 warning");
    expect(badges).toContain("1 warning");
    expect(panel).toContain("Validation issues");
    expect(panel).toContain("Skill mentions network access.");
    expect(panel).toContain("SKILL.md");
  });
});
