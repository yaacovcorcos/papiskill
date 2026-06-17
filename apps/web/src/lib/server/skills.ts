import { SkillRegistryKind, SkillVisibility, type User } from "@prisma/client";
import { getPrisma } from "./prisma";
import { getFileRegistrySkill } from "./catalog";
import { readableForkVisibilityWhere } from "./visibility";
import {
  serializeForkDetail,
  serializeForkSummary,
  serializeSkillDetail,
  serializeSkillSummary,
} from "./skill-serializers";
import { hasDatabaseUrl } from "./db-env";
import { parseSkillReference } from "./references";

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
    return getFileRegistrySkill(reference);
  }

  const parsed = parseSkillReference(reference);
  if (!parsed) return null;
  if (parsed.kind === "registry") {
    return getGlobalSkill(
      parsed.slug,
      parsed.registryKind === "community"
        ? SkillRegistryKind.COMMUNITY
        : SkillRegistryKind.GLOBAL,
    );
  }

  return getProfileFork(parsed.handle, parsed.slug, actor);
}

async function getGlobalSkill(slug: string, registryKind?: SkillRegistryKind) {
  const skill = await getPrisma().skill.findFirst({
    where: {
      slug,
      ...(registryKind ? { registryKind } : {}),
      visibility: SkillVisibility.PUBLIC,
    },
    include: {
      files: { orderBy: { path: "asc" } },
      validations: { orderBy: { createdAt: "desc" } },
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
      OR: readableForkVisibilityWhere(actor?.id),
    },
    include: {
      files: { orderBy: { path: "asc" } },
      validations: { orderBy: { createdAt: "desc" } },
      owner: { include: { profile: true } },
    },
  });

  return fork ? serializeForkDetail(fork) : null;
}
