import {
  errorResponse,
  jsonResponse,
  publicCatalogCacheHeaders,
} from "@/lib/server/http";
import { getCatalogSkills, getFileRegistrySkill } from "@/lib/server/catalog";
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
  return jsonResponse(
    skill,
    isPublicRegistry
      ? {
          headers: publicCatalogCacheHeaders,
        }
      : undefined,
  );
}

async function getActor(request: Request) {
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
  const fileSkill = await getFileRegistrySkill(reference);
  if (fileSkill) return fileSkill;

  const slug = referenceSlug(reference);
  if (!slug) return null;
  const skill = (await getCatalogSkills("", { includeMarkdown: true })).find((item) => item.slug === slug);
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
