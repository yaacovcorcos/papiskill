import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, ExternalLink, Library, Pencil, Plus, Terminal } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { copyInstallCommandLabel } from "@/components/action-labels";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { signInPath } from "@/lib/auth-callback";
import { canonicalRegistryReference } from "@/lib/references";
import { ensureProfile } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { getSessionUser } from "@/lib/server/request-auth";
import { createBlankSkillAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath("/dashboard/library"));
  }
  const profile = await ensureProfile(user);
  const items = await getPrisma().skillFork.findMany({
    where: { ownerId: user.id, archivedAt: null },
    include: {
      validations: true,
      sourceSkill: { select: { slug: true, name: true, registryKind: true } },
      sourceFork: {
        select: {
          slug: true,
          name: true,
          owner: { select: { profile: { select: { handle: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-sm font-medium text-muted">
              <Library className="size-4" aria-hidden />
              Library
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Your skill library</h1>
            <p className="mt-2 max-w-2xl text-muted">Private, unlisted, and public profile-owned copies of skills you can edit or install.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <form action={createBlankSkillAction}>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <Plus className="size-4" aria-hidden />
                New skill
              </button>
            </form>
            <Link href="/skills" className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              Copy a skill
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <section className="rounded-lg border border-border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold">No saved skills yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Start a new private skill draft, or open any official, community, or public profile skill and copy it into your library.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <form action={createBlankSkillAction}>
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <Plus className="size-4" aria-hidden />
                  New skill
                </button>
              </form>
              <Link href="/skills" className="inline-flex rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                Browse skills
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => {
              const reference = `${profile.handle}/${item.slug}`;
              const installCommand = `papiskill install ${reference}`;
              const publicHref = `/u/${profile.handle}/skills/${item.slug}`;

              return (
                <article key={item.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/dashboard/library/${item.id}/edit`} className="text-lg font-semibold hover:underline">
                          {item.name}
                        </Link>
                        <Badge variant={visibilityVariant(item.visibility)}>{item.visibility.toLowerCase()}</Badge>
                        {item.validations.length === 0 ? (
                          <Badge variant="green">valid</Badge>
                        ) : (
                          <Badge variant="amber">{item.validations.length} notes</Badge>
                        )}
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{item.summary}</p>
                      <p className="mt-2 text-xs text-muted">
                        {reference} · source {sourceLabel(item)} · updated {formatDate(item.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <CopyButton value={installCommand} label={copyInstallCommandLabel(item.name)} />
                      <Link href={`/download/${reference}?format=zip`} aria-label={`Download ${item.name}`} title="Download package" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                        <Download className="size-4" aria-hidden />
                      </Link>
                      {item.visibility !== "PRIVATE" ? (
                        <Link href={publicHref} aria-label={`Open ${item.name}`} title="Open profile page" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                          <ExternalLink className="size-4" aria-hidden />
                        </Link>
                      ) : null}
                      <Link href={`/dashboard/library/${item.id}/edit`} aria-label={`Edit ${item.name}`} title="Edit" className="inline-grid size-10 place-items-center rounded-md bg-slate-950 text-white hover:bg-slate-800">
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 font-mono text-xs text-white">
                    <Terminal className="size-4 shrink-0" aria-hidden />
                    <span className="break-all">{installCommand}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function sourceLabel(item: {
  sourceReference: string | null;
  sourceSkill: { slug: string; registryKind: string; name: string } | null;
  sourceFork: { slug: string; name: string; owner: { profile: { handle: string } | null } } | null;
}) {
  if (item.sourceReference) return item.sourceReference;
  if (item.sourceSkill) return canonicalRegistryReference(item.sourceSkill.registryKind.toLowerCase(), item.sourceSkill.slug);
  if (item.sourceFork?.owner.profile) return `${item.sourceFork.owner.profile.handle}/${item.sourceFork.slug}`;
  return "manual";
}

function visibilityVariant(visibility: string): "neutral" | "blue" | "green" | "amber" {
  if (visibility === "PUBLIC") return "green";
  if (visibility === "UNLISTED") return "blue";
  return "neutral";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}
