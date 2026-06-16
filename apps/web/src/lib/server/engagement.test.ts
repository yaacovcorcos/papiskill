import { describe, expect, it } from "vitest";
import {
  engagementPathForReference,
  engagementRevalidationPaths,
  engagementTargetWhere,
  maxCommentBodyLength,
  normalizeCommentBody,
} from "./engagement";

describe("engagementPathForReference", () => {
  it("routes official and community references to registry detail pages", () => {
    expect(engagementPathForReference("official/code-review")).toBe("/skills/official/code-review");
    expect(engagementPathForReference("global/code-review")).toBe("/skills/official/code-review");
    expect(engagementPathForReference("community/example")).toBe("/skills/community/example");
  });

  it("routes profile references to public profile skill pages", () => {
    expect(engagementPathForReference("yaacov/my-skill")).toBe("/u/yaacov/skills/my-skill");
  });
});

describe("engagementRevalidationPaths", () => {
  it("revalidates registry detail, registry list, and API list paths", () => {
    expect(engagementRevalidationPaths({ path: "/skills/official/code-review" })).toEqual([
      "/skills/official/code-review",
      "/skills",
      "/api/v1/skills",
    ]);
  });

  it("also revalidates the profile page for profile skill engagement", () => {
    expect(engagementRevalidationPaths({ path: "/u/yaacov/skills/my-skill" })).toEqual([
      "/u/yaacov/skills/my-skill",
      "/skills",
      "/api/v1/skills",
      "/u/yaacov",
    ]);
  });
});

describe("normalizeCommentBody", () => {
  it("trims and normalizes comment text", () => {
    expect(normalizeCommentBody("  hello\r\nworld  ")).toBe("hello\nworld");
  });

  it("bounds comment length", () => {
    expect(normalizeCommentBody("x".repeat(maxCommentBodyLength + 10))).toHaveLength(maxCommentBodyLength);
  });
});

describe("engagementTargetWhere", () => {
  it("scopes registry skill engagement by skill id", () => {
    expect(engagementTargetWhere({ kind: "skill", id: "skill_123" })).toEqual({
      skillId: "skill_123",
    });
  });

  it("scopes profile fork engagement by fork id", () => {
    expect(engagementTargetWhere({ kind: "fork", id: "fork_123" })).toEqual({
      forkId: "fork_123",
    });
  });
});
