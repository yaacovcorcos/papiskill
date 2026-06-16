"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, SkillCommentStatus } from "@prisma/client";
import { ensureProfile } from "@/lib/server/profiles";
import { getSessionUser } from "@/lib/server/request-auth";
import { getPrisma } from "@/lib/server/prisma";
import {
  engagementPathForReference,
  engagementRevalidationPaths,
  engagementTargetWhere,
  getPublicEngagementTarget,
  normalizeCommentBody,
} from "@/lib/server/engagement";

export async function toggleStarAction(formData: FormData) {
  const user = await getRequiredUser();
  const reference = stringField(formData, "reference");
  const target = await getPublicEngagementTarget(reference);
  if (!target) {
    redirect(engagementPathForReference(reference));
  }

  const targetWhere = engagementTargetWhere(target);
  const existing = await getPrisma().skillStar.findFirst({
    where: { userId: user.id, ...targetWhere },
    select: { id: true },
  });

  if (existing) {
    await getPrisma().skillStar.delete({ where: { id: existing.id } });
  } else {
    try {
      await getPrisma().skillStar.create({
        data: { userId: user.id, ...targetWhere },
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }
    }
  }

  revalidateEngagementPaths(target);
}

export async function createCommentAction(formData: FormData) {
  const user = await getRequiredUser();
  await ensureProfile(user);
  const reference = stringField(formData, "reference");
  const body = normalizeCommentBody(stringField(formData, "body"));
  const target = await getPublicEngagementTarget(reference);
  if (!target) {
    redirect(engagementPathForReference(reference));
  }
  if (body.length < 2) {
    revalidatePath(target.path);
    return;
  }

  await getPrisma().skillComment.create({
    data: {
      userId: user.id,
      body,
      ...engagementTargetWhere(target),
    },
  });

  revalidateEngagementPaths(target);
}

export async function deleteCommentAction(formData: FormData) {
  const user = await getRequiredUser();
  const reference = stringField(formData, "reference");
  const commentId = stringField(formData, "commentId");
  const target = await getPublicEngagementTarget(reference);
  if (!target || !commentId) {
    redirect(engagementPathForReference(reference));
  }

  await getPrisma().skillComment.updateMany({
    where: {
      id: commentId,
      userId: user.id,
      status: SkillCommentStatus.VISIBLE,
      ...engagementTargetWhere(target),
    },
    data: {
      status: SkillCommentStatus.DELETED,
      body: "",
    },
  });

  revalidateEngagementPaths(target);
}

function revalidateEngagementPaths(target: { path: string }) {
  for (const path of engagementRevalidationPaths(target)) {
    revalidatePath(path);
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function getRequiredUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  return user;
}

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
