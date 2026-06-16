import { errorResponse, publicCatalogCacheHeaders } from "@/lib/server/http";
import { getCatalogSkills } from "@/lib/server/catalog";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { isPublicRegistryReference, referenceSlug } from "@/lib/server/references";
import { getSessionUser, getTokenUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";

export const revalidate = 60;

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string[] }> },
) {
  const { reference } = await context.params;
  const joinedReference = reference.join("/");
  const isPublicRegistry = isPublicRegistryReference(joinedReference);
  const actor = isPublicRegistry ? null : await getActor(request);
  const databaseSkill = await getDatabaseSkill(joinedReference, actor);
  const skill = databaseSkill ?? (isPublicRegistry ? await getCatalogFallback(joinedReference) : null);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }

  return new Response(skill.markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename(skill.slug)}.md"`,
      ...(isPublicRegistry
        ? publicCatalogCacheHeaders
        : { "Cache-Control": "private, no-store" }),
    },
  });
}

async function getActor(request: Request) {
  if (!hasDatabaseUrl()) return null;
  try {
    return await getTokenUser(request) ?? await getSessionUser();
  } catch {
    return null;
  }
}

async function getDatabaseSkill(reference: string, actor: Awaited<ReturnType<typeof getActor>>) {
  if (!hasDatabaseUrl()) return null;
  try {
    return await getSkillByReference(reference, actor);
  } catch {
    return null;
  }
}

async function getCatalogFallback(reference: string) {
  const slug = referenceSlug(reference);
  if (!slug) return null;
  return (await getCatalogSkills("", { includeMarkdown: true })).find((item) => item.slug === slug) ?? null;
}

function safeFilename(slug: string) {
  return slug.replace(/[^a-z0-9_.-]/gi, "-") || "SKILL";
}
