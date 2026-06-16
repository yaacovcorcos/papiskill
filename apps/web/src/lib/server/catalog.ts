import { SkillVisibility } from "@prisma/client";
import { getPrisma } from "./prisma";
import { generatedRegistry } from "./generated-registry";
import { serializeForkSummary, serializeSkillSummary } from "./skill-serializers";

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
  markdown: string;
}

export async function getCatalogSkills(query = ""): Promise<CatalogSkill[]> {
  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma();
      const q = query.trim();
      const [skills, forks] = await Promise.all([
        prisma.skill.findMany({
          where: {
            visibility: SkillVisibility.PUBLIC,
            ...(q ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            } : {}),
          },
          include: {
            files: true,
            owner: { include: { profile: true } },
          },
          orderBy: [{ registryKind: "asc" }, { updatedAt: "desc" }],
          take: 80,
        }),
        prisma.skillFork.findMany({
          where: {
            visibility: SkillVisibility.PUBLIC,
            archivedAt: null,
            ...(q ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            } : {}),
          },
          include: {
            files: true,
            owner: { include: { profile: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 80,
        }),
      ]);

      return [
        ...skills.map((skill) => {
          const summary = serializeSkillSummary(skill);
          return {
            ...summary,
            description: skill.description,
            categories: skill.categories,
            installCommand: `papiskill install official/${skill.slug}`,
            markdown: skill.files.find((file) => file.path === "SKILL.md")?.content ?? "",
          };
        }),
        ...forks.map((fork) => {
          const summary = serializeForkSummary(fork);
          const handle = fork.owner.profile?.handle ?? "profile";
          return {
            ...summary,
            description: fork.description,
            categories: fork.categories,
            installCommand: `papiskill install ${handle}/${fork.slug}`,
            markdown: fork.files.find((file) => file.path === "SKILL.md")?.content ?? "",
          };
        }),
      ];
    } catch {
      return getFileCatalogSkills(query);
    }
  }

  return getFileCatalogSkills(query);
}

async function getFileCatalogSkills(query = ""): Promise<CatalogSkill[]> {
  const normalizedQuery = query.trim().toLowerCase();
  return generatedRegistry
    .filter((entry) => {
      if (!normalizedQuery) return true;
      const text = [
        entry.name,
        entry.summary,
        entry.description,
        ...entry.tags,
        ...entry.categories,
      ].join(" ").toLowerCase();
      return text.includes(normalizedQuery);
    });
}
