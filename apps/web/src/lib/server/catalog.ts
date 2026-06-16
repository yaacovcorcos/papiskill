import { SkillCommentStatus, SkillRegistryKind, SkillVisibility } from "@prisma/client";
import { getPrisma } from "./prisma";
import { generatedRegistry } from "./generated-registry";
import {
  serializeForkSummary,
  serializeSkillSummary,
} from "./skill-serializers";
import { hasDatabaseUrl } from "./db-env";

export interface CatalogSkill {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  registryKind: string;
  visibility: string;
  author: string | null;
  compatibleWith: string[];
  tags: string[];
  categories: string[];
  installCommand: string;
  markdown?: string;
  starCount: number;
  commentCount: number;
}

export interface CatalogSkillDetail extends CatalogSkill {
  files: Array<{ path: string; content: string }>;
  installTargets: Record<string, string>;
}

export interface CatalogFilters {
  query?: string;
  categories?: string[];
  compatibility?: string[];
  statuses?: string[];
}

interface CatalogOptions {
  includeMarkdown?: boolean;
}

export async function getCatalogSkills(
  filters: string | CatalogFilters = "",
  options: CatalogOptions = {},
): Promise<CatalogSkill[]> {
  const normalizedFilters = normalizeFilters(filters);
  const includeMarkdown = options.includeMarkdown ?? false;

  if (hasDatabaseUrl()) {
    try {
      const prisma = getPrisma();
      const q = normalizedFilters.query;
      const normalizedQuery = q.toLowerCase();
      const skillSearchFilters = q
        ? [
            { name: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: normalizedQuery } },
            { categories: { has: normalizedQuery } },
            { compatibleWith: { has: normalizedQuery } },
            ...(normalizedQuery === "global" ||
            normalizedQuery === "curated" ||
            normalizedQuery === "official"
              ? [{ registryKind: "GLOBAL" as const }]
              : []),
          ]
        : [];
      const forkSearchFilters = q
        ? [
            { name: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: normalizedQuery } },
            { categories: { has: normalizedQuery } },
            { compatibleWith: { has: normalizedQuery } },
            ...(normalizedQuery === "profile" || normalizedQuery === "profiles"
              ? [{}]
              : []),
          ]
        : [];
      const shouldFetchSkills =
        normalizedFilters.statuses.length === 0 ||
        normalizedFilters.statuses.includes("global");
      const shouldFetchForks =
        normalizedFilters.statuses.length === 0 ||
        normalizedFilters.statuses.includes("profile");
      const skillWhere = {
        visibility: SkillVisibility.PUBLIC,
        ...(skillSearchFilters.length ? { OR: skillSearchFilters } : {}),
        ...(normalizedFilters.categories.length
          ? { categories: { hasSome: normalizedFilters.categories } }
          : {}),
        ...(normalizedFilters.compatibility.length
          ? { compatibleWith: { hasSome: normalizedFilters.compatibility } }
          : {}),
        ...(normalizedFilters.statuses.includes("global")
          ? { registryKind: SkillRegistryKind.GLOBAL }
          : {}),
      };
      const forkWhere = {
        visibility: SkillVisibility.PUBLIC,
        archivedAt: null,
        ...(forkSearchFilters.length ? { OR: forkSearchFilters } : {}),
        ...(normalizedFilters.categories.length
          ? { categories: { hasSome: normalizedFilters.categories } }
          : {}),
        ...(normalizedFilters.compatibility.length
          ? { compatibleWith: { hasSome: normalizedFilters.compatibility } }
          : {}),
      };
      const [skills, forks] = await Promise.all([
        shouldFetchSkills
          ? prisma.skill.findMany({
              where: skillWhere,
              include: {
                files: includeMarkdown
                  ? { where: { path: "SKILL.md" }, take: 1 }
                  : false,
                owner: { include: { profile: true } },
                _count: {
                  select: {
                    stars: true,
                    comments: { where: { status: SkillCommentStatus.VISIBLE } },
                  },
                },
              },
              orderBy: [{ registryKind: "asc" }, { updatedAt: "desc" }],
              take: 80,
            })
          : [],
        shouldFetchForks
          ? prisma.skillFork.findMany({
              where: forkWhere,
              include: {
                files: includeMarkdown
                  ? { where: { path: "SKILL.md" }, take: 1 }
                  : false,
                owner: { include: { profile: true } },
                _count: {
                  select: {
                    stars: true,
                    comments: { where: { status: SkillCommentStatus.VISIBLE } },
                  },
                },
              },
              orderBy: { updatedAt: "desc" },
              take: 80,
            })
          : [],
      ]);

      const fileCatalog = filterCatalogEntries(
        generatedRegistry,
        normalizedFilters,
        includeMarkdown,
      );
      const databaseSkills = skills.map((skill) => {
          const summary = serializeSkillSummary(skill);
          return {
            ...summary,
            description: skill.description,
            categories: skill.categories,
            installCommand: `papiskill install ${
              skill.registryKind === SkillRegistryKind.COMMUNITY ? "community" : "official"
            }/${skill.slug}`,
            ...(includeMarkdown
              ? { markdown: skill.files.at(0)?.content ?? "" }
              : {}),
            starCount: skill._count.stars,
            commentCount: skill._count.comments,
          };
        });
      const databaseSkillByKey = new Map(
        databaseSkills.map((skill) => [
          `${skill.registryKind}/${skill.slug}`,
          skill,
        ]),
      );

      return [
        ...fileCatalog.map((fileSkill) => {
          const databaseSkill = databaseSkillByKey.get(
            `${fileSkill.registryKind}/${fileSkill.slug}`,
          );
          return databaseSkill
            ? {
                ...fileSkill,
                starCount: databaseSkill.starCount,
                commentCount: databaseSkill.commentCount,
              }
            : fileSkill;
        }),
        ...databaseSkills.filter(
          (skill) =>
            !fileCatalog.some(
              (fileSkill) =>
                fileSkill.registryKind === skill.registryKind &&
                fileSkill.slug === skill.slug,
            ),
        ),
        ...forks.map((fork) => {
          const summary = serializeForkSummary(fork);
          const handle = fork.owner.profile?.handle ?? "profile";
          return {
            ...summary,
            description: fork.description,
            categories: fork.categories,
            installCommand: `papiskill install ${handle}/${fork.slug}`,
            ...(includeMarkdown
              ? { markdown: fork.files.at(0)?.content ?? "" }
              : {}),
            starCount: fork._count.stars,
            commentCount: fork._count.comments,
          };
        }),
      ];
    } catch {
      return getFileCatalogSkills(normalizedFilters, includeMarkdown);
    }
  }

  return getFileCatalogSkills(normalizedFilters, includeMarkdown);
}

