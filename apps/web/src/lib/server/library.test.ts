import { describe, expect, it } from "vitest";
import YAML from "yaml";
import {
  buildBlankLibraryDraft,
  getVisibleLibrarySource,
  librarySourceFromCatalogSkill,
  validateForkDraftPackage,
} from "./library";

const baseDraft = {
  slug: "code-review",
  name: "Code Review",
  summary: "Review code changes for regressions and missing tests.",
  description: "A portable skill for reviewing diffs, pull requests, and local patches before promotion.",
  visibility: "private",
  version: "0.1.0",
  license: "MIT",
  categories: ["coding"],
  tags: ["review"],
  compatibleWith: ["generic-agent"],
  installTargets: { "generic-agent": "~/.agents/skills" },
  skillMarkdown: [
    "# Code Review",
    "",
    "Use this skill when reviewing code changes.",
    "Prioritize concrete bugs, regressions, missing tests, and risky assumptions.",
  ].join("\n"),
  existingFiles: [
    { path: "SKILL.md", content: "old markdown" },
    { path: "skill.yml", content: "old: manifest" },
    { path: "docs/checklist.md", content: "supporting docs stay attached" },
  ],
};

describe("validateForkDraftPackage", () => {
  it("builds and validates the submitted draft package before persistence", () => {
    const result = validateForkDraftPackage(baseDraft);

    expect(result.hasBlockingErrors).toBe(false);
    expect(result.validation.ok).toBe(true);
    expect(YAML.parse(result.skillYml)).toMatchObject({
      name: "Code Review",
      install_targets: { "generic-agent": "~/.agents/skills" },
    });
    expect(result.files).toContainEqual({ path: "SKILL.md", content: baseDraft.skillMarkdown });
    expect(result.files).toContainEqual({ path: "docs/checklist.md", content: "supporting docs stay attached" });
  });

  it("serializes YAML safely when editable fields contain YAML syntax", () => {
    const result = validateForkDraftPackage({
      ...baseDraft,
      name: "Review: API #1",
      summary: "Review code paths: auth, cache, and CLI behavior.",
      description: "Line one includes #hash.\nLine two includes key: value.",
      tags: ["review:api", "cache # hot"],
      installTargets: {
        codex: "~/skills/code-review:dev # local",
        "generic-agent": "~/.agents/skills",
      },
    });

    expect(result.hasBlockingErrors).toBe(false);
    expect(YAML.parse(result.skillYml)).toMatchObject({
      name: "Review: API #1",
      description: "Line one includes #hash.\nLine two includes key: value.",
      tags: ["review:api", "cache # hot"],
      install_targets: {
        codex: "~/skills/code-review:dev # local",
        "generic-agent": "~/.agents/skills",
      },
    });
  });

  it("flags invalid draft metadata as a blocking package error", () => {
    const result = validateForkDraftPackage({
      ...baseDraft,
      summary: "too short",
      description: "also too short",
    });

    expect(result.hasBlockingErrors).toBe(true);
    expect(result.validation.ok).toBe(false);
    expect(result.validation.issues).toEqual([
      expect.objectContaining({
        level: "error",
        code: "invalid-package",
      }),
    ]);
  });
});

describe("buildBlankLibraryDraft", () => {
  it("creates a valid private starter package for original skills", () => {
    const result = buildBlankLibraryDraft("new-review-flow");
    const manifest = YAML.parse(result.files.find((file) => file.path === "skill.yml")?.content ?? "");

    expect(result.validation.ok).toBe(true);
    expect(result.validation.issues).toEqual([]);
    expect(result.slug).toBe("new-review-flow");
    expect(manifest).toMatchObject({
      id: "new-review-flow",
      name: "New Review Flow",
      visibility: "private",
      compatible_with: ["generic-agent"],
      install_targets: {
        "generic-agent": "~/.agents/skills/new-review-flow",
      },
    });
    expect(result.files).toEqual([
      expect.objectContaining({ path: "SKILL.md" }),
      expect.objectContaining({ path: "skill.yml" }),
    ]);
  });
});

describe("librarySourceFromCatalogSkill", () => {
  it("builds a copyable source from file-backed official registry details", () => {
    const source = librarySourceFromCatalogSkill({
      id: "code-review",
      slug: "code-review",
      name: "Code Review",
      summary: "Review changes.",
      description: "Review code changes before promotion.",
      registryKind: "global",
      visibility: "public",
      author: "yaacov",
      version: "1.2.3",
      license: "Apache-2.0",
      compatibleWith: ["generic-agent"],
      categories: ["coding"],
      tags: ["review"],
      installCommand: "papiskill install official/code-review",
      starCount: 0,
      commentCount: 0,
      validationIssues: [],
      markdown: "# Code Review",
      files: [
        { path: "SKILL.md", content: "# Code Review" },
        { path: "skill.yml", content: "id: code-review" },
      ],
      installTargets: { "generic-agent": "~/.agents/skills/code-review" },
    });

    expect(source).toMatchObject({
      sourceReference: "official/code-review",
      slug: "code-review",
      name: "Code Review",
      version: "1.2.3",
      license: "Apache-2.0",
      installTargets: { "generic-agent": "~/.agents/skills/code-review" },
    });
    expect(source.sourceSkillId).toBeUndefined();
    expect(source.files).toHaveLength(2);
  });
});

describe("getVisibleLibrarySource", () => {
  it("uses the git-backed registry package when copying official skills", async () => {
    const source = await getVisibleLibrarySource("official/code-review", "user_1");

    expect(source).toEqual(
      expect.objectContaining({
        sourceReference: "official/code-review",
        name: "Code Change Review",
      }),
    );
    expect(source?.sourceSkillId).toBeUndefined();
    expect(source?.files).toContainEqual(
      expect.objectContaining({
        path: "SKILL.md",
        content: expect.stringContaining("# Code Change Review"),
      }),
    );
  });
});
