import { createHash } from "node:crypto";
import path from "node:path";
import { SkillRegistryKind, ValidationLevel } from "@prisma/client";
import { loadRegistry } from "../../../packages/skill-core/src/registry-loader";
import { validateSkillPackage } from "../../../packages/skill-core/src/validation";
import { getPrisma } from "../src/lib/server/prisma";

const registryRoot = path.resolve(process.cwd(), "../../registry");

async function main() {
  const packages = await loadRegistry(registryRoot);
  const prisma = getPrisma();

  for (const registryPackage of packages) {
    const validation = validateSkillPackage(registryPackage.files);
    if (!validation.package) {
      throw new Error(`Invalid registry package at ${registryPackage.packagePath}`);
    }

    const manifest = validation.package.manifest;
    const packageHash = createHash("sha256")
      .update(JSON.stringify(registryPackage.files))
      .digest("hex");

    const skill = await prisma.skill.upsert({
      where: {
        registryKind_slug: {
          registryKind: registryPackage.registryKind === "official"
            ? SkillRegistryKind.GLOBAL
            : SkillRegistryKind.COMMUNITY,
          slug: manifest.id,
        },
      },
      create: {
        slug: manifest.id,
        name: manifest.name,
        summary: manifest.summary,
        description: manifest.description,
        registryKind: registryPackage.registryKind === "official"
          ? SkillRegistryKind.GLOBAL
          : SkillRegistryKind.COMMUNITY,
        visibility: "PUBLIC",
        sourcePath: registryPackage.packagePath,
        sourceUrl: manifest.source_url,
        packageHash,
        version: manifest.version,
        license: manifest.license,
        categories: manifest.categories,
        tags: manifest.tags.map((tag) => tag.toLowerCase()),
        compatibleWith: manifest.compatible_with,
        installTargets: manifest.install_targets,
        authorName: manifest.maintainers[0]?.github ?? manifest.maintainers[0]?.name,
        authorUrl: manifest.maintainers[0]?.github
          ? `https://github.com/${manifest.maintainers[0].github}`
          : manifest.maintainers[0]?.url,
        publishedAt: new Date(),
      },
      update: {
        name: manifest.name,
        summary: manifest.summary,
        description: manifest.description,
        visibility: "PUBLIC",
        sourcePath: registryPackage.packagePath,
        sourceUrl: manifest.source_url,
        packageHash,
        version: manifest.version,
        license: manifest.license,
        categories: manifest.categories,
        tags: manifest.tags.map((tag) => tag.toLowerCase()),
        compatibleWith: manifest.compatible_with,
        installTargets: manifest.install_targets,
        authorName: manifest.maintainers[0]?.github ?? manifest.maintainers[0]?.name,
        authorUrl: manifest.maintainers[0]?.github
          ? `https://github.com/${manifest.maintainers[0].github}`
          : manifest.maintainers[0]?.url,
        publishedAt: new Date(),
      },
    });

    await prisma.$transaction([
      prisma.skillFile.deleteMany({ where: { skillId: skill.id } }),
      prisma.skillValidation.deleteMany({ where: { skillId: skill.id } }),
    ]);

    await prisma.skillFile.createMany({
      data: registryPackage.files.map((file) => ({
        skillId: skill.id,
        path: file.path,
        content: file.content,
        sizeBytes: Buffer.byteLength(file.content),
      })),
    });

    await prisma.skillValidation.createMany({
      data: validation.issues.map((issue) => ({
        skillId: skill.id,
        level: issue.level === "error" ? ValidationLevel.ERROR : ValidationLevel.WARNING,
        code: issue.code,
        message: issue.message,
        path: issue.path,
      })),
    });

    await prisma.skillVersion.upsert({
      where: {
        skillId_version: {
          skillId: skill.id,
          version: manifest.version,
        },
      },
      create: {
        skillId: skill.id,
        version: manifest.version,
        packageHash,
      },
      update: {
        packageHash,
      },
    });

    console.log(`Indexed ${registryPackage.registryKind}/${manifest.id}`);
  }

  await prisma.$disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await getPrisma().$disconnect();
  process.exitCode = 1;
});
