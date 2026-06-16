import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, GitFork, UserRound } from "lucide-react";
import { SkillVisibility } from "@prisma/client";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { getPrisma } from "@/lib/server/prisma";
import { serializeForkSummary, serializeSkillSummary } from "@/lib/server/skill-serializers";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  if (!process.env.DATABASE_URL) {
    return {
      title: `@${handle}`,
      description: `Public PapiSkill profile for @${handle}.`,
    };
  }

  const profile = await findProfile(handle);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `@${profile.handle}`,
    description: profile.bio || `Public PapiSkill skills from @${profile.handle}.`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  if (!process.env.DATABASE_URL) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto w-full max-w-5xl px-5 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">@{handle}</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Public profile pages are ready in the app. They will populate after the production database is connected.
          </p>
        </main>
      </>
    );
  }

  const profile = await findProfile(handle);
  if (!profile) notFound();

  const [skills, forks] = await Promise.all([
    getPrisma().skill.findMany({
      where: {
        ownerId: profile.userId,
        visibility: SkillVisibility.PUBLIC,
      },
      include: { owner: { include: { profile: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    getPrisma().skillFork.findMany({
      where: {
        ownerId: profile.userId,
        visibility: SkillVisibility.PUBLIC,
        archivedAt: null,
      },
      include: { owner: { include: { profile: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  ]);

  const rows = [
    ...skills.map((skill) => ({
      ...serializeSkillSummary(skill),
      href: `/skills/community/${skill.slug}`,
      reference: `community/${skill.slug}`,
      kindLabel: skill.registryKind.toLowerCase(),
    })),
    ...forks.map((fork) => ({
      ...serializeForkSummary(fork),
      href: `/u/${profile.handle}/skills/${fork.slug}`,
      reference: `${profile.handle}/${fork.slug}`,
      kindLabel: fork.visibility.toLowerCase(),
    })),
  ];

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <header className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
          <div className="grid size-20 place-items-center overflow-hidden rounded-xl border border-border bg-surface-subtle">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <UserRound className="size-8 text-slate-400" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">@{profile.handle}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">{profile.name || profile.handle}</h1>
            {profile.bio ? <p className="mt-3 max-w-2xl text-muted">{profile.bio}</p> : null}
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Published skills</h2>
            <span className="text-sm text-muted">{rows.length} visible</span>
          </div>
          {rows.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface-subtle p-8 text-sm text-muted">
              No public profile skills yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {rows.map((skill) => (
                <article key={`${skill.registryKind}/${skill.slug}`} className="rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={skill.href} className="text-lg font-semibold hover:underline">
                          {skill.name}
                        </Link>
                        <Badge variant={skill.registryKind === "profile" ? "neutral" : "blue"}>{skill.kindLabel}</Badge>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{skill.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skill.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link href={`/download/${skill.reference}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                        <Download className="size-4" aria-hidden />
                        Download
                      </Link>
                      <Link href={`/dashboard/fork?skill=${skill.reference}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                        <GitFork className="size-4" aria-hidden />
                        Copy
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

async function findProfile(handle: string) {
  return getPrisma().profile.findUnique({
    where: { handle },
  });
}
