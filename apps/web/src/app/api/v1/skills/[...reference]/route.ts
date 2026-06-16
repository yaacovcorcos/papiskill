import {
  errorResponse,
  jsonResponse,
  publicCatalogCacheHeaders,
} from "@/lib/server/http";
import { getCatalogSkills } from "@/lib/server/catalog";
import { hasDatabaseUrl } from "@/lib/server/db-env";
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
  const skill = await getDatabaseSkill(joinedReference, actor) ?? await getCatalogFallback(joinedReference);
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
  const slug = reference.split("/").filter(Boolean).at(-1);
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

function isPublicRegistryReference(reference: string) {
  const parts = reference.split("/").filter(Boolean);
  if (parts.length <= 1) return true;
  return ["official", "global", "community"].includes(parts[0] ?? "");
}
