import { z } from "zod";

export const agentTargetSchema = z.enum([
  "codex",
  "claude-code",
  "cursor",
  "generic-agent",
  "other",
]);

export type AgentTarget = z.infer<typeof agentTargetSchema>;

export const visibilitySchema = z.enum(["public", "private", "unlisted"]);

export const maintainerSchema = z.object({
  github: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
}).refine((value) => value.github || value.name || value.url, {
  message: "A maintainer must include github, name, or url.",
});

export const skillManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/, {
    message: "id must be a lowercase slug between 3 and 64 characters.",
  }),
  name: z.string().min(2).max(80),
  summary: z.string().min(10).max(180),
  description: z.string().min(20).max(2000),
  version: z.string().min(1).max(32).default("0.1.0"),
  license: z.string().min(1).max(64).default("MIT"),
  visibility: visibilitySchema.default("public"),
  categories: z.array(z.string().min(1).max(48)).min(1).max(8),
  tags: z.array(z.string().min(1).max(48)).default([]),
  compatible_with: z.array(agentTargetSchema).min(1),
  install_targets: z.partialRecord(agentTargetSchema, z.string().min(1)).default({}),
  homepage: z.string().url().optional(),
  source_url: z.string().url().optional(),
  maintainers: z.array(maintainerSchema).default([]),
});

export type SkillManifest = z.infer<typeof skillManifestSchema>;

export const packageFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export type PackageFile = z.infer<typeof packageFileSchema>;

export interface SkillPackage {
  manifest: SkillManifest;
  skillMarkdown: string;
  files: PackageFile[];
}
