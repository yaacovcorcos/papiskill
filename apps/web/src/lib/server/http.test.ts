import { describe, expect, it } from "vitest";
import {
  jsonResponse,
  mergeHeaders,
  noStoreCacheHeaders,
  privateNoStoreCacheHeaders,
  publicCatalogCacheHeaders,
  publicHealthCacheHeaders,
} from "./http";

describe("http response helpers", () => {
  it("defaults JSON responses to no-store", () => {
    const response = jsonResponse({ ok: true });

    expect(response.headers.get("cache-control")).toBe(noStoreCacheHeaders["cache-control"]);
  });

  it("allows explicit public cache headers to override the default", () => {
    const response = jsonResponse(
      { skills: [] },
      {
        headers: publicCatalogCacheHeaders,
      },
    );

    expect(response.headers.get("cache-control")).toBe(
      publicCatalogCacheHeaders["cache-control"],
    );
    expect(response.headers.get("vercel-cdn-cache-control")).toBe(
      publicCatalogCacheHeaders["Vercel-CDN-Cache-Control"],
    );
  });

  it("keeps private downloads out of shared caches", () => {
    const headers = mergeHeaders(privateNoStoreCacheHeaders, {
      "Content-Type": "text/markdown; charset=utf-8",
    });

    expect(headers.get("cache-control")).toBe(privateNoStoreCacheHeaders["cache-control"]);
    expect(headers.get("content-type")).toBe("text/markdown; charset=utf-8");
  });

  it("merges Headers instances without dropping values", () => {
    const headers = mergeHeaders(
      noStoreCacheHeaders,
      new Headers({
        "x-papiskill": "ok",
      }),
    );

    expect(headers.get("cache-control")).toBe(noStoreCacheHeaders["cache-control"]);
    expect(headers.get("x-papiskill")).toBe("ok");
  });

  it("documents the health endpoint's short edge cache policy", () => {
    expect(publicHealthCacheHeaders["CDN-Cache-Control"]).toBe(
      "public, max-age=30, stale-while-revalidate=60",
    );
  });
});
