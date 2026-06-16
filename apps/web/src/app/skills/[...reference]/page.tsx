import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Download, GitFork, ShieldCheck, Terminal } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { getSkillByReference } from "@/lib/server/skills";

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
  const skill = await getSkillByReference(requestedReference);
  if (!skill) notFound();
  const referenceId = skillReference(skill);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <Link href="/skills" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-slate-950">
          <ArrowLeft className="size-4" aria-hidden />
          Back to skills
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <article className="min-w-0">
              <div className="border-b border-border pb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant={skill.registryKind === "global" ? "blue" : "neutral"}>
                    {skill.registryKind === "global" ? "Global registry" : "Profile skill"}
                  </Badge>
                  <Badge variant="green">Validated</Badge>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight">{skill.name}</h1>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">{skill.summary}</p>
              </div>

              <section className="prose prose-slate mt-8 max-w-none prose-headings:tracking-tight prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-slate-50 prose-pre:text-slate-800">
                <ReactMarkdown>{skill.markdown}</ReactMarkdown>
              </section>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Install</h2>
                <code className="mt-3 flex items-center gap-2 rounded-md bg-slate-950 px-3 py-3 font-mono text-xs text-white">
                  <Terminal className="size-4 shrink-0" aria-hidden />
                  <span className="break-all">{`papiskill install ${referenceId}`}</span>
                </code>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`/download/${referenceId}`} prefetch={false} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50">
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
                  <Meta label="Visibility" value={skill.visibility} />
                  <Meta label="Categories" value={skill.categories.join(", ")} />
                  <Meta label="Tags" value={skill.tags.join(", ")} />
                </dl>
              </div>

              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="size-4" aria-hidden />
                  Trust note
                </div>
                <p className="mt-2 leading-6">
                  PapiSkill validates package structure and highlights risky content. Review any scripts or network behavior before installing third-party skills.
                </p>
              </div>
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
