import { describe, expect, it } from "vitest";
import { deriveHandle, githubHandleFromEmail } from "./profiles";

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

  it("derives handles from GitHub noreply email formats", () => {
    expect(deriveHandle({
      id: "user_12345678",
      email: "123456+Octo-Cat@users.noreply.github.com",
      name: "Octo Cat",
    })).toBe("octo-cat");
    expect(githubHandleFromEmail("Octo-Cat@users.noreply.github.com")).toBe("octo-cat");
  });

  it("does not treat normal email local parts as GitHub handles", () => {
    expect(githubHandleFromEmail("jane@example.com")).toBeNull();
  });
});
