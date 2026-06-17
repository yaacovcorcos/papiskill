import {
  errorResponse,
  privateNoStoreCacheHeaders,
  publicCatalogCacheHeaders,
} from "@/lib/server/http";
import { getFileRegistrySkill } from "@/lib/server/catalog";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { recordDownloadEvent } from "@/lib/server/download-events";
import { buildSkillPackageZip, packageDownloadFilename } from "@/lib/server/package-archive";
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
  const actor = isPublicRegistry ? null : await getActor(request);
  const catalogSkill = isPublicRegistry ? await getCatalogFallback(joinedReference) : null;
  const skill = catalogSkill ?? await getDatabaseSkill(joinedReference, actor);
  if (!skill) {
    return errorResponse("Skill not found.", 404);
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "md";
  if (format === "zip") {
    await recordDownloadEvent({ reference: joinedReference, request, actor });
    const zip = buildSkillPackageZip({
      slug: skill.slug,
      files: skill.files,
    });
    const body = new Uint8Array(zip).buffer;
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${packageDownloadFilename(skill.slug)}"`,
        ...(isPublicRegistry ? publicCatalogCacheHeaders : privateNoStoreCacheHeaders),
      },
    });
  }

  if (format !== "md") {
    return errorResponse("Unsupported download format.", 400);
  }

  await recordDownloadEvent({ reference: joinedReference, request, actor });
  return new Response(skill.markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${packageDownloadFilename(skill.slug, "md")}"`,
      ...(isPublicRegistry ? publicCatalogCacheHeaders : privateNoStoreCacheHeaders),
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
  return getFileRegistrySkill(reference);
}
