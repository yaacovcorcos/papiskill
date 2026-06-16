import { describe, expect, it } from "vitest";
import { skillDetailUrl } from "./api.js";

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
