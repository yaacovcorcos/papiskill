import { errorResponse, jsonResponse } from "@/lib/server/http";
import { getCatalogSkills } from "@/lib/server/catalog";
import { getSessionUser, getTokenUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const actor = await getActor(request);
  const joinedReference = reference.join("/");
  const skill = await getDatabaseSkill(joinedReference, actor) ?? await getCatalogFallback(joinedReference);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }
  return jsonResponse(skill);
}

async function getActor(request: Request) {
  try {
    return await getTokenUser(request) ?? await getSessionUser();
  } catch {
    return null;
  }
}

async function getDatabaseSkill(reference: string, actor: Awaited<ReturnType<typeof getActor>>) {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await getSkillByReference(reference, actor);
  } catch {
    return null;
  }
}

async function getCatalogFallback(reference: string) {
  const slug = reference.split("/").filter(Boolean).at(-1);
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
