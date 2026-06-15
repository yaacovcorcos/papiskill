import { loadRegistry } from "@papiskill/skill-core";
import { SkillVisibility } from "@prisma/client";
import path from "node:path";
import { getPrisma } from "./prisma";
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
  const registryRoot = path.resolve(process.cwd(), "../../registry");
  const packages = await loadRegistry(registryRoot);
  const normalizedQuery = query.trim().toLowerCase();
  return packages
    .filter((entry) => {
      if (!normalizedQuery) return true;
      const text = [
        entry.manifest.name,
        entry.manifest.summary,
        entry.manifest.description,
        ...entry.manifest.tags,
        ...entry.manifest.categories,
      ].join(" ").toLowerCase();
      return text.includes(normalizedQuery);
    })
    .map((entry) => ({
      id: entry.manifest.id,
      slug: entry.manifest.id,
      name: entry.manifest.name,
      summary: entry.manifest.summary,
      description: entry.manifest.description,
      registryKind: entry.registryKind === "official" ? "global" : "community",
      visibility: entry.manifest.visibility,
      author: entry.manifest.maintainers[0]?.github ?? entry.manifest.maintainers[0]?.name ?? null,
      compatibleWith: entry.manifest.compatible_with,
      tags: entry.manifest.tags,
      categories: entry.manifest.categories,
      installCommand: `papiskill install official/${entry.manifest.id}`,
      markdown: entry.skillMarkdown,
    }));
}
