import { describe, expect, it } from "vitest";
import {
  canonicalRegistryPath,
  canonicalRegistryReference,
  isPublicRegistryReference,
  parseSkillReference,
  referenceParts,
  referenceSlug,
  skillHref,
  skillReference,
  statusBadgeLabel,
} from "./references";

describe("reference helpers", () => {
  it("treats bare and registry names as public registry references", () => {
    expect(isPublicRegistryReference("code-review")).toBe(true);
    expect(isPublicRegistryReference("official/code-review")).toBe(true);
    expect(isPublicRegistryReference("global/code-review")).toBe(true);
    expect(isPublicRegistryReference("community/example")).toBe(true);
  });

  it("treats profile references as non-registry references", () => {
    expect(isPublicRegistryReference("yaacov/code-review")).toBe(false);
  });

  it("normalizes reference parts and slugs", () => {
    expect(referenceParts("/ official // code-review /")).toEqual(["official", "code-review"]);
    expect(referenceSlug("/official//code-review/")).toBe("code-review");
    expect(referenceSlug("")).toBeNull();
  });

  it("parses canonical registry and profile references", () => {
    expect(parseSkillReference("code-review")).toMatchObject({
      kind: "registry",
      namespace: "official",
      canonicalNamespace: "official",
      registryKind: "global",
      slug: "code-review",
      reference: "official/code-review",
      path: "/skills/official/code-review",
    });
    expect(parseSkillReference("global/code-review")).toMatchObject({
      kind: "registry",
      namespace: "global",
      reference: "official/code-review",
      path: "/skills/official/code-review",
    });
    expect(parseSkillReference("community/docs")).toMatchObject({
      kind: "registry",
      registryKind: "community",
      reference: "community/docs",
      path: "/skills/community/docs",
    });
    expect(parseSkillReference("alice/my-skill")).toMatchObject({
      kind: "profile",
      handle: "alice",
      reference: "alice/my-skill",
      path: "/u/alice/skills/my-skill",
    });
    expect(parseSkillReference("")).toBeNull();
    expect(parseSkillReference("skills/official/code-review")).toBeNull();
  });

  it("builds references, hrefs, and labels from skill metadata", () => {
    expect(canonicalRegistryReference("GLOBAL", "code-review")).toBe("official/code-review");
    expect(canonicalRegistryPath("community", "docs")).toBe("/skills/community/docs");
    expect(skillReference({ registryKind: "profile", slug: "mine", author: "alice" })).toBe("alice/mine");
    expect(skillHref({ registryKind: "profile", slug: "mine", author: "alice" })).toBe("/u/alice/skills/mine");
    expect(statusBadgeLabel("global")).toBe("Global");
    expect(statusBadgeLabel("community")).toBe("Community");
    expect(statusBadgeLabel("profile")).toBe("Profile");
  });
});
