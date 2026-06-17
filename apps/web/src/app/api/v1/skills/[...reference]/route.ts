import {
  errorResponse,
  jsonResponse,
  publicCatalogCacheHeaders,
} from "@/lib/server/http";
import { getFileRegistrySkill } from "@/lib/server/catalog";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { logServerWarning } from "@/lib/server/observability";
import { isPublicRegistryReference } from "@/lib/server/references";
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
  const actor = isPublicRegistry ? null : await getActor(request, joinedReference);
  const catalogSkill = isPublicRegistry ? await getCatalogFallback(joinedReference) : null;
  const skill = catalogSkill ?? await getDatabaseSkill(joinedReference, actor);
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

async function getActor(request: Request, reference: string) {
  try {
    return await getTokenUser(request) ?? await getSessionUser();
  } catch (error) {
    logServerWarning("api.skills.actor_lookup_failed", error, { reference });
    return null;
  }
}

async function getDatabaseSkill(reference: string, actor: Awaited<ReturnType<typeof getActor>>) {
  if (!hasDatabaseUrl()) return null;
  try {
    return await getSkillByReference(reference, actor);
  } catch (error) {
    logServerWarning("api.skills.database_lookup_failed", error, {
      reference,
      actorSignedIn: Boolean(actor),
    });
    return null;
  }
}

async function getCatalogFallback(reference: string) {
  return getFileRegistrySkill(reference);
}
