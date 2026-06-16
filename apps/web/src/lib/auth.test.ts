import { describe, expect, it } from "vitest";
import { resolveBetterAuthSecret } from "./auth-secret";

describe("resolveBetterAuthSecret", () => {
  it("uses the configured secret when present", () => {
    expect(
      resolveBetterAuthSecret({
        BETTER_AUTH_SECRET: " configured-secret ",
        NODE_ENV: "production",
      }),
    ).toBe("configured-secret");
  });

  it("fails fast in production when the auth secret is missing", () => {
    expect(() =>
      resolveBetterAuthSecret({
        BETTER_AUTH_SECRET: "",
        NODE_ENV: "production",
      }),
    ).toThrow("BETTER_AUTH_SECRET must be set in production.");
  });

  it("allows the development fallback outside production", () => {
    expect(resolveBetterAuthSecret({ NODE_ENV: "development" })).toBe(
      "development-only-change-me",
    );
  });
});
