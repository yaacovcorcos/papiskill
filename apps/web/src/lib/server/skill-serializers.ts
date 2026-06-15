import type { Prisma, Skill, SkillFile, SkillFork, SkillForkFile } from "@prisma/client";

export function serializeSkillSummary(skill: Skill & { owner?: { profile: { handle: string } | null } | null }) {
  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    summary: skill.summary,
    author: skill.authorName ?? skill.owner?.profile?.handle ?? null,
    registryKind: skill.registryKind.toLowerCase(),
    visibility: skill.visibility.toLowerCase(),
    compatibleWith: skill.compatibleWith,
    categories: skill.categories,
    tags: skill.tags,
  };
}

export function serializeForkSummary(fork: SkillFork & { owner: { profile: { handle: string } | null } }) {
  return {
    id: fork.id,
    slug: fork.slug,
    name: fork.name,
    summary: fork.summary,
    author: fork.owner.profile?.handle ?? null,
    registryKind: "profile",
    visibility: fork.visibility.toLowerCase(),
    compatibleWith: fork.compatibleWith,
    categories: fork.categories,
    tags: fork.tags,
  };
}

export function serializeSkillDetail(skill: Skill & {
  files: SkillFile[];
  owner?: { profile: { handle: string } | null } | null;
}) {
  const markdown = skill.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  return {
    ...serializeSkillSummary(skill),
    description: skill.description,
    markdown,
    files: skill.files.map((file) => ({ path: file.path, content: file.content })),
    installTargets: normalizeJsonRecord(skill.installTargets),
  };
}

export function serializeForkDetail(fork: SkillFork & {
  files: SkillForkFile[];
  owner: { profile: { handle: string } | null };
}) {
  const markdown = fork.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  return {
    ...serializeForkSummary(fork),
    description: fork.description,
    markdown,
    files: fork.files.map((file) => ({ path: file.path, content: file.content })),
    installTargets: normalizeJsonRecord(fork.installTargets),
  };
}

function normalizeJsonRecord(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}
