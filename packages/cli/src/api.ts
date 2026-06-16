import { z } from "zod";
import type { CliConfig } from "./config.js";

const apiSkillSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  summary: z.string(),
  author: z.string().nullable().optional(),
  registryKind: z.string(),
  visibility: z.string(),
  compatibleWith: z.array(z.string()),
  tags: z.array(z.string()),
  validationIssues: z.array(z.object({
    level: z.enum(["error", "warning"]),
    code: z.string(),
    message: z.string(),
    path: z.string().nullable().optional(),
  })).default([]),
});

const apiSkillDetailSchema = apiSkillSummarySchema.extend({
  description: z.string(),
  markdown: z.string(),
  files: z.array(z.object({ path: z.string(), content: z.string() })),
  installTargets: z.record(z.string(), z.string()),
});

export type ApiSkillSummary = z.infer<typeof apiSkillSummarySchema>;
export type ApiSkillDetail = z.infer<typeof apiSkillDetailSchema>;

export function installReferenceForSkill(skill: ApiSkillSummary): string {
  if (skill.registryKind === "global") return `official/${skill.slug}`;
  if (skill.registryKind === "community") return `community/${skill.slug}`;
  if (skill.registryKind === "profile" && skill.author) return `${skill.author}/${skill.slug}`;
  return `${skill.registryKind}/${skill.slug}`;
}

export async function searchSkills(config: CliConfig, query: string): Promise<ApiSkillSummary[]> {
  const url = new URL("/api/v1/skills", config.apiUrl);
  if (query) {
    url.searchParams.set("q", query);
  }
  const data = await requestJson(config, url);
  return z.object({ skills: z.array(apiSkillSummarySchema) }).parse(data).skills;
}

export async function getSkill(config: CliConfig, reference: string): Promise<ApiSkillDetail> {
  const url = skillDetailUrl(config.apiUrl, reference);
  const data = await requestJson(config, url);
  return apiSkillDetailSchema.parse(data);
}

export function skillDetailUrl(apiUrl: string, reference: string): URL {
  const encodedReference = reference
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return new URL(`/api/v1/skills/${encodedReference}`, apiUrl);
}

export async function getMe(config: CliConfig): Promise<{ handle: string; name: string | null }> {
  const url = new URL("/api/v1/me", config.apiUrl);
  const data = await requestJson(config, url);
  return z.object({
    handle: z.string(),
    name: z.string().nullable(),
  }).parse(data);
}

async function requestJson(config: CliConfig, url: URL): Promise<unknown> {
  const headers: Record<string, string> = {
    accept: "application/json",
    "user-agent": "papiskill-cli/0.1.0",
  };
  if (config.token) {
    headers.authorization = `Bearer ${config.token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PapiSkill API ${response.status}: ${body || response.statusText}`);
  }

  return response.json() as Promise<unknown>;
}
