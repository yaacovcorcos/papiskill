import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfigPath } from "./config.js";

export interface InstalledSkill {
  reference: string;
  name: string;
  slug: string;
  registryKind: string;
  directory: string;
  files: string[];
  installedAt: string;
}

interface InstallManifest {
  version: 1;
  skills: Record<string, InstalledSkill>;
}

const manifestVersion = 1;

export function getManifestPath(): string {
  return path.join(path.dirname(getConfigPath()), "installed.json");
}

export async function readManifest(): Promise<InstallManifest> {
  try {
    const raw = await readFile(getManifestPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<InstallManifest>;
    return {
      version: manifestVersion,
      skills: parsed.skills ?? {},
    };
  } catch {
    return { version: manifestVersion, skills: {} };
  }
}

export async function recordInstall(skill: InstalledSkill): Promise<void> {
  const manifest = await readManifest();
  manifest.skills[skill.reference] = skill;
  await writeManifest(manifest);
}

export async function getInstalledSkill(reference: string): Promise<InstalledSkill | undefined> {
  const manifest = await readManifest();
  return manifest.skills[reference];
}

export async function getInstalledSkills(): Promise<InstalledSkill[]> {
  const manifest = await readManifest();
  return Object.values(manifest.skills).sort((left, right) => left.reference.localeCompare(right.reference));
}

async function writeManifest(manifest: InstallManifest): Promise<void> {
  const manifestPath = getManifestPath();
  await mkdir(path.dirname(manifestPath), { recursive: true, mode: 0o700 });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
    mode: 0o600,
  });
}
