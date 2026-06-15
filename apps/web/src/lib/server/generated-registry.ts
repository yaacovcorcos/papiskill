import type { CatalogSkill } from "./catalog";

export const generatedRegistry: CatalogSkill[] = [
  {
    id: "code-review",
    slug: "code-review",
    name: "Code Review",
    summary: "Review code changes for bugs, regressions, missing tests, and risky assumptions.",
    description: "A portable code-review skill for AI agents. It focuses review output on concrete findings, file references, severity, test gaps, and residual risk.",
    registryKind: "global",
    visibility: "public",
    author: "yaacovcorcos",
    compatibleWith: ["codex", "claude-code", "cursor", "generic-agent"],
    tags: ["review", "testing", "reliability"],
    categories: ["coding"],
    installCommand: "papiskill install official/code-review",
    markdown: `# Code Review

Use this skill when asked to review a code change, pull request, patch, or branch.

## Review stance

Lead with findings. Prioritize bugs, behavioral regressions, security issues, data loss risks, missing authorization, concurrency problems, migration hazards, and missing tests.

Do not summarize the change before findings unless there are no findings.

## Required output shape

For each finding, include:

- severity: \`P0\`, \`P1\`, \`P2\`, or \`P3\`
- exact file path and line when available
- concrete problem
- why it matters
- smallest safe fix

If there are no findings, say that clearly and name any test gaps or residual risk.
`,
  },
  {
    id: "skill-authoring",
    slug: "skill-authoring",
    name: "Skill Authoring",
    summary: "Draft portable SKILL.md packages with clear scope, metadata, examples, and safety boundaries.",
    description: "A skill for creating high-quality agent skills that are portable across tools, easy to inspect, and safe to install.",
    registryKind: "global",
    visibility: "public",
    author: "yaacovcorcos",
    compatibleWith: ["codex", "claude-code", "cursor", "generic-agent"],
    tags: ["skills", "authoring", "documentation"],
    categories: ["documentation"],
    installCommand: "papiskill install official/skill-authoring",
    markdown: `# Skill Authoring

Use this skill to create or improve a portable \`SKILL.md\` package.

## Goals

A good skill is:

- specific enough to trigger at the right time
- portable across agent setups unless it declares a specific runtime
- honest about required tools and permissions
- clear about inputs, outputs, and safety boundaries
- short enough to inspect
- detailed enough to reproduce the workflow

## Package checklist

Every package should include \`skill.yml\`, \`SKILL.md\`, examples when needed, and scripts only when necessary.
`,
  },
];
