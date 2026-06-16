import { errorResponse, jsonResponse } from "@/lib/server/http";
import { getCatalogSkills, getFileRegistrySkill } from "@/lib/server/catalog";
import { getTokenUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const actor = await getTokenUser(request);
  const joinedReference = reference.join("/");
  const skill = await getDatabaseSkill(joinedReference, actor) ?? await getCatalogFallback(joinedReference);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }
  return jsonResponse(skill);
}

async function getDatabaseSkill(reference: string, actor: Awaited<ReturnType<typeof getTokenUser>>) {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await getSkillByReference(reference, actor);
  } catch {
    return null;
  }
}

async function getCatalogFallback(reference: string) {
  const fileSkill = await getFileRegistrySkill(reference);
  if (fileSkill) return fileSkill;

  const parts = reference.split("/").filter(Boolean);
  const namespace = parts.length > 1 ? parts[0] : "official";
  if (namespace && !["official", "global", "community"].includes(namespace)) {
    return null;
  }

  const slug = parts.at(-1);
  if (!slug) return null;
  const skill = (await getCatalogSkills()).find((item) => item.slug === slug);
  if (!skill) return null;
  return {
    ...skill,
    files: [
      {
        path: "SKILL.md",
        content: skill.markdown,
      },
    ],
    installTargets: {},
  };
}
