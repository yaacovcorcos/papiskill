import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, GitFork, Terminal } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { RegistrySourceCard } from "@/components/registry-source-card";
import { SkillMarkdown } from "@/components/skill-markdown";
import { SkillEngagementPanel } from "@/components/skill-engagement-panel";
import { SkillSourceBlock } from "@/components/skill-source-block";
import { SkillValidationBadges, SkillValidationPanel } from "@/components/skill-validation";
import { getFileRegistrySkill } from "@/lib/server/catalog";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { getSkillEngagement } from "@/lib/server/engagement";
import { isPublicRegistryReference } from "@/lib/server/references";
import { getSessionUser } from "@/lib/server/request-auth";
import { getSkillByReference } from "@/lib/server/skills";
import { compatibilityLabels } from "../skill-filters";

export const revalidate = 60;

function skillReference(skill: { registryKind: string; slug: string; author: string | null }) {
  if (skill.registryKind === "profile" && skill.author) {
    return `${skill.author}/${skill.slug}`;
  }
  if (skill.registryKind === "community") {
    return `community/${skill.slug}`;
  }
  return `official/${skill.slug}`;
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ reference: string[] }>;
}) {
  const { reference } = await params;
  const requestedReference = reference.join("/");
  const registrySkill = isPublicRegistryReference(requestedReference)
    ? await getFileRegistrySkill(requestedReference)
    : null;
  const skill = registrySkill ?? await getSkillByReference(requestedReference);
  if (!skill) notFound();
  const referenceId = skillReference(skill);
  const viewer = hasDatabaseUrl() ? await getSessionUser().catch(() => null) : null;
  const engagement = await getSkillEngagement(referenceId, viewer ? { id: viewer.id } : null);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <Link href="/skills" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-slate-950">
          <ArrowLeft className="size-4" aria-hidden />
          Back to skills
        </Link>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <article className="min-w-0">
              <div className="border-b border-border pb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant={skill.registryKind === "global" ? "blue" : "neutral"}>
                    {skill.registryKind === "global" ? "Global registry" : "Profile skill"}
                  </Badge>
                  <SkillValidationBadges issues={skill.validationIssues} />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{skill.name}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{skill.summary}</p>
              </div>

              <SkillMarkdown markdown={skill.markdown ?? ""} className="mt-8" />
              <SkillSourceBlock markdown={skill.markdown ?? ""} />
              <SkillEngagementPanel engagement={engagement} viewerSignedIn={Boolean(viewer)} />
            </article>

            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Install</h2>
                <div className="mt-3 flex min-w-0 items-center rounded-md border border-border bg-slate-50">
                  <code className="inline-flex min-w-0 items-center gap-2 px-3 py-2 font-mono text-xs text-slate-800">
                    <Terminal className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{`papiskill install ${referenceId}`}</span>
                  </code>
                  <CopyButton
                    value={`papiskill install ${referenceId}`}
                    label={`Copy install command for ${skill.name}`}
                    className="inline-grid size-9 shrink-0 place-items-center border-l border-border text-slate-500 hover:bg-white hover:text-slate-950"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`/download/${referenceId}?format=zip`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                    <Download className="size-4" aria-hidden />
                    Download
                  </Link>
                  <Link href={`/dashboard/fork?skill=${referenceId}`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    <GitFork className="size-4" aria-hidden />
                    Copy to library
                  </Link>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-white p-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Metadata</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <Meta label="Author" value={skill.author ?? "PapiSkill"} />
                  <Meta label="Version" value={skill.version} />
                  <Meta label="License" value={skill.license} />
                  <Meta label="Visibility" value={skill.visibility} />
                  <Meta label="Categories" value={skill.categories.join(", ")} />
                  <Meta label="Tags" value={skill.tags.join(", ")} />
                </dl>
                <div className="mt-4 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Compatibility
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skill.compatibleWith.map((target) => (
                      <Badge key={target}>
                        {compatibilityLabels[target] ?? target}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <RegistrySourceCard registryKind={skill.registryKind} slug={skill.slug} />

              <SkillValidationPanel
                issues={skill.validationIssues}
                note="PapiSkill validates package structure and highlights risky content before install. Review warnings before installing third-party skills."
              />
            </aside>
        </div>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium capitalize">{value || "None"}</dd>
    </div>
  );
}
