import { describe, expect, it } from "vitest";
import {
  engagementPathForReference,
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

describe("normalizeCommentBody", () => {
  it("trims and normalizes comment text", () => {
    expect(normalizeCommentBody("  hello\r\nworld  ")).toBe("hello\nworld");
  });

  it("bounds comment length", () => {
    expect(normalizeCommentBody("x".repeat(maxCommentBodyLength + 10))).toHaveLength(maxCommentBodyLength);
  });
});
