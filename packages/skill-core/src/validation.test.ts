import { describe, expect, it } from "vitest";
import { resolveInstallTarget } from "./install-targets.js";
import { validateSkillPackage } from "./validation.js";

const validFiles = [
  {
    path: "skill.yml",
    content: `
id: code-review
name: Code Review
summary: Review code changes for bugs, risks, and missing tests.
description: A portable reviewer skill for agentic code review workflows.
license: MIT
categories: [coding]
tags: [review, testing]
compatible_with: [codex, claude-code, cursor, generic-agent]
install_targets:
  codex: ~/.codex/skills/code-review
`,
  },
  {
    path: "SKILL.md",
    content: "Use this skill to review code. Prioritize bugs, regressions, missing tests, security risks, and precise file references.",
  },
];

describe("validateSkillPackage", () => {
  it("accepts a valid package", () => {
    const result = validateSkillPackage(validFiles);
    expect(result.ok).toBe(true);
    expect(result.package?.manifest.id).toBe("code-review");
  });

  it("rejects missing package files", () => {
    const result = validateSkillPackage([{ path: "SKILL.md", content: "hello" }]);
    expect(result.ok).toBe(false);
    expect(result.issues[0]?.code).toBe("invalid-package");
  });

  it("rejects absolute paths, traversal, and unexpected top-level files", () => {
    for (const files of [
      validFiles.map((file) => file.path === "skill.yml" ? { ...file, path: "/skill.yml" } : file),
      [...validFiles, { path: "../outside.md", content: "escape" }],
      [...validFiles, { path: "secrets.env", content: "TOKEN=value" }],
    ]) {
      const result = validateSkillPackage(files);
      expect(result.ok).toBe(false);
      expect(result.issues[0]?.code).toBe("invalid-package");
    }
  });

  it("keeps security-sensitive warnings separate from structural errors", () => {
    const result = validateSkillPackage([
      ...validFiles.map((file) =>
        file.path === "SKILL.md"
          ? { ...file, content: `${file.content}\nUse curl to call https://example.com with a token only after review.` }
          : file,
      ),
      { path: "scripts/check.sh", content: "echo ok\n" },
    ]);

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ level: "warning", code: "contains-scripts" }),
        expect.objectContaining({ level: "warning", code: "mentions-shell" }),
        expect.objectContaining({ level: "warning", code: "mentions-network" }),
      ]),
    );
  });

  it("flags API key wording with separators", () => {
    const result = validateSkillPackage(validFiles.map((file) =>
      file.path === "SKILL.md"
        ? { ...file, content: `${file.content}\nConfigure XQUIK_API_KEY before using API-key backed tools.` }
        : file,
    ));

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ level: "warning", code: "mentions-network" }),
      ]),
    );
  });
});

describe("resolveInstallTarget", () => {
  it("uses manifest targets before presets", () => {
    const result = validateSkillPackage(validFiles);
    expect(result.package).toBeDefined();

    const target = resolveInstallTarget(result.package!.manifest, { target: "codex" });
    expect(target.source).toBe("manifest");
    expect(target.directory).toContain(".codex");
  });

  it("allows custom directories", () => {
    const result = validateSkillPackage(validFiles);
    const target = resolveInstallTarget(result.package!.manifest, {
      directory: "/tmp/my-skill",
    });
    expect(target.target).toBe("custom");
    expect(target.directory).toBe("/tmp/my-skill");
  });
});
