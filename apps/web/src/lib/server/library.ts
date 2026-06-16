import { createHash } from "node:crypto";
import { Prisma, SkillRegistryKind, SkillVisibility, ValidationLevel, type SkillFork, type User } from "@prisma/client";
import { validateSkillPackage } from "@papiskill/skill-core";
import { getPrisma } from "./prisma";
import { readableForkVisibilityWhere } from "./visibility";

export interface LibraryCopyInput {
  reference: string;
  user: Pick<User, "id">;
  visibility: SkillVisibility;
}

interface LibrarySource {
  sourceSkillId?: string;
  sourceForkId?: string;
  sourceReference: string;
  sourceVersion?: string;
  sourcePackageHash?: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  version: string;
  license: string;
  categories: string[];
  tags: string[];
  compatibleWith: string[];
  installTargets: Prisma.JsonValue;
  files: Array<{ path: string; content: string }>;
}

export async function createLibraryCopy(input: LibraryCopyInput): Promise<SkillFork> {
  const source = await getVisibleLibrarySource(input.reference, input.user.id);
  if (!source) {
    throw new Error("Source skill not found.");
  }

  const validation = validateSkillPackage(source.files);
  const slug = await uniqueLibrarySlug(input.user.id, source.slug);
  const now = new Date();

  return getPrisma().skillFork.create({
    data: {
      ownerId: input.user.id,
      sourceSkillId: source.sourceSkillId,
      sourceForkId: source.sourceForkId,
      sourceReference: source.sourceReference,
      sourceVersion: source.sourceVersion,
      sourcePackageHash: source.sourcePackageHash ?? packageHash(source.files),
      slug,
      name: source.name,
      summary: source.summary,
      description: source.description,
      visibility: input.visibility,
      version: source.version,
      license: source.license,
      categories: source.categories,
      tags: source.tags,
      compatibleWith: source.compatibleWith,
      installTargets: jsonObject(source.installTargets),
      lastValidatedAt: now,
      publishedAt: input.visibility === SkillVisibility.PUBLIC ? now : null,
      files: {
        create: source.files.map((file) => ({
          path: file.path,
          content: file.content,
          sizeBytes: Buffer.byteLength(file.content),
        })),
      },
      validations: {
        create: validation.issues.map((issue) => ({
          level: issue.level === "error" ? ValidationLevel.ERROR : ValidationLevel.WARNING,
          code: issue.code,
          message: issue.message,
          path: issue.path,
        })),
      },
    },
  });
}

export async function getVisibleLibrarySource(reference: string, actorId?: string | null): Promise<LibrarySource | null> {
  const parts = reference.split("/").filter(Boolean);
  const namespace = parts.length > 1 ? parts[0] : "official";
  const slug = parts.at(-1);
  if (!namespace || !slug) return null;

  if (namespace === "official" || namespace === "global" || namespace === "community") {
    const registryKind = namespace === "community" ? SkillRegistryKind.COMMUNITY : SkillRegistryKind.GLOBAL;
    const skill = await getPrisma().skill.findFirst({
      where: {
        slug,
        registryKind,
        visibility: SkillVisibility.PUBLIC,
      },
      include: { files: { orderBy: { path: "asc" } } },
    });
    if (!skill) return null;
    return {
      sourceSkillId: skill.id,
      sourceReference: `${namespace === "community" ? "community" : "official"}/${skill.slug}`,
      sourceVersion: skill.version,
      sourcePackageHash: skill.packageHash ?? packageHash(skill.files),
      slug: skill.slug,
      name: skill.name,
      summary: skill.summary,
      description: skill.description,
      version: skill.version,
      license: skill.license,
      categories: skill.categories,
      tags: skill.tags,
      compatibleWith: skill.compatibleWith,
      installTargets: skill.installTargets,
      files: skill.files,
    };
  }

  const fork = await getPrisma().skillFork.findFirst({
    where: {
      slug,
      owner: { profile: { handle: namespace } },
      archivedAt: null,
      OR: readableForkVisibilityWhere(actorId),
    },
    include: {
      files: { orderBy: { path: "asc" } },
      owner: { include: { profile: true } },
    },
  });
  if (!fork) return null;

  const handle = fork.owner.profile?.handle ?? namespace;
  return {
    sourceForkId: fork.id,
    sourceSkillId: fork.sourceSkillId ?? undefined,
    sourceReference: `${handle}/${fork.slug}`,
    sourceVersion: fork.version,
    sourcePackageHash: packageHash(fork.files),
    slug: fork.slug,
    name: fork.name,
    summary: fork.summary,
    description: fork.description,
    version: fork.version,
    license: fork.license,
    categories: fork.categories,
    tags: fork.tags,
    compatibleWith: fork.compatibleWith,
    installTargets: fork.installTargets,
    files: fork.files,
  };
}

export async function persistForkValidation(forkId: string, files: Array<{ path: string; content: string }>) {
  const validation = validateSkillPackage(files);
  const now = new Date();

  await getPrisma().$transaction([
    getPrisma().skillForkValidation.deleteMany({ where: { forkId } }),
    getPrisma().skillForkValidation.createMany({
      data: validation.issues.map((issue) => ({
        forkId,
        level: issue.level === "error" ? ValidationLevel.ERROR : ValidationLevel.WARNING,
        code: issue.code,
        message: issue.message,
        path: issue.path,
      })),
    }),
    getPrisma().skillFork.update({
      where: { id: forkId },
      data: { lastValidatedAt: now },
    }),
  ]);

  return validation;
}

export async function uniqueLibrarySlug(userId: string, rawBaseSlug: string): Promise<string> {
  const baseSlug = normalizeSlug(rawBaseSlug);
  let slug = baseSlug;

  for (let index = 1; index < 100; index += 1) {
    const existing = await getPrisma().skillFork.findUnique({
      where: { ownerId_slug: { ownerId: userId, slug } },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${index + 1}`;
  }

  return `${baseSlug}-${Date.now()}`;
}

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "skill";
}

export function buildSkillYml(input: {
  id: string;
  name: string;
  summary: string;
  description: string;
  visibility: string;
  version: string;
  license: string;
  categories: string[];
  tags: string[];
  compatibleWith: string[];
  installTargets: Record<string, string>;
}) {
  const lines = [
    `id: ${input.id}`,
    `name: ${JSON.stringify(input.name)}`,
    `summary: ${JSON.stringify(input.summary)}`,
    `description: ${JSON.stringify(input.description)}`,
    `version: ${input.version}`,
    `license: ${input.license}`,
    `visibility: ${input.visibility}`,
    "categories:",
    ...input.categories.map((item) => `  - ${item}`),
    "tags:",
    ...input.tags.map((item) => `  - ${item}`),
    "compatible_with:",
    ...input.compatibleWith.map((item) => `  - ${item}`),
    "install_targets:",
    ...Object.entries(input.installTargets).map(([key, value]) => `  ${key}: ${value}`),
  ];
  return `${lines.join("\n")}\n`;
}

export function jsonObject(value: Prisma.JsonValue): Prisma.InputJsonValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Prisma.InputJsonObject;
}

export function recordFromJson(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function packageHash(files: Array<{ path: string; content: string }>) {
  return createHash("sha256")
    .update(JSON.stringify(files.map((file) => ({ path: file.path, content: file.content }))))
    .digest("hex");
}
