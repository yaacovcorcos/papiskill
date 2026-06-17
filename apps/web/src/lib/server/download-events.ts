import { createHash } from "node:crypto";
import {
  DownloadSubjectType,
  SkillRegistryKind,
  SkillVisibility,
  type User,
} from "@prisma/client";
import { resolveBetterAuthSecret } from "../auth-secret";
import { hasDatabaseUrl } from "./db-env";
import { logServerWarning } from "./observability";
import { getPrisma } from "./prisma";
import { parseSkillReference } from "./references";
import { readableForkVisibilityWhere } from "./visibility";

const ipHeaders = [
  "x-vercel-forwarded-for",
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
];

interface DownloadEventInput {
  reference: string;
  request: Request;
  actor?: Pick<User, "id"> | null;
}

interface DownloadTarget {
  kind: "skill" | "fork";
  id: string;
}

export async function recordDownloadEvent(input: DownloadEventInput) {
  if (!hasDatabaseUrl()) return;

  try {
    const target = await findDownloadTarget(input.reference, input.actor?.id);
    if (!target) return;

    await getPrisma().downloadEvent.create({
      data: downloadEventData(target, input.request, input.actor),
    });
  } catch (error) {
    logServerWarning("download_event.record_failed", error, {
      reference: input.reference,
      actorSignedIn: Boolean(input.actor),
    });
  }
}

async function findDownloadTarget(
  reference: string,
  actorId?: string | null,
): Promise<DownloadTarget | null> {
  const parsed = parseSkillReference(reference);
  if (!parsed) return null;

  if (parsed.kind === "registry") {
    const skill = await getPrisma().skill.findFirst({
      where: {
        slug: parsed.slug,
        registryKind: parsed.registryKind === "community" ? SkillRegistryKind.COMMUNITY : SkillRegistryKind.GLOBAL,
        visibility: SkillVisibility.PUBLIC,
      },
      select: { id: true },
    });
    return skill ? { kind: "skill", id: skill.id } : null;
  }

  const fork = await getPrisma().skillFork.findFirst({
    where: {
      slug: parsed.slug,
      owner: { profile: { handle: parsed.handle } },
      archivedAt: null,
      OR: readableForkVisibilityWhere(actorId),
    },
    select: { id: true },
  });
  return fork ? { kind: "fork", id: fork.id } : null;
}

export function downloadEventData(
  target: DownloadTarget,
  request: Request,
  actor?: Pick<User, "id"> | null,
) {
  return {
    userId: actor?.id ?? null,
    skillId: target.kind === "skill" ? target.id : null,
    forkId: target.kind === "fork" ? target.id : null,
    subjectType:
      target.kind === "skill" ? DownloadSubjectType.SKILL : DownloadSubjectType.FORK,
    userAgent: request.headers.get("user-agent"),
    ipHash: hashRequestIp(request),
  };
}

export function hashRequestIp(
  request: Request,
  salt = resolveBetterAuthSecret(),
): string | null {
  const ip = requestIp(request);
  if (!ip) return null;

  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function requestIp(request: Request): string | null {
  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    const firstValue = value?.split(",").map((item) => item.trim()).find(Boolean);
    if (firstValue) return firstValue;
  }
  return null;
}
