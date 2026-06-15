import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getInstalledSkills, getManifestPath, recordInstall } from "./manifest.js";

let configHome: string;
let previousConfigHome: string | undefined;

beforeEach(async () => {
  previousConfigHome = process.env.XDG_CONFIG_HOME;
  configHome = await mkdtemp(path.join(os.tmpdir(), "papiskill-config-"));
  process.env.XDG_CONFIG_HOME = configHome;
});

afterEach(async () => {
  if (previousConfigHome === undefined) {
    delete process.env.XDG_CONFIG_HOME;
  } else {
    process.env.XDG_CONFIG_HOME = previousConfigHome;
  }
  await rm(configHome, { recursive: true, force: true });
});

describe("install manifest", () => {
  it("records installed skills under the CLI config directory", async () => {
    await recordInstall({
      reference: "official/demo",
      name: "Demo",
      slug: "demo",
      registryKind: "global",
      directory: "/tmp/demo",
      files: ["SKILL.md"],
      installedAt: "2026-06-16T00:00:00.000Z",
    });

    await expect(getInstalledSkills()).resolves.toEqual([
      expect.objectContaining({
        reference: "official/demo",
        directory: "/tmp/demo",
      }),
    ]);
    expect(getManifestPath()).toBe(path.join(configHome, "papiskill", "installed.json"));
  });
});
