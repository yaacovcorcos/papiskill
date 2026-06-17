"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SkillVisibility } from "@prisma/client";
import { signInPath } from "@/lib/auth-callback";
import { getSessionUser } from "@/lib/server/request-auth";
import { ensureProfile, normalizeHandle, validateHandle } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { createApiToken } from "@/lib/server/tokens";
import {
  createBlankLibrarySkill,
  createLibraryCopy,
  normalizeSlug,
  persistForkValidation,
  recordFromJson,
  uniqueLibrarySlug,
  validateForkDraftPackage,
} from "@/lib/server/library";

export interface TokenActionState {
  token?: string;
  error?: string;
}

export interface ProfileActionState {
  ok?: boolean;
  error?: string;
}

export interface SaveForkActionIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  path?: string;
}

export interface SaveForkActionState {
  ok?: boolean;
  error?: string;
  issues?: SaveForkActionIssue[];
}

export async function createTokenAction(
  _previousState: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  const user = await getRequiredUser();
  const name = stringField(formData, "name") || "CLI token";
  const token = createApiToken();

  await getPrisma().apiToken.create({
    data: {
      userId: user.id,
      name,
      prefix: token.prefix,
      tokenHash: token.tokenHash,
    },
  });

  revalidatePath("/dashboard");
  return { token: token.rawToken };
}

