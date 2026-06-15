import { describe, expect, it } from "vitest";
import { deriveHandle } from "./profiles";

describe("deriveHandle", () => {
  it("creates a stable lowercase handle from email", () => {
    expect(deriveHandle({
      id: "user_12345678",
      email: "Jane.Dev+Skills@Example.com",
      name: "Jane Dev",
    })).toBe("jane-dev-skills");
  });

  it("falls back to a sanitized user id when email cannot produce a slug", () => {
    expect(deriveHandle({
      id: "abcdefgh12345",
      email: "@example.com",
      name: "",
    })).toBe("abcdefgh12345");
  });
});
