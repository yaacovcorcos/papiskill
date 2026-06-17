import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, GitFork, Terminal } from "lucide-react";
import { SkillVisibility } from "@prisma/client";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { SkillMarkdown } from "@/components/skill-markdown";
import { SkillEngagementPanel } from "@/components/skill-engagement-panel";
import { SkillSourceBlock } from "@/components/skill-source-block";
import { SkillValidationBadges, SkillValidationPanel } from "@/components/skill-validation";
import { hasDatabaseUrl } from "@/lib/server/db-env";
import { getSessionUser } from "@/lib/server/request-auth";
import { getPrisma } from "@/lib/server/prisma";
import { getSkillEngagement } from "@/lib/server/engagement";
import { getSkillByReference } from "@/lib/server/skills";
import { compatibilityLabels } from "@/app/skills/skill-filters";

export const dynamic = "force-dynamic";

type Params = Promise<{ handle: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle, slug } = await params;
  if (!hasDatabaseUrl()) {
    return {
      title: `${slug} by @${handle}`,
      description: `PapiSkill profile skill ${slug} by @${handle}.`,
    };
  }
  const skill = await getSkillByReference(`${handle}/${slug}`);
  if (!skill) return { title: "Skill not found" };
  return {
    title: `${skill.name} by @${handle}`,
    description: skill.summary,
  };
}

export default async function UserSkillPage({ params }: { params: Params }) {
  const { handle, slug } = await params;
  if (!hasDatabaseUrl()) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl px-5 py-10">
          <Link href={`/u/${handle}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-slate-950">
            <ArrowLeft className="size-4" aria-hidden />
            Back to @{handle}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{slug}</h1>
          <p className="mt-3 text-muted">
            Profile skill pages are enabled. Content will appear after the production database is connected.
          </p>
        </main>
      </>
    );
  }

  const viewer = await getSessionUser().catch(() => null);
  const [profile, skill] = await Promise.all([
    getPrisma().profile.findUnique({ where: { handle } }),
    getSkillByReference(`${handle}/${slug}`, viewer ? { id: viewer.id } : null),
  ]);
  if (!profile || !skill) notFound();

  const isOwner = viewer?.id === profile.userId;
  if (skill.visibility === SkillVisibility.PRIVATE.toLowerCase() && !isOwner) {
    notFound();
  }

  const reference = `${handle}/${slug}`;
  const engagement = await getSkillEngagement(reference, viewer ? { id: viewer.id } : null);
  const showEngagement = skill.visibility === SkillVisibility.PUBLIC.toLowerCase();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        <Link href={`/u/${handle}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-slate-950">
          <ArrowLeft className="size-4" aria-hidden />
          Back to @{handle}
        </Link>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <article className="min-w-0">
            <div className="border-b border-border pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>{skill.visibility}</Badge>
                <SkillValidationBadges issues={skill.validationIssues} />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{skill.name}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{skill.summary}</p>
            </div>

            <SkillMarkdown markdown={skill.markdown ?? ""} className="mt-8" />
            <SkillSourceBlock markdown={skill.markdown ?? ""} />
            {showEngagement ? (
              <SkillEngagementPanel engagement={engagement} viewerSignedIn={Boolean(viewer)} />
            ) : null}
          </article>

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Install</h2>
              <code className="mt-3 flex items-center gap-2 rounded-md bg-slate-950 px-3 py-3 font-mono text-xs text-white">
                <Terminal className="size-4 shrink-0" aria-hidden />
                <span className="break-all">papiskill install {reference}</span>
              </code>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/download/${reference}?format=zip`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  <Download className="size-4" aria-hidden />
                  Download
                </Link>
                <Link href={`/dashboard/fork?skill=${reference}`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <GitFork className="size-4" aria-hidden />
                  Copy to library
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-white p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Metadata</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Meta label="Author" value={`@${handle}`} />
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

            <SkillValidationPanel
              issues={skill.validationIssues}
              note="Profile skills belong to their authors. Review validation warnings and full instructions before installing or adapting them."
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
