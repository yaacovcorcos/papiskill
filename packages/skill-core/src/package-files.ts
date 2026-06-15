import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { type PackageFile, type SkillPackage, skillManifestSchema } from "./schema.js";

const allowedTopLevel = new Set([
  "skill.yml",
  "SKILL.md",
  "README.md",
  "docs",
  "examples",
  "scripts",
  "assets",
]);

export function normalizePackagePath(input: string): string {
  const normalized = input.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("\0")) {
    throw new Error("Invalid package path.");
  }
  const parts = normalized.split("/");
  if (parts.includes("..") || path.isAbsolute(normalized)) {
    throw new Error(`Package path escapes the package root: ${input}`);
  }
  return normalized;
}

export function isAllowedPackagePath(input: string): boolean {
  const normalized = normalizePackagePath(input);
  const top = normalized.split("/")[0];
  return typeof top === "string" && allowedTopLevel.has(top);
}

export function parseSkillPackage(files: PackageFile[]): SkillPackage {
  const normalizedFiles = files.map((file) => ({
    path: normalizePackagePath(file.path),
    content: file.content,
  }));
  const manifestFile = normalizedFiles.find((file) => file.path === "skill.yml");
  const skillFile = normalizedFiles.find((file) => file.path === "SKILL.md");

  if (!manifestFile) {
    throw new Error("Missing skill.yml.");
  }
  if (!skillFile) {
    throw new Error("Missing SKILL.md.");
  }

  const rawManifest = YAML.parse(manifestFile.content);
  const manifest = skillManifestSchema.parse(rawManifest);

  return {
    manifest,
    skillMarkdown: skillFile.content,
    files: normalizedFiles,
  };
}

export async function readSkillPackageFromDirectory(packageDir: string): Promise<SkillPackage> {
  const root = path.resolve(packageDir);
  const files = await readPackageFiles(root, root);
  return parseSkillPackage(files);
}

async function readPackageFiles(root: string, current: string): Promise<PackageFile[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: PackageFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") {
      continue;
    }
    const fullPath = path.join(current, entry.name);
    const relativePath = normalizePackagePath(path.relative(root, fullPath));
    if (!isAllowedPackagePath(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await readPackageFiles(root, fullPath));
    } else if (entry.isFile()) {
      files.push({
        path: relativePath,
        content: await readFile(fullPath, "utf8"),
      });
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}
