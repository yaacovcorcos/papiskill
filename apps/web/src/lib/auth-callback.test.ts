import { describe, expect, it } from "vitest";
import { localCallbackPath, signInPath } from "./auth-callback";

describe("auth callback helpers", () => {
  it("keeps local callback paths and rejects external redirects", () => {
    expect(localCallbackPath("/dashboard/library")).toBe("/dashboard/library");
    expect(localCallbackPath("/dashboard/fork?skill=official%2Fcode-review")).toBe(
      "/dashboard/fork?skill=official%2Fcode-review",
    );
    expect(localCallbackPath("https://example.com/steal")).toBe("/dashboard");
    expect(localCallbackPath("//example.com/steal")).toBe("/dashboard");
    expect(localCallbackPath(null)).toBe("/dashboard");
  });

  it("builds a safe sign-in path with the intended return location", () => {
    expect(signInPath("/dashboard/library")).toBe(
      "/auth/sign-in?callbackURL=%2Fdashboard%2Flibrary",
    );
    expect(signInPath("https://example.com/steal")).toBe(
      "/auth/sign-in?callbackURL=%2Fdashboard",
    );
    expect(signInPath("/dashboard/library", "auth_not_configured")).toBe(
      "/auth/sign-in?callbackURL=%2Fdashboard%2Flibrary&reason=auth_not_configured",
    );
  });
});