function normalizeFilters(
  filters: string | CatalogFilters,
): Required<CatalogFilters> {
  if (typeof filters === "string") {
    return {
      query: filters.trim(),
      categories: [],
      compatibility: [],
      statuses: [],
    };
  }

  return {
    query: filters.query?.trim() ?? "",
    categories: uniqueNormalized(filters.categories ?? []),
    compatibility: uniqueNormalized(filters.compatibility ?? []),
    statuses: uniqueNormalized(filters.statuses ?? []).filter(
      (status) => status === "global" || status === "profile",
    ),
  };
}

function uniqueNormalized(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  );
}

async function getFileCatalogSkills(
  filters: Required<CatalogFilters>,
  includeMarkdown: boolean,
): Promise<CatalogSkill[]> {
  return filterCatalogEntries(generatedRegistry, filters, includeMarkdown);
}

function filterCatalogEntries(
  catalog: CatalogSkill[],
  filters: Required<CatalogFilters>,
  includeMarkdown: boolean,
) {
  const normalizedQuery = filters.query.toLowerCase();
  return catalog
    .filter((entry) => {
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(entry.registryKind)
      ) {
        return false;
      }
      if (
        filters.categories.length > 0 &&
        !entry.categories.some((category) =>
          filters.categories.includes(category),
        )
      ) {
        return false;
      }
      if (
        filters.compatibility.length > 0 &&
        !entry.compatibleWith.some((target) =>
          filters.compatibility.includes(target),
        )
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      const text = [
        entry.name,
        entry.summary,
        entry.description,
        entry.registryKind,
        entry.visibility,
        ...entry.tags,
        ...entry.categories,
        ...entry.compatibleWith,
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(normalizedQuery);
    })
    .map((entry) =>
      includeMarkdown ? entry : { ...entry, markdown: undefined },
    );
}

export async function getFileRegistrySkill(
  reference: string,
): Promise<CatalogSkillDetail | null> {
  const parts = reference.split("/").filter(Boolean);
  const slug = parts.at(-1);
  const namespace = parts.length > 1 ? parts[0] : "official";
  if (!slug) return null;

  const skill = generatedRegistry.find((entry) => {
    if (entry.slug !== slug) return false;
    if (namespace === "community") return entry.registryKind === "community";
    if (namespace === "official" || namespace === "global") {
      return entry.registryKind === "global";
    }
    return false;
  });
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
  };
}
