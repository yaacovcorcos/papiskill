import { createHash } from "node:crypto";
import { Prisma, SkillRegistryKind, SkillVisibility, ValidationLevel, type SkillFork, type User } from "@prisma/client";
import { validateSkillPackage, type SkillValidationResult } from "@papiskill/skill-core";
import YAML from "yaml";
import { getFileRegistrySkill, type CatalogSkillDetail } from "./catalog";
import { getPrisma } from "./prisma";
import { canonicalRegistryReference, parseSkillReference } from "./references";
import { readableForkVisibilityWhere } from "./visibility";

export interface LibraryCopyInput {
  reference: string;
  user: Pick<User, "id">;
  visibility: SkillVisibility;
}

export interface BlankLibrarySkillInput {
  user: Pick<User, "id">;
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

export interface ForkDraftPackageInput {
  slug: string;
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
  skillMarkdown: string;
  existingFiles: Array<{ path: string; content: string }>;
}

export interface ForkDraftPackageValidation {
  skillYml: string;
  files: Array<{ path: string; content: string }>;
  validation: SkillValidationResult;
  hasBlockingErrors: boolean;
}

interface BlankLibraryDraft {
  slug: string;
  name: string;
  summary: string;
  description: string;
  version: string;
  license: string;
  categories: string[];
  tags: string[];
  compatibleWith: string[];
  installTargets: Record<string, string>;
  files: Array<{ path: string; content: string }>;
  validation: SkillValidationResult;
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
      sourceSkillId: source.sourceSkillId ?? null,
      sourceForkId: source.sourceForkId ?? null,
      sourceReference: source.sourceReference,
      sourceVersion: source.sourceVersion ?? null,
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
        create: forkFileCreateData(source.files),
      },
      validations: {
        create: forkValidationCreateData(validation),
      },
    },
  });
}

export async function createBlankLibrarySkill(input: BlankLibrarySkillInput): Promise<SkillFork> {
  const slug = await uniqueLibrarySlug(input.user.id, "untitled-skill");
  const draft = buildBlankLibraryDraft(slug);
  const now = new Date();

  return getPrisma().skillFork.create({
    data: {
      ownerId: input.user.id,
      slug: draft.slug,
      name: draft.name,
      summary: draft.summary,
      description: draft.description,
      visibility: SkillVisibility.PRIVATE,
      version: draft.version,
      license: draft.license,
      categories: draft.categories,
      tags: draft.tags,
      compatibleWith: draft.compatibleWith,
      installTargets: draft.installTargets,
      lastValidatedAt: now,
      files: {
        create: forkFileCreateData(draft.files),
      },
      validations: {
        create: forkValidationCreateData(draft.validation),
      },
    },
  });
}

