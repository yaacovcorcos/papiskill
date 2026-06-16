"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SkillCommentStatus } from "@prisma/client";
import { ensureProfile } from "@/lib/server/profiles";
import { getSessionUser } from "@/lib/server/request-auth";
import { getPrisma } from "@/lib/server/prisma";
import {
  engagementPathForReference,
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
    await getPrisma().skillStar.create({
      data: { userId: user.id, ...targetWhere },
    });
  }

  revalidatePath(target.path);
  revalidatePath("/skills");
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

  revalidatePath(target.path);
  revalidatePath("/skills");
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

  revalidatePath(target.path);
  revalidatePath("/skills");
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
