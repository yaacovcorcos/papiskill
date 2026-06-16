import { errorResponse } from "@/lib/server/http";
import { getCatalogSkills } from "@/lib/server/catalog";
import { getSessionUser, getTokenUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const joinedReference = reference.join("/");
  const actor = await getActor(request);
  const skill = await getDatabaseSkill(joinedReference, actor) ?? await getCatalogFallback(joinedReference);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }

  return new Response(skill.markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(skill.slug)}.md"`,
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

async function getActor(request: Request) {
  if (!process.env.DATABASE_URL) return null;
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
  return (await getCatalogSkills()).find((item) => item.slug === slug) ?? null;
}

function safeFilename(slug: string) {
  return slug.replace(/[^a-z0-9_.-]/gi, "-") || "SKILL";
}
