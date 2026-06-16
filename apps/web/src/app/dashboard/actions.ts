"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, SkillVisibility, ValidationLevel } from "@prisma/client";
import { validateSkillPackage } from "@papiskill/skill-core";
import { getSessionUser } from "@/lib/server/request-auth";
import { ensureProfile } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { createApiToken } from "@/lib/server/tokens";

export interface TokenActionState {
  token?: string;
  error?: string;
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

export async function forkSkillAction(formData: FormData) {
  const user = await getRequiredUser();
  await ensureProfile(user);
  const reference = stringField(formData, "reference");
  const visibility = visibilityField(formData, "visibility");
  const slug = reference.split("/").filter(Boolean).at(-1);
  if (!slug) {
    redirect("/skills");
  }

  const sourceSkill = await getPrisma().skill.findFirst({
    where: { slug },
    include: { files: true },
  });
  if (!sourceSkill) {
    redirect("/skills");
  }

  const fork = await getPrisma().skillFork.create({
    data: {
      ownerId: user.id,
      sourceSkillId: sourceSkill.id,
      slug: await uniqueForkSlug(user.id, sourceSkill.slug),
      name: sourceSkill.name,
      summary: sourceSkill.summary,
      description: sourceSkill.description,
      visibility,
      version: sourceSkill.version,
      license: sourceSkill.license,
      categories: sourceSkill.categories,
      tags: sourceSkill.tags,
      compatibleWith: sourceSkill.compatibleWith,
      installTargets: jsonObject(sourceSkill.installTargets),
      files: {
        create: sourceSkill.files.map((file) => ({
          path: file.path,
          content: file.content,
          sizeBytes: file.sizeBytes,
        })),
      },
    },
  });

  redirect(`/dashboard/skills/${fork.id}/edit`);
}

export async function saveForkAction(formData: FormData) {
  const user = await getRequiredUser();
  const forkId = stringField(formData, "forkId");
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

  const skillYml = buildSkillYml({
    id: fork.slug,
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
  });

  await getPrisma().$transaction([
    getPrisma().skillFork.update({
      where: { id: fork.id },
      data: {
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
        content: skillYml,
        sizeBytes: Buffer.byteLength(skillYml),
      },
      update: {
        content: skillYml,
        sizeBytes: Buffer.byteLength(skillYml),
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
    getPrisma().skillForkValidation.deleteMany({ where: { forkId: fork.id } }),
  ]);

  const files = await getPrisma().skillForkFile.findMany({
    where: { forkId: fork.id },
    orderBy: { path: "asc" },
  });
  const validation = validateSkillPackage(files.map((file) => ({
    path: file.path,
    content: file.content,
  })));

  await getPrisma().skillForkValidation.createMany({
    data: validation.issues.map((issue) => ({
      forkId: fork.id,
      level: issue.level === "error" ? ValidationLevel.ERROR : ValidationLevel.WARNING,
      code: issue.code,
      message: issue.message,
      path: issue.path,
    })),
  });

  revalidatePath(`/dashboard/skills/${fork.id}/edit`);
  revalidatePath("/dashboard");
}

function jsonObject(value: Prisma.JsonValue): Prisma.InputJsonValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Prisma.InputJsonObject;
}

function recordFromJson(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

async function getRequiredUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  return user;
}

async function uniqueForkSlug(userId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  for (let index = 1; index < 50; index += 1) {
    const existing = await getPrisma().skillFork.findUnique({
      where: { ownerId_slug: { ownerId: userId, slug } },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${index + 1}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function visibilityField(formData: FormData, key: string): SkillVisibility {
  const value = stringField(formData, key).toUpperCase();
  if (value === "PUBLIC") return SkillVisibility.PUBLIC;
  if (value === "UNLISTED") return SkillVisibility.UNLISTED;
  return SkillVisibility.PRIVATE;
}

function buildSkillYml(input: {
  id: string;
  name: string;
  summary: string;
  description: string;
  visibility: string;
  version: string;
  license: string;
  categories: string[];
  tags: string[];
  compatibleWith: string[];
  installTargets: Record<string, string>;
}) {
  const lines = [
    `id: ${input.id}`,
    `name: ${JSON.stringify(input.name)}`,
    `summary: ${JSON.stringify(input.summary)}`,
    `description: ${JSON.stringify(input.description)}`,
    `version: ${input.version}`,
    `license: ${input.license}`,
    `visibility: ${input.visibility}`,
    "categories:",
    ...input.categories.map((item) => `  - ${item}`),
    "tags:",
    ...input.tags.map((item) => `  - ${item}`),
    "compatible_with:",
    ...input.compatibleWith.map((item) => `  - ${item}`),
    "install_targets:",
    ...Object.entries(input.installTargets).map(([key, value]) => `  ${key}: ${value}`),
  ];
  return `${lines.join("\n")}\n`;
}
