import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { installSkill } from "./install.js";
import type { ApiSkillDetail } from "./api.js";

const demoSkill: ApiSkillDetail = {
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
};

describe("installSkill", () => {
  it("writes all files into a custom directory", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "papiskill-"));
    try {
      await installSkill(demoSkill, { directory: dir });

      await expect(readFile(path.join(dir, "SKILL.md"), "utf8")).resolves.toContain("demo");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("accepts a relative custom directory", async () => {
    const parent = await mkdtemp(path.join(os.tmpdir(), "papiskill-relative-"));
    const previousCwd = process.cwd();
    try {
      process.chdir(parent);
      const directory = await installSkill(demoSkill, { directory: "skills/demo" });

      expect(directory.endsWith(path.join("skills", "demo"))).toBe(true);
      await expect(readFile(path.join(directory, "SKILL.md"), "utf8")).resolves.toContain("demo");
    } finally {
      process.chdir(previousCwd);
      await rm(parent, { recursive: true, force: true });
    }
  });

  it("rejects files that escape the install directory", async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "papiskill-escape-"));
    try {
      await expect(installSkill({
        ...demoSkill,
        files: [{ path: "../skills-evil/SKILL.md", content: "escape" }],
      }, { directory: path.join(dir, "skills") })).rejects.toThrow("Refusing to write outside install directory");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