export async function revokeTokenAction(formData: FormData) {
  const user = await getRequiredUser();
  const tokenId = stringField(formData, "tokenId");
  if (!tokenId) return;

  await getPrisma().apiToken.updateMany({
    where: { id: tokenId, userId: user.id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/dashboard");
}

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getRequiredUser();
  const profile = await ensureProfile(user);
  const handle = normalizeHandle(stringField(formData, "handle"));
  const handleError = validateHandle(handle);
  if (handleError) {
    return { error: handleError };
  }

  const taken = await getPrisma().profile.findFirst({
    where: {
      handle,
      userId: { not: user.id },
    },
    select: { id: true },
  });
  if (taken) {
    return { error: "That handle is already taken." };
  }

  const website = optionalUrl(stringField(formData, "website"));
  if (website === false) {
    return { error: "Website must be a valid http or https URL." };
  }

  await getPrisma().profile.update({
    where: { id: profile.id },
    data: {
      handle,
      name: nullableField(formData, "name"),
      bio: nullableField(formData, "bio"),
      website,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/authors");
  revalidatePath("/skills");
  revalidatePath("/api/v1/skills");
  revalidatePath(`/u/${profile.handle}`);
  revalidatePath(`/u/${handle}`);
  return { ok: true };
}

export async function copySkillToLibraryAction(formData: FormData) {
  const reference = stringField(formData, "reference");
  const user = await getRequiredUser(reference ? `/dashboard/fork?skill=${encodeURIComponent(reference)}` : "/dashboard/fork");
  const profile = await ensureProfile(user);
  const visibility = visibilityField(formData, "visibility");
  if (!reference) {
    redirect("/skills");
  }

  let forkId: string | null = null;
  try {
    const fork = await createLibraryCopy({ reference, user, visibility });
    forkId = fork.id;
  } catch {
    redirect("/skills");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath("/skills");
  revalidatePath("/api/v1/skills");
  revalidatePath(`/u/${profile.handle}`);
  redirect(`/dashboard/library/${forkId}/edit`);
}

export async function createBlankSkillAction() {
  const user = await getRequiredUser();
  const profile = await ensureProfile(user);
  const fork = await createBlankLibrarySkill({ user });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath("/skills");
  revalidatePath("/api/v1/skills");
  revalidatePath(`/u/${profile.handle}`);
  redirect(`/dashboard/library/${fork.id}/edit`);
}

export async function archiveLibrarySkillAction(formData: FormData) {
  const user = await getRequiredUser("/dashboard/library");
  const profile = await ensureProfile(user);
  const forkId = stringField(formData, "forkId");
  if (!forkId) return;

  await getPrisma().skillFork.updateMany({
    where: { id: forkId, ownerId: user.id, archivedAt: null },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath("/skills");
  revalidatePath("/api/v1/skills");
  revalidatePath(`/u/${profile.handle}`);
}

export async function forkSkillAction(formData: FormData) {
  return copySkillToLibraryAction(formData);
}

export async function saveForkAction(
  _previousState: SaveForkActionState,
  formData: FormData,
): Promise<SaveForkActionState> {
  const user = await getRequiredUser();
  const forkId = stringField(formData, "forkId");
  const requestedSlug = normalizeSlug(stringField(formData, "slug"));
  const name = stringField(formData, "name");
  const summary = stringField(formData, "summary");
  const description = stringField(formData, "description");
  const skillMarkdown = stringField(formData, "skillMarkdown");
  const visibility = visibilityField(formData, "visibility");

  const fork = await getPrisma().skillFork.findFirst({
    where: { id: forkId, ownerId: user.id },
    include: { files: true },
  });
  if (!fork) {
    redirect("/dashboard");
  }

  const slug = requestedSlug === fork.slug ? fork.slug : await uniqueLibrarySlug(user.id, requestedSlug);
  const draft = validateForkDraftPackage({
    slug,
    name,
    summary,
    description,
    visibility: visibility.toLowerCase(),
    version: fork.version,
    license: fork.license,
    categories: fork.categories,
    tags: fork.tags,
    compatibleWith: fork.compatibleWith,
    installTargets: recordFromJson(fork.installTargets),
    skillMarkdown,
    existingFiles: fork.files,
  });
  if (draft.hasBlockingErrors) {
    return {
      error: "Fix validation errors before saving this skill.",
      issues: draft.validation.issues,
    };
  }

  await getPrisma().$transaction([
    getPrisma().skillFork.update({
      where: { id: fork.id },
      data: {
        slug,
        name,
        summary,
        description,
        visibility,
        publishedAt: visibility === SkillVisibility.PUBLIC ? new Date() : fork.publishedAt,
      },
    }),
    getPrisma().skillForkFile.upsert({
      where: { forkId_path: { forkId: fork.id, path: "skill.yml" } },
      create: {
        forkId: fork.id,
        path: "skill.yml",
        content: draft.skillYml,
        sizeBytes: Buffer.byteLength(draft.skillYml),
      },
      update: {
        content: draft.skillYml,
        sizeBytes: Buffer.byteLength(draft.skillYml),
      },
    }),
    getPrisma().skillForkFile.upsert({
      where: { forkId_path: { forkId: fork.id, path: "SKILL.md" } },
      create: {
        forkId: fork.id,
        path: "SKILL.md",
        content: skillMarkdown,
        sizeBytes: Buffer.byteLength(skillMarkdown),
      },
      update: {
        content: skillMarkdown,
        sizeBytes: Buffer.byteLength(skillMarkdown),
      },
    }),
  ]);

  await persistForkValidation(fork.id, draft.files);

  revalidatePath(`/dashboard/library/${fork.id}/edit`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/library");
  revalidatePath("/skills");
  revalidatePath("/api/v1/skills");
  const profile = await getPrisma().profile.findUnique({
    where: { userId: user.id },
    select: { handle: true },
  });
  if (profile) {
    revalidatePath(`/u/${profile.handle}`);
    revalidatePath(`/u/${profile.handle}/skills/${slug}`);
  }

  return {
    ok: true,
    issues: draft.validation.issues,
  };
}

async function getRequiredUser(callbackURL = "/dashboard") {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath(callbackURL));
  }
  return user;
}

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableField(formData: FormData, key: string): string | null {
  return stringField(formData, key) || null;
}

function optionalUrl(value: string): string | null | false {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.toString();
  } catch {
    return false;
  }
}

function visibilityField(formData: FormData, key: string): SkillVisibility {
  const value = stringField(formData, key).toUpperCase();
  if (value === "PUBLIC") return SkillVisibility.PUBLIC;
  if (value === "UNLISTED") return SkillVisibility.UNLISTED;
  return SkillVisibility.PRIVATE;
}
