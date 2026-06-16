import { SkillCommentStatus, SkillRegistryKind, SkillVisibility, type User } from "@prisma/client";
import { getPrisma } from "./prisma";

export const maxCommentBodyLength = 2_000;

export interface SkillEngagementComment {
  id: string;
  body: string;
  createdAt: Date;
  authorHandle: string | null;
  authorName: string | null;
  authorAvatarUrl: string | null;
  viewerCanDelete: boolean;
}

export interface SkillEngagement {
  enabled: boolean;
  reference: string;
  path: string;
  starCount: number;
  commentCount: number;
  viewerHasStarred: boolean;
  comments: SkillEngagementComment[];
}

interface EngagementTarget {
  kind: "skill" | "fork";
  id: string;
  reference: string;
  path: string;
}

export function normalizeCommentBody(value: string): string {
  return value.replace(/\r\n/g, "\n").trim().slice(0, maxCommentBodyLength);
}

export function engagementPathForReference(reference: string): string {
  const parts = reference.split("/").filter(Boolean);
  const namespace = parts.length > 1 ? parts[0] : "official";
  const slug = parts.at(-1) ?? "";

  if (namespace === "community") {
    return `/skills/community/${slug}`;
  }
  if (namespace === "official" || namespace === "global") {
    return `/skills/official/${slug}`;
  }
  return `/u/${namespace}/skills/${slug}`;
}

export async function getSkillEngagement(
  reference: string,
  viewer?: Pick<User, "id"> | null,
): Promise<SkillEngagement> {
  const path = engagementPathForReference(reference);
  if (!process.env.DATABASE_URL) {
    return emptyEngagement(reference, path);
  }

  const target = await getPublicEngagementTarget(reference);
  if (!target) {
    return emptyEngagement(reference, path);
  }

  const targetWhere = target.kind === "skill"
    ? { skillId: target.id }
    : { forkId: target.id };
  const [starCount, commentCount, viewerStar, comments] = await Promise.all([
    getPrisma().skillStar.count({ where: targetWhere }),
    getPrisma().skillComment.count({
      where: { ...targetWhere, status: SkillCommentStatus.VISIBLE },
    }),
    viewer
      ? getPrisma().skillStar.findFirst({
          where: { userId: viewer.id, ...targetWhere },
          select: { id: true },
        })
      : null,
    getPrisma().skillComment.findMany({
      where: { ...targetWhere, status: SkillCommentStatus.VISIBLE },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    enabled: true,
    reference: target.reference,
    path: target.path,
    starCount,
    commentCount,
    viewerHasStarred: Boolean(viewerStar),
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorHandle: comment.user.profile?.handle ?? null,
      authorName: comment.user.profile?.name ?? comment.user.name,
      authorAvatarUrl: comment.user.profile?.avatarUrl ?? comment.user.image,
      viewerCanDelete: viewer?.id === comment.userId,
    })),
  };
}

export async function getPublicEngagementTarget(reference: string): Promise<EngagementTarget | null> {
  const parts = reference.split("/").filter(Boolean);
  const namespace = parts.length > 1 ? parts[0] : "official";
  const slug = parts.at(-1);
  if (!namespace || !slug) return null;

  if (namespace === "official" || namespace === "global" || namespace === "community") {
    const registryKind = namespace === "community" ? SkillRegistryKind.COMMUNITY : SkillRegistryKind.GLOBAL;
    const skill = await getPrisma().skill.findFirst({
      where: {
        slug,
        registryKind,
        visibility: SkillVisibility.PUBLIC,
      },
      select: { id: true, slug: true, registryKind: true },
    });
    if (!skill) return null;

    const canonicalNamespace = skill.registryKind === SkillRegistryKind.COMMUNITY ? "community" : "official";
    return {
      kind: "skill",
      id: skill.id,
      reference: `${canonicalNamespace}/${skill.slug}`,
      path: `/skills/${canonicalNamespace}/${skill.slug}`,
    };
  }

  const fork = await getPrisma().skillFork.findFirst({
    where: {
      slug,
      archivedAt: null,
      visibility: SkillVisibility.PUBLIC,
      owner: { profile: { handle: namespace } },
    },
    include: { owner: { include: { profile: true } } },
  });
  if (!fork) return null;

  const handle = fork.owner.profile?.handle ?? namespace;
  return {
    kind: "fork",
    id: fork.id,
    reference: `${handle}/${fork.slug}`,
    path: `/u/${handle}/skills/${fork.slug}`,
  };
}

export function emptyEngagement(reference: string, path = engagementPathForReference(reference)): SkillEngagement {
  return {
    enabled: false,
    reference,
    path,
    starCount: 0,
    commentCount: 0,
    viewerHasStarred: false,
    comments: [],
  };
}
