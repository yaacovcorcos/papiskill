import { describe, expect, it } from "vitest";
import { installReferenceForSkill, skillDetailUrl, type ApiSkillSummary } from "./api.js";

describe("skillDetailUrl", () => {
  it("encodes each skill reference segment without hiding namespace slashes", () => {
    expect(skillDetailUrl("https://papiskill.com", "official/code-review").pathname).toBe(
      "/api/v1/skills/official/code-review",
    );
    expect(skillDetailUrl("https://papiskill.com", "alice/my custom skill").pathname).toBe(
      "/api/v1/skills/alice/my%20custom%20skill",
    );
  });
});

describe("installReferenceForSkill", () => {
  const baseSkill: ApiSkillSummary = {
    id: "skill_1",
    slug: "code-review",
    name: "Code Review",
    summary: "Review code changes.",
    registryKind: "global",
    visibility: "public",
    compatibleWith: ["codex"],
    tags: ["review"],
  };

  it("prints stable CLI install references for each registry kind", () => {
    expect(installReferenceForSkill(baseSkill)).toBe("official/code-review");
    expect(
      installReferenceForSkill({
        ...baseSkill,
        registryKind: "community",
      }),
    ).toBe("community/code-review");
    expect(
      installReferenceForSkill({
        ...baseSkill,
        registryKind: "profile",
        author: "alice",
      }),
    ).toBe("alice/code-review");
  });
});
