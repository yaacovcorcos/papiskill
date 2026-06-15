import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { installSkill } from "./install.js";

describe("installSkill", () => {
  it("writes all files into a custom directory", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "papiskill-"));
    try {
      await installSkill({
        id: "1",
        slug: "demo",
        name: "Demo",
        summary: "Demo summary",
        description: "Demo description",
        markdown: "Demo markdown",
        author: "test",
        registryKind: "official",
        visibility: "public",
        compatibleWith: ["generic-agent"],
        tags: [],
        installTargets: {},
        files: [
          { path: "skill.yml", content: "id: demo" },
          { path: "SKILL.md", content: "Use this demo skill." },
        ],
      }, { directory: dir });

      await expect(readFile(path.join(dir, "SKILL.md"), "utf8")).resolves.toContain("demo");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
