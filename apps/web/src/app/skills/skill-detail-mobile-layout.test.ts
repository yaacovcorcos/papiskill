import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("skill detail mobile layout", () => {
  it.each([
    ["official detail", "src/app/skills/[...reference]/page.tsx"],
    ["public registry detail", "src/app/skills/public-registry-detail.tsx"],
    ["profile detail", "src/app/u/[handle]/skills/[slug]/page.tsx"],
  ])("%s uses shrinkable, responsive detail layout classes", (_name, relativePath) => {
    const source = readFileSync(join(root, relativePath), "utf8");

    expect(source).toContain("px-4 py-6 sm:px-5 sm:py-8");
    expect(source).toContain("grid-cols-[minmax(0,1fr)]");
    expect(source).toContain("lg:grid-cols-[minmax(0,1fr)_320px]");
    expect(source).toContain("text-3xl font-semibold tracking-tight sm:text-4xl");
    expect(source).toContain("text-base leading-7 text-muted sm:text-lg sm:leading-8");
    expect(source).toContain('aside className="min-w-0');
  });

  it("allows inline markdown code to wrap without changing fenced code scrolling", () => {
    const source = readFileSync(join(root, "src/app/globals.css"), "utf8");

    expect(source).toContain(".skill-markdown :where(p, li, th, td) > code");
    expect(source).toContain("overflow-wrap: anywhere");
    expect(source).toContain("word-break: break-word");
    expect(source).toContain(".skill-markdown pre code");
    expect(source).toContain("white-space: pre");
  });
});
