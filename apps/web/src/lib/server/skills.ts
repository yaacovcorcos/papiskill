import { SkillRegistryKind, SkillVisibility, type User } from "@prisma/client";
import { getPrisma } from "./prisma";
import { getFileRegistrySkill } from "./catalog";
import { generatedRegistry } from "./generated-registry";
import {
  serializeForkDetail,
  serializeForkSummary,
  serializeSkillDetail,
  serializeSkillSummary,
} from "./skill-serializers";
import { hasDatabaseUrl } from "./db-env";

export async function searchVisibleSkills(query: string) {
  const prisma = getPrisma();
  const q = query.trim();
  const searchWhere = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { summary: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
          { tags: { has: q.toLowerCase() } },
        ],
      }
    : {};

  const [skills, forks] = await Promise.all([
    prisma.skill.findMany({
      where: {
        visibility: SkillVisibility.PUBLIC,
        ...searchWhere,
      },
      include: { owner: { include: { profile: true } } },
      orderBy: [{ registryKind: "asc" }, { updatedAt: "desc" }],
      take: 50,
    }),
    prisma.skillFork.findMany({
      where: {
        visibility: SkillVisibility.PUBLIC,
        archivedAt: null,
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q.toLowerCase() } },
          ],
        } : {}),
      },
      include: { owner: { include: { profile: true } } },
      orderBy: [{ updatedAt: "desc" }],
      take: 50,
    }),
  ]);

  return [
    ...skills.map(serializeSkillSummary),
    ...forks.map(serializeForkSummary),
  ].slice(0, 80);
}

export async function getSkillByReference(reference: string, actor?: Pick<User, "id"> | null) {
  if (!hasDatabaseUrl()) {
    return (await getFileRegistrySkill(reference)) ?? getGeneratedRegistrySkill(reference);
  }

  const parts = reference.split("/").filter(Boolean);
  if (parts.length === 1) {
    return getGlobalSkill(parts[0]!);
  }

  const [namespace, slug] = parts;
  if (!namespace || !slug) {
    return null;
  }

  if (["official", "global", "community"].includes(namespace)) {
    return getGlobalSkill(slug, namespace === "community" ? SkillRegistryKind.COMMUNITY : undefined);
  }

  return getProfileFork(namespace, slug, actor);
}

function getGeneratedRegistrySkill(reference: string) {
  const parts = reference.split("/").filter(Boolean);
  const namespace = parts.length > 1 ? parts[0] : "official";
  const slug = parts.at(-1);
  if (!slug) return null;
  if (namespace && !["official", "global", "community"].includes(namespace)) {
    return null;
  }

  const skill = generatedRegistry.find((entry) => entry.slug === slug);
  if (!skill) return null;
  return {
    ...skill,
    files: [
      {
        path: "SKILL.md",
        content: skill.markdown ?? "",
      },
    ],
    installTargets: {},
    markdown: skill.markdown ?? "",
  };
}

async function getGlobalSkill(slug: string, registryKind?: SkillRegistryKind) {
  const skill = await getPrisma().skill.findFirst({
    where: {
      slug,
      registryKind: registryKind ?? undefined,
      visibility: SkillVisibility.PUBLIC,
    },
    include: {
      files: { orderBy: { path: "asc" } },
      owner: { include: { profile: true } },
    },
  });

  if (skill) return serializeSkillDetail(skill);
  const namespace = registryKind === SkillRegistryKind.COMMUNITY
    ? "community"
    : "official";
  return getFileRegistrySkill(`${namespace}/${slug}`);
}

async function getProfileFork(handle: string, slug: string, actor?: Pick<User, "id"> | null) {
  const fork = await getPrisma().skillFork.findFirst({
    where: {
      slug,
      owner: { profile: { handle } },
      archivedAt: null,
      OR: [
        { visibility: SkillVisibility.PUBLIC },
        { visibility: SkillVisibility.UNLISTED },
        ...(actor ? [{ ownerId: actor.id }] : []),
      ],
    },
    include: {
      files: { orderBy: { path: "asc" } },
      owner: { include: { profile: true } },
    },
  });

  return fork ? serializeForkDetail(fork) : null;
}
