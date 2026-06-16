import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadRegistry } from "../../../packages/skill-core/src/registry-loader";

const registryRoot = path.resolve(process.cwd(), "../../registry");
const outputPath = path.resolve(
  process.cwd(),
  "src/lib/server/generated-registry.ts",
);

async function main() {
  const packages = await loadRegistry(registryRoot);
  const skills = packages.map((registryPackage) => {
    const manifest = registryPackage.manifest;
    const registryKind =
      registryPackage.registryKind === "official" ? "global" : "community";
    const markdown =
      registryPackage.files.find((file) => file.path === "SKILL.md")?.content ??
      "";

    return {
      id: manifest.id,
      slug: manifest.id,
      name: manifest.name,
      summary: manifest.summary,
      description: manifest.description,
      registryKind,
      visibility: manifest.visibility,
      author:
        manifest.maintainers[0]?.github ??
        manifest.maintainers[0]?.name ??
        null,
      compatibleWith: manifest.compatible_with,
      tags: manifest.tags.map((tag) => tag.toLowerCase()),
      categories: manifest.categories.map((category) => category.toLowerCase()),
      installCommand: `papiskill install ${registryPackage.registryKind}/${manifest.id}`,
      starCount: 0,
      commentCount: 0,
      markdown,
      files: registryPackage.files,
    };
  });

  const source = `import type { CatalogSkill } from "./catalog";\n\nexport const generatedRegistry: CatalogSkill[] = ${JSON.stringify(skills, null, 2)};\n`;
  await writeFile(outputPath, source);
  console.log(`Generated ${path.relative(process.cwd(), outputPath)} with ${skills.length} skills`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
