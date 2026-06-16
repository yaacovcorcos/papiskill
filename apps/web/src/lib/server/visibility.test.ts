import { SkillVisibility } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { readableForkVisibilityWhere } from "./visibility";

describe("readableForkVisibilityWhere", () => {
  it("allows anonymous readers to resolve only public forks", () => {
    expect(readableForkVisibilityWhere(null)).toEqual([
      { visibility: SkillVisibility.PUBLIC },
    ]);
  });

  it("allows an actor to resolve public forks and their own non-public forks", () => {
    expect(readableForkVisibilityWhere("user_123")).toEqual([
      { visibility: SkillVisibility.PUBLIC },
      { ownerId: "user_123" },
    ]);
  });
});
