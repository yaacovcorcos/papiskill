import { describe, expect, it } from "vitest";
import {
  isPublicRegistryReference,
  referenceParts,
  referenceSlug,
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
    expect(referenceParts("/official//code-review/")).toEqual(["official", "code-review"]);
    expect(referenceSlug("/official//code-review/")).toBe("code-review");
    expect(referenceSlug("")).toBeNull();
  });
});
