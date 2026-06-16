import { describe, expect, it } from "vitest";
import {
  buildSkillPackageZip,
  normalizeArchiveFiles,
  packageDownloadFilename,
} from "./package-archive";

describe("package archive downloads", () => {
  it("builds a zip containing normalized package files under a package root", () => {
    const zip = buildSkillPackageZip({
      slug: "code-review",
      files: [
        { path: "SKILL.md", content: "# Code Review" },
        { path: "skill.yml", content: "id: code-review" },
        { path: "docs/notes.md", content: "notes" },
      ],
    });

    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.toString("utf8")).toContain("code-review/SKILL.md");
    expect(zip.toString("utf8")).toContain("code-review/skill.yml");
    expect(zip.toString("utf8")).toContain("code-review/docs/notes.md");
  });

  it("rejects package paths that escape the archive root", () => {
    expect(() => normalizeArchiveFiles([
      { path: "../secret.txt", content: "nope" },
    ])).toThrow("escapes the package root");
  });

  it("uses a safe package filename", () => {
    expect(packageDownloadFilename("My Skill!")).toBe("My-Skill-.zip");
    expect(packageDownloadFilename("code-review", "md")).toBe("code-review.md");
  });
});
