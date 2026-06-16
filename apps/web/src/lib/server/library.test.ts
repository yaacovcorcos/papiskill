import { describe, expect, it } from "vitest";
import { validateForkDraftPackage } from "./library";

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
    expect(result.skillYml).toContain('name: "Code Review"');
    expect(result.files).toContainEqual({ path: "SKILL.md", content: baseDraft.skillMarkdown });
    expect(result.files).toContainEqual({ path: "docs/checklist.md", content: "supporting docs stay attached" });
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
