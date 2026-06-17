import type {
  Prisma,
  Skill,
  SkillFile,
  SkillFork,
  SkillForkFile,
  SkillForkValidation,
  SkillValidation,
} from "@prisma/client";

export function serializeSkillSummary(skill: Skill & { owner?: { profile: { handle: string } | null } | null }) {
  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    summary: skill.summary,
    author: skill.authorName ?? skill.owner?.profile?.handle ?? null,
    registryKind: skill.registryKind.toLowerCase(),
    visibility: skill.visibility.toLowerCase(),
    version: skill.version,
    license: skill.license,
    compatibleWith: skill.compatibleWith,
    categories: skill.categories,
    tags: skill.tags,
  };
}

export function serializeForkSummary(fork: SkillFork & { owner: { profile: { handle: string } | null } }) {
  return {
    id: fork.id,
    slug: fork.slug,
    name: fork.name,
    summary: fork.summary,
    author: fork.owner.profile?.handle ?? null,
    registryKind: "profile",
    visibility: fork.visibility.toLowerCase(),
    version: fork.version,
    license: fork.license,
    compatibleWith: fork.compatibleWith,
    categories: fork.categories,
    tags: fork.tags,
  };
}

export function serializeSkillDetail(skill: Skill & {
  files: SkillFile[];
  validations?: SkillValidation[];
  owner?: { profile: { handle: string } | null } | null;
}) {
  const markdown = skill.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  return {
    ...serializeSkillSummary(skill),
    description: skill.description,
    markdown,
    files: skill.files.map((file) => ({ path: file.path, content: file.content })),
    installTargets: normalizeJsonRecord(skill.installTargets),
    validationIssues: serializeValidationIssues(skill.validations),
  };
}

export function serializeForkDetail(fork: SkillFork & {
  files: SkillForkFile[];
  validations?: SkillForkValidation[];
  owner: { profile: { handle: string } | null };
}) {
  const markdown = fork.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  return {
    ...serializeForkSummary(fork),
    description: fork.description,
    markdown,
    files: fork.files.map((file) => ({ path: file.path, content: file.content })),
    installTargets: normalizeJsonRecord(fork.installTargets),
    validationIssues: serializeValidationIssues(fork.validations),
  };
}

function serializeValidationIssues(validations: Array<SkillValidation | SkillForkValidation> = []) {
  return validations.map((issue) => ({
    level: issue.level.toLowerCase() as "error" | "warning",
    code: issue.code,
    message: issue.message,
    path: issue.path ?? null,
  }));
}

function normalizeJsonRecord(value: Prisma.JsonValue): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}
