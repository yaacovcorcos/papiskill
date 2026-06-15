import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { readSkillPackageFromDirectory } from "./package-files.js";
import type { SkillPackage } from "./schema.js";

export interface RegistryPackage extends SkillPackage {
  registryKind: "official" | "community";
  packagePath: string;
}

export async function loadRegistry(rootDir: string): Promise<RegistryPackage[]> {
  const root = path.resolve(rootDir);
  const packages: RegistryPackage[] = [];

  for (const registryKind of ["official", "community"] as const) {
    const kindDir = path.join(root, registryKind);
    if (!await exists(kindDir)) {
      continue;
    }
    const entries = await readdir(kindDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue;
      }
      const packageDir = path.join(kindDir, entry.name);
      packages.push({
        ...await readSkillPackageFromDirectory(packageDir),
        registryKind,
        packagePath: path.relative(root, packageDir),
      });
    }
  }

  return packages.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}
