import { parseSkillPackage } from "./package-files.js";
import type { PackageFile, SkillPackage } from "./schema.js";

export type ValidationLevel = "error" | "warning";

export interface SkillValidationIssue {
  level: ValidationLevel;
  code: string;
  message: string;
  path?: string;
}

export interface SkillValidationResult {
  ok: boolean;
  package?: SkillPackage;
  issues: SkillValidationIssue[];
}

const riskyPatterns: Array<{ code: string; pattern: RegExp; message: string }> = [
  {
    code: "mentions-shell",
    pattern: /\b(sudo|chmod|curl|wget|rm\s+-rf|shell|terminal|bash|zsh)\b/i,
    message: "Skill mentions shell or terminal operations. Review before installing.",
  },
  {
    code: "mentions-network",
    pattern: /\b(fetch|http:\/\/|https:\/\/|api key|token|webhook|network)\b/i,
    message: "Skill mentions network access, URLs, API keys, tokens, or webhooks.",
  },
  {
    code: "mentions-secrets",
    pattern: /\b(secret|password|credential|private key|ssh key)\b/i,
    message: "Skill mentions secrets or credentials. Confirm it does not request sensitive data unnecessarily.",
  },
];

export function validateSkillPackage(files: PackageFile[]): SkillValidationResult {
  const issues: SkillValidationIssue[] = [];
  let parsed: SkillPackage;

  try {
    parsed = parseSkillPackage(files);
  } catch (error) {
    return {
      ok: false,
      issues: [{
        level: "error",
        code: "invalid-package",
        message: error instanceof Error ? error.message : "Invalid skill package.",
      }],
    };
  }

  if (parsed.skillMarkdown.trim().length < 80) {
    issues.push({
      level: "warning",
      code: "short-skill",
      message: "SKILL.md is very short. Add enough operational detail for another user to trust it.",
      path: "SKILL.md",
    });
  }

  if (parsed.skillMarkdown.length > 40_000) {
    issues.push({
      level: "warning",
      code: "large-skill",
      message: "SKILL.md is large. Consider splitting examples or references into separate files.",
      path: "SKILL.md",
    });
  }

  const hasScripts = parsed.files.some((file) => file.path.startsWith("scripts/"));
  if (hasScripts) {
    issues.push({
      level: "warning",
      code: "contains-scripts",
      message: "Package contains scripts. Users should inspect them before installing.",
      path: "scripts",
    });
  }

  for (const risky of riskyPatterns) {
    if (risky.pattern.test(parsed.skillMarkdown)) {
      issues.push({
        level: "warning",
        code: risky.code,
        message: risky.message,
        path: "SKILL.md",
      });
    }
  }

  const hasErrors = issues.some((issue) => issue.level === "error");
  return {
    ok: !hasErrors,
    package: parsed,
    issues,
  };
}
