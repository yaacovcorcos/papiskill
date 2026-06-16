import { describe, expect, it } from "vitest";
import {
  getFileRegistrySkill,
  getGeneratedRegistrySkillByReference,
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
