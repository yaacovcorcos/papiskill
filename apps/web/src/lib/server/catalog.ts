import { SkillCommentStatus, SkillRegistryKind, SkillVisibility } from "@prisma/client";
import { getPrisma } from "./prisma";
import { generatedRegistry } from "./generated-registry";
import {
  serializeForkSummary,
  serializeSkillSummary,
} from "./skill-serializers";
import { hasDatabaseUrl } from "./db-env";
import { logServerWarning } from "./observability";
import { canonicalRegistryReference, parseSkillReference } from "./references";

export interface CatalogSkill {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  registryKind: string;
  visibility: string;
  author: string | null;
  version: string;
  license: string;
  compatibleWith: string[];
  tags: string[];
  categories: string[];
  installCommand: string;
  markdown?: string;
  files?: Array<{ path: string; content: string }>;
  starCount: number;
  commentCount: number;
  validationIssues: CatalogValidationIssue[];
  updatedAt?: string;
}

export interface CatalogSkillDetail extends CatalogSkill {
  files: Array<{ path: string; content: string }>;
  installTargets: Record<string, string>;
}

export interface CatalogValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  path?: string | null;
}

export interface CatalogFilters {
  query?: string;
  categories?: string[];
  compatibility?: string[];
  statuses?: string[];
  sort?: CatalogSort;
}

const allowedStatuses = ["global", "community", "profile"] as const;
type CatalogStatus = (typeof allowedStatuses)[number];
const allowedSorts = ["curated", "popular", "recent"] as const;
export type CatalogSort = (typeof allowedSorts)[number];

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
        normalizedFilters.statuses.some((status) => status !== "profile");
      const shouldFetchForks =
        normalizedFilters.statuses.length === 0 ||
        normalizedFilters.statuses.includes("profile");
      const registryKinds = normalizedFilters.statuses
        .filter((status): status is Exclude<CatalogStatus, "profile"> =>
          status === "global" || status === "community",
        )
        .map((status) =>
          status === "global"
            ? SkillRegistryKind.GLOBAL
            : SkillRegistryKind.COMMUNITY,
        );
      const skillWhere = {
        visibility: SkillVisibility.PUBLIC,
        ...(skillSearchFilters.length ? { OR: skillSearchFilters } : {}),
        ...(normalizedFilters.categories.length
          ? { categories: { hasSome: normalizedFilters.categories } }
          : {}),
        ...(normalizedFilters.compatibility.length
          ? { compatibleWith: { hasSome: normalizedFilters.compatibility } }
          : {}),
        ...(registryKinds.length
          ? { registryKind: { in: registryKinds } }
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
                validations: true,
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
                validations: true,
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
        const reference = canonicalRegistryReference(summary.registryKind, summary.slug);
        return {
          ...summary,
          description: skill.description,
          categories: skill.categories,
          installCommand: `papiskill install ${reference}`,
          ...(includeMarkdown
            ? { markdown: skill.files.at(0)?.content ?? "" }
            : {}),
          starCount: skill._count.stars,
          commentCount: skill._count.comments,
          validationIssues: skill.validations.map((issue) => ({
            level: issue.level.toLowerCase() as "error" | "warning",
            code: issue.code,
            message: issue.message,
            path: issue.path ?? null,
          })),
          updatedAt: skill.updatedAt.toISOString(),
        };
      });
      const databaseSkillByKey = new Map(
        databaseSkills.map((skill) => [
          `${skill.registryKind}/${skill.slug}`,
          skill,
        ]),
      );

      return sortCatalogSkills([
        ...fileCatalog.map((fileSkill) => {
          const databaseSkill = databaseSkillByKey.get(
            `${fileSkill.registryKind}/${fileSkill.slug}`,
          );
          return databaseSkill
            ? {
                ...fileSkill,
                starCount: databaseSkill.starCount,
                commentCount: databaseSkill.commentCount,
                validationIssues: databaseSkill.validationIssues,
                updatedAt: databaseSkill.updatedAt,
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
            validationIssues: fork.validations.map((issue) => ({
              level: issue.level.toLowerCase() as "error" | "warning",
              code: issue.code,
              message: issue.message,
              path: issue.path ?? null,
            })),
            updatedAt: fork.updatedAt.toISOString(),
          };
        }),
      ], normalizedFilters.sort);
    } catch (error) {
      logServerWarning("catalog.database_fallback", error, {
        hasQuery: Boolean(normalizedFilters.query),
        categoryCount: normalizedFilters.categories.length,
        compatibilityCount: normalizedFilters.compatibility.length,
        statusCount: normalizedFilters.statuses.length,
        sort: normalizedFilters.sort,
      });
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
      sort: "curated",
    };
  }

  return {
    query: filters.query?.trim() ?? "",
    categories: uniqueNormalized(filters.categories ?? []),
    compatibility: uniqueNormalized(filters.compatibility ?? []),
    statuses: uniqueNormalized(filters.statuses ?? []).filter(isCatalogStatus),
    sort: isCatalogSort(filters.sort) ? filters.sort : "curated",
  };
}

function uniqueNormalized(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  );
}

function isCatalogStatus(status: string): status is CatalogStatus {
  return (allowedStatuses as readonly string[]).includes(status);
}

function isCatalogSort(sort: string | undefined): sort is CatalogSort {
  return Boolean(sort && (allowedSorts as readonly string[]).includes(sort));
}

async function getFileCatalogSkills(
  filters: Required<CatalogFilters>,
  includeMarkdown: boolean,
): Promise<CatalogSkill[]> {
  return sortCatalogSkills(
    filterCatalogEntries(generatedRegistry, filters, includeMarkdown),
    filters.sort,
  );
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
    .map((entry) => {
      if (includeMarkdown) return entry;
      const entryWithoutMarkdown = { ...entry };
      delete entryWithoutMarkdown.markdown;
      return entryWithoutMarkdown;
    });
}

export function sortCatalogSkills(skills: CatalogSkill[], sort: CatalogSort): CatalogSkill[] {
  if (sort === "curated") return skills;

  return [...skills].sort((a, b) => {
    if (sort === "popular") {
      return (
        b.starCount - a.starCount ||
        b.commentCount - a.commentCount ||
        statusRank(a.registryKind) - statusRank(b.registryKind) ||
        a.name.localeCompare(b.name)
      );
    }

    return (
      timestamp(b.updatedAt) - timestamp(a.updatedAt) ||
      statusRank(a.registryKind) - statusRank(b.registryKind) ||
      a.name.localeCompare(b.name)
    );
  });
}

function timestamp(value: string | undefined) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function statusRank(registryKind: string) {
  if (registryKind === "global") return 0;
  if (registryKind === "community") return 1;
  return 2;
}

export async function getFileRegistrySkill(
  reference: string,
): Promise<CatalogSkillDetail | null> {
  const skill = getGeneratedRegistrySkillByReference(reference);
  if (!skill) return null;

  return {
    ...skill,
    files: skill.files ?? [
      {
        path: "SKILL.md",
        content: skill.markdown ?? "",
      },
    ],
    installTargets: {},
  };
}

export function getGeneratedRegistrySkillByReference(reference: string): CatalogSkill | null {
  const parsed = parseSkillReference(reference);
  if (parsed?.kind !== "registry") return null;

  const skill = generatedRegistry.find((entry) => {
    return entry.slug === parsed.slug && entry.registryKind === parsed.registryKind;
  });
  return skill ?? null;
}
