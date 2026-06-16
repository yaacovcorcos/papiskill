import { describe, expect, it } from "vitest";
import {
  getFileRegistrySkill,
  getGeneratedRegistrySkillByReference,
  sortCatalogSkills,
  type CatalogSkill,
} from "./catalog";

describe("generated registry reference lookup", () => {
  it("resolves bare, official, and global references to official skills", async () => {
    expect(getGeneratedRegistrySkillByReference("code-review")?.registryKind).toBe("global");
    expect(getGeneratedRegistrySkillByReference("official/code-review")?.registryKind).toBe("global");
    expect(getGeneratedRegistrySkillByReference("global/code-review")?.registryKind).toBe("global");

    await expect(getFileRegistrySkill("official/code-review")).resolves.toEqual(
      expect.objectContaining({
        slug: "code-review",
        registryKind: "global",
        files: expect.arrayContaining([
          expect.objectContaining({ path: "skill.yml" }),
          expect.objectContaining({ path: "SKILL.md" }),
        ]),
      }),
    );
  });

  it("does not fall back from community references to official skills with the same slug", async () => {
    expect(getGeneratedRegistrySkillByReference("community/code-review")).toBeNull();
    await expect(getFileRegistrySkill("community/code-review")).resolves.toBeNull();
  });

  it("does not treat profile-looking references as registry entries", () => {
    expect(getGeneratedRegistrySkillByReference("yaacovcorcos/code-review")).toBeNull();
  });
});

describe("catalog sorting", () => {
  it("keeps curated order unchanged", () => {
    const skills = [
      skill({ slug: "b", name: "B", starCount: 1 }),
      skill({ slug: "a", name: "A", starCount: 10 }),
    ];

    expect(sortCatalogSkills(skills, "curated").map((item) => item.slug)).toEqual(["b", "a"]);
  });

  it("sorts popular skills by stars then visible comments", () => {
    const skills = [
      skill({ slug: "quiet", name: "Quiet", starCount: 1, commentCount: 0 }),
      skill({ slug: "talked", name: "Talked", starCount: 2, commentCount: 10 }),
      skill({ slug: "liked", name: "Liked", starCount: 3, commentCount: 0 }),
    ];

    expect(sortCatalogSkills(skills, "popular").map((item) => item.slug)).toEqual([
      "liked",
      "talked",
      "quiet",
    ]);
  });

  it("sorts recently updated skills before generated entries without timestamps", () => {
    const skills = [
      skill({ slug: "generated", name: "Generated" }),
      skill({ slug: "older", name: "Older", updatedAt: "2026-01-01T00:00:00.000Z" }),
      skill({ slug: "newer", name: "Newer", updatedAt: "2026-06-01T00:00:00.000Z" }),
    ];

    expect(sortCatalogSkills(skills, "recent").map((item) => item.slug)).toEqual([
      "newer",
      "older",
      "generated",
    ]);
  });
});

function skill(overrides: Partial<CatalogSkill>): CatalogSkill {
  return {
    id: overrides.slug ?? "skill",
    slug: overrides.slug ?? "skill",
    name: overrides.name ?? "Skill",
    summary: "Summary",
    description: "Description",
    registryKind: overrides.registryKind ?? "global",
    visibility: "public",
    author: "author",
    version: "1.0.0",
    license: "MIT",
    compatibleWith: ["generic-agent"],
    tags: [],
    categories: ["coding"],
    installCommand: "papiskill install official/skill",
    starCount: overrides.starCount ?? 0,
    commentCount: overrides.commentCount ?? 0,
    validationIssues: overrides.validationIssues ?? [],
    updatedAt: overrides.updatedAt,
  };
}
