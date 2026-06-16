import { describe, expect, it } from "vitest";
import type { CatalogSkill } from "@/lib/server/catalog";
import {
  buildFilterGroups,
  countMatching,
  filterSummary,
  hasStructuredFilters,
  parseActiveFilters,
  skillHref,
  skillReference,
  skillsHref,
  toggleFilterHref,
} from "./skill-filters";

const skills = [
  skill({
    slug: "code-review",
    registryKind: "global",
    categories: ["coding"],
    compatibleWith: ["codex", "cursor"],
  }),
  skill({
    slug: "docs",
    registryKind: "community",
    categories: ["documentation"],
    compatibleWith: ["generic-agent"],
  }),
];

describe("skill reference helpers", () => {
  it("builds canonical references and detail URLs", () => {
    expect(skillReference(skills[0]!)).toBe("official/code-review");
    expect(skillHref(skills[0]!)).toBe("/skills/official/code-review");
    expect(skillReference(skills[1]!)).toBe("community/docs");
    expect(skillHref(skills[1]!)).toBe("/skills/community/docs");

    const profileSkill = skill({
      slug: "mine",
      registryKind: "profile",
      author: "yaacov",
    });
    expect(skillReference(profileSkill)).toBe("yaacov/mine");
    expect(skillHref(profileSkill)).toBe("/u/yaacov/skills/mine");
  });
});

describe("filter parsing and URLs", () => {
  it("normalizes comma-separated and repeated params", () => {
    const filters = parseActiveFilters({
      q: [" Review ", "ignored"],
      category: ["coding, documentation", "coding"],
      compatibility: "Codex",
      status: ["global", "not-real"],
    });

    expect(filters).toEqual({
      query: " Review ",
      categories: ["coding", "documentation"],
      compatibility: ["codex"],
      statuses: ["global"],
    });
    expect(hasStructuredFilters(filters)).toBe(true);
    expect(filterSummary(filters)).toBe("4 selected");
  });

  it("builds stable filter hrefs", () => {
    const filters = parseActiveFilters({
      q: "review",
      category: "coding",
    });

    expect(skillsHref(filters)).toBe("/skills?q=review&category=coding");
    expect(toggleFilterHref(filters, "categories", "coding")).toBe("/skills?q=review");
    expect(toggleFilterHref(filters, "compatibility", "codex")).toBe(
      "/skills?q=review&category=coding&compatibility=codex",
    );
  });
});

describe("filter groups", () => {
  it("uses available and active values in predictable order", () => {
    const filters = parseActiveFilters({
      category: "security",
      status: "global",
    });
    const groups = buildFilterGroups(skills, filters);

    expect(groups.find((group) => group.key === "categories")?.items).toEqual([
      { value: "coding", label: "Coding" },
      { value: "documentation", label: "Documentation" },
      { value: "security", label: "Security" },
    ]);
    expect(countMatching(skills, "categories", "coding")).toBe(1);
    expect(countMatching(skills, "statuses", "global")).toBe(1);
  });
});

function skill(overrides: Partial<CatalogSkill>): CatalogSkill {
  return {
    id: overrides.slug ?? "skill",
    slug: overrides.slug ?? "skill",
    name: "Skill",
    summary: "Summary",
    description: "Description",
    registryKind: overrides.registryKind ?? "global",
    visibility: "public",
    author: overrides.author ?? "author",
    compatibleWith: overrides.compatibleWith ?? ["codex"],
    tags: [],
    categories: overrides.categories ?? ["coding"],
    installCommand: "papiskill install official/skill",
    starCount: 0,
    commentCount: 0,
  };
}
