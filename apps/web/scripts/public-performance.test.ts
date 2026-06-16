import { describe, expect, it } from "vitest";
import {
  endpointFailures,
  pageFailures,
  parsePerformanceArgs,
} from "./public-performance";

describe("public performance script helpers", () => {
  it("parses custom base URLs and route additions", () => {
    const options = parsePerformanceArgs([
      "--base-url",
      "https://papiskill.com",
      "--page",
      "/docs",
      "--endpoint",
      "/api/v1/skills",
      "--json",
    ]);

    expect(options.baseUrl).toBe("https://papiskill.com");
    expect(options.pageRoutes).toContain("/docs");
    expect(options.endpointRoutes).toContain("/api/v1/skills");
    expect(options.json).toBe(true);
  });

  it("flags slow or noisy page metrics", () => {
    expect(
      pageFailures(
        {
          route: "/skills",
          url: "https://papiskill.com/skills",
          status: 200,
          domContentLoadedMs: 9_000,
          loadMs: 11_000,
          htmlBytes: 800_000,
          resourceCount: 12,
          transferBytes: 100_000,
          consoleWarnings: 1,
          consoleErrors: 1,
          cacheControl: "private, no-store",
        },
        {
          maxDomContentLoadedMs: 8_000,
          maxLoadMs: 10_000,
          maxHtmlBytes: 750_000,
        },
      ),
    ).toEqual([
      "1 console errors",
      "1 console warnings",
      "domcontentloaded 9000ms",
      "load 11000ms",
      "html 800000 bytes",
    ]);
  });

  it("requires public endpoints to expose shared cache headers", () => {
    expect(
      endpointFailures({
        route: "/api/v1/skills/official/code-review",
        url: "https://papiskill.com/api/v1/skills/official/code-review",
        status: 200,
        bytes: 100,
        contentType: "application/json",
        cacheControl: "public, max-age=0, must-revalidate",
        cdnCacheControl: "public, max-age=60, stale-while-revalidate=300",
      }),
    ).toEqual([]);

    expect(
      endpointFailures({
        route: "/api/v1/skills/official/code-review",
        url: "https://papiskill.com/api/v1/skills/official/code-review",
        status: 200,
        bytes: 100,
        contentType: "application/json",
        cacheControl: "private, no-store",
        cdnCacheControl: null,
      }),
    ).toEqual(["missing public cache-control", "missing public cdn-cache-control"]);
  });
});
