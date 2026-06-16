import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, ExternalLink, Save } from "lucide-react";
import { SkillVisibility } from "@prisma/client";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { SkillMarkdownEditor } from "@/components/skill-markdown-editor";
import { ensureProfile } from "@/lib/server/profiles";
import { getPrisma } from "@/lib/server/prisma";
import { getSessionUser } from "@/lib/server/request-auth";
import { saveForkAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditLibrarySkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/sign-in");
  }
  const profile = await ensureProfile(user);
  const { id } = await params;
  const fork = await getPrisma().skillFork.findFirst({
    where: { id, ownerId: user.id, archivedAt: null },
    include: {
      files: { orderBy: { path: "asc" } },
      validations: { orderBy: { createdAt: "desc" } },
      sourceSkill: { select: { slug: true, name: true, registryKind: true, version: true } },
      sourceFork: {
        select: {
          slug: true,
          name: true,
          version: true,
          owner: { select: { profile: { select: { handle: true } } } },
        },
      },
    },
  });
  if (!fork) notFound();

  const markdown = fork.files.find((file) => file.path === "SKILL.md")?.content ?? "";
  const reference = `${profile.handle}/${fork.slug}`;
  const installCommand = `papiskill install ${reference}`;
  const publicHref = `/u/${profile.handle}/skills/${fork.slug}`;

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/dashboard/library" className="mb-3 inline-block text-sm font-medium text-muted hover:text-slate-950">
              Back to library
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Edit {fork.name}</h1>
            <p className="mt-2 text-muted">Save metadata, validate the package, and keep this copy private or publish it to your profile.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={installCommand} label="Copy install command" />
            <Link href={`/download/${reference}`} aria-label="Download" title="Download" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
              <Download className="size-4" aria-hidden />
            </Link>
            {fork.visibility !== SkillVisibility.PRIVATE ? (
              <Link href={publicHref} aria-label="Open profile page" title="Open profile page" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                <ExternalLink className="size-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        <form action={saveForkAction} className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <input type="hidden" name="forkId" value={fork.id} />
          <aside className="space-y-5">
            <section className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
              <Field label="Name" name="name" defaultValue={fork.name} required />
              <Field label="Slug" name="slug" defaultValue={fork.slug} required />
              <Field label="Summary" name="summary" defaultValue={fork.summary} required />
              <label className="block text-sm font-medium">
                Description
                <textarea name="description" defaultValue={fork.description} rows={5} className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm leading-6 outline-none focus:border-accent" />
              </label>
              <label className="block text-sm font-medium">
                Visibility
                <select name="visibility" defaultValue={fork.visibility} className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent">
                  <option value="PRIVATE">Private</option>
                  <option value="UNLISTED">Unlisted</option>
                  <option value="PUBLIC">Public profile skill</option>
                </select>
              </label>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                <Save className="size-4" aria-hidden />
                Save and validate
              </button>
            </section>

            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Reference</h2>
              <div className="mt-3 rounded-md bg-slate-950 px-3 py-2 font-mono text-xs text-white">
                <span className="break-all">{installCommand}</span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <Meta label="Profile ref" value={reference} />
                <Meta label="Source" value={sourceLabel(fork)} />
                <Meta label="Source version" value={fork.sourceVersion ?? fork.sourceSkill?.version ?? fork.sourceFork?.version ?? "unknown"} />
                <Meta label="Last validated" value={fork.lastValidatedAt ? formatDate(fork.lastValidatedAt) : "never"} />
              </dl>
            </section>

            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Validation</h2>
              {fork.validations.length === 0 ? (
                <div className="mt-3">
                  <Badge variant="green">No validation notes</Badge>
                </div>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {fork.validations.map((issue) => (
                    <li key={issue.id} className="rounded-md border border-border bg-surface-subtle p-3">
                      <p className="font-semibold">{issue.level} {issue.code}</p>
                      <p className="mt-1 text-muted">{issue.message}</p>
                      {issue.path ? <p className="mt-1 font-mono text-xs text-slate-500">{issue.path}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>

          <SkillMarkdownEditor name="skillMarkdown" defaultValue={markdown} />
        </form>
      </main>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="break-all text-right font-medium">{value}</dd>
    </div>
  );
}

function sourceLabel(item: {
  sourceReference: string | null;
  sourceSkill: { slug: string; registryKind: string } | null;
  sourceFork: { slug: string; owner: { profile: { handle: string } | null } } | null;
}) {
  if (item.sourceReference) return item.sourceReference;
  if (item.sourceSkill) return `${item.sourceSkill.registryKind.toLowerCase()}/${item.sourceSkill.slug}`;
  if (item.sourceFork?.owner.profile) return `${item.sourceFork.owner.profile.handle}/${item.sourceFork.slug}`;
  return "manual";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}