export async function getVisibleLibrarySource(reference: string, actorId?: string | null): Promise<LibrarySource | null> {
  const parsed = parseSkillReference(reference);
  if (!parsed) return null;

  if (parsed.kind === "registry") {
    const fileRegistrySource = await getFileRegistrySkill(parsed.reference);
    if (fileRegistrySource) {
      return librarySourceFromCatalogSkill(fileRegistrySource);
    }

    const registryKind = parsed.registryKind === "community" ? SkillRegistryKind.COMMUNITY : SkillRegistryKind.GLOBAL;
    const skill = await getPrisma().skill.findFirst({
      where: {
        slug: parsed.slug,
        registryKind,
        visibility: SkillVisibility.PUBLIC,
      },
      include: { files: { orderBy: { path: "asc" } } },
    });
    if (!skill) return null;
    return {
      sourceSkillId: skill.id,
      sourceReference: parsed.reference,
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
      slug: parsed.slug,
      owner: { profile: { handle: parsed.handle } },
      archivedAt: null,
      OR: readableForkVisibilityWhere(actorId),
    },
    include: {
      files: { orderBy: { path: "asc" } },
      owner: { include: { profile: true } },
    },
  });
  if (!fork) return null;

  const handle = fork.owner.profile?.handle ?? parsed.handle;
  return {
    sourceForkId: fork.id,
    ...(fork.sourceSkillId ? { sourceSkillId: fork.sourceSkillId } : {}),
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

export function librarySourceFromCatalogSkill(skill: CatalogSkillDetail): LibrarySource {
  return {
    sourceReference: canonicalRegistryReference(skill.registryKind, skill.slug),
    sourcePackageHash: packageHash(skill.files),
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

export async function persistForkValidation(forkId: string, files: Array<{ path: string; content: string }>) {
  const validation = validateSkillPackage(files);
  const now = new Date();

  await getPrisma().$transaction([
    getPrisma().skillForkValidation.deleteMany({ where: { forkId } }),
    getPrisma().skillForkValidation.createMany({
      data: forkValidationCreateManyData(forkId, validation),
    }),
    getPrisma().skillFork.update({
      where: { id: forkId },
      data: { lastValidatedAt: now },
    }),
  ]);

  return validation;
}

export function validateForkDraftPackage(input: ForkDraftPackageInput): ForkDraftPackageValidation {
  const skillYml = buildSkillYml({
    id: input.slug,
    name: input.name,
    summary: input.summary,
    description: input.description,
    visibility: input.visibility,
    version: input.version,
    license: input.license,
    categories: input.categories,
    tags: input.tags,
    compatibleWith: input.compatibleWith,
    installTargets: input.installTargets,
  });
  const files = [
    ...input.existingFiles.filter((file) => file.path !== "skill.yml" && file.path !== "SKILL.md"),
    { path: "skill.yml", content: skillYml },
    { path: "SKILL.md", content: input.skillMarkdown },
  ].sort((a, b) => a.path.localeCompare(b.path));
  const validation = validateSkillPackage(files);

  return {
    skillYml,
    files,
    validation,
    hasBlockingErrors: validation.issues.some((issue) => issue.level === "error"),
  };
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

export function buildBlankLibraryDraft(slug: string): BlankLibraryDraft {
  const normalizedSlug = normalizeSlug(slug);
  const name = titleFromSlug(normalizedSlug);
  const summary = "Draft a portable agent skill for a focused workflow.";
  const description = "A private starter package for writing, validating, and publishing a portable agent skill.";
  const version = "0.1.0";
  const license = "MIT";
  const categories = ["productivity"];
  const tags = ["draft"];
  const compatibleWith = ["generic-agent"];
  const installTargets = { "generic-agent": `~/.agents/skills/${normalizedSlug}` };
  const skillMarkdown = [
    "---",
    `name: ${normalizedSlug}`,
    `description: ${summary} Use when you need a reusable workflow that works across agent setups.`,
    "---",
    "",
    `# ${name}`,
    "",
    "Use this skill when the user needs a repeatable workflow for a specific task.",
    "",
    "## Inputs",
    "",
    "- Describe the files, context, links, or decisions the skill expects before it starts.",
    "",
    "## Workflow",
    "",
    "1. Confirm the task scope and any constraints that affect the outcome.",
    "2. Inspect the available context before changing or generating anything.",
    "3. Produce the requested result with clear evidence, boundaries, and next steps.",
    "",
    "## Output",
    "",
    "- State the completed result and any important caveats.",
  ].join("\n");
  const skillYml = buildSkillYml({
    id: normalizedSlug,
    name,
    summary,
    description,
    visibility: "private",
    version,
    license,
    categories,
    tags,
    compatibleWith,
    installTargets,
  });
  const files = [
    { path: "SKILL.md", content: skillMarkdown },
    { path: "skill.yml", content: skillYml },
  ];

  return {
    slug: normalizedSlug,
    name,
    summary,
    description,
    version,
    license,
    categories,
    tags,
    compatibleWith,
    installTargets,
    files,
    validation: validateSkillPackage(files),
  };
}

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "skill";
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Untitled Skill";
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
  return YAML.stringify(
    {
      id: input.id,
      name: input.name,
      summary: input.summary,
      description: input.description,
      version: input.version,
      license: input.license,
      visibility: input.visibility,
      categories: input.categories,
      tags: input.tags,
      compatible_with: input.compatibleWith,
      install_targets: input.installTargets,
    },
    { lineWidth: 0 },
  );
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

function forkFileCreateData(files: Array<{ path: string; content: string }>) {
  return files.map((file) => ({
    path: file.path,
    content: file.content,
    sizeBytes: Buffer.byteLength(file.content),
  }));
}

function forkValidationCreateData(validation: SkillValidationResult) {
  return validation.issues.map((issue) => ({
    level: validationLevel(issue.level),
    code: issue.code,
    message: issue.message,
    path: issue.path ?? null,
  }));
}

function forkValidationCreateManyData(forkId: string, validation: SkillValidationResult) {
  return forkValidationCreateData(validation).map((issue) => ({
    forkId,
    ...issue,
  }));
}

function validationLevel(level: SkillValidationResult["issues"][number]["level"]) {
  return level === "error" ? ValidationLevel.ERROR : ValidationLevel.WARNING;
}
