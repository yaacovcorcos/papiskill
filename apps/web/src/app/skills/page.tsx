import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Download, Eye, GitFork, Search, ShieldCheck, Star, Terminal } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { getCatalogSkills } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

const compatibilityLabels: Record<string, string> = {
  codex: "Codex",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  "generic-agent": "Generic",
};

function skillReference(skill: { registryKind: string; slug: string; author: string | null }) {
  if (skill.registryKind === "profile" && skill.author) {
    return `${skill.author}/${skill.slug}`;
  }
  return `official/${skill.slug}`;
}

function skillHref(skill: { registryKind: string; slug: string; author: string | null }) {
  if (skill.registryKind === "profile" && skill.author) {
    return `/u/${skill.author}/skills/${skill.slug}`;
  }
  return `/skills/official/${skill.slug}`;
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const skills = await getCatalogSkills(q);
  const selected = skills[0];

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_430px]">
        <aside className="hidden border-r border-border bg-surface-subtle px-5 py-6 lg:block">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Filters</h2>
            <Link href="/skills" className="text-xs font-medium text-slate-500 hover:text-slate-950">Clear</Link>
          </div>
          <FilterGroup title="Categories" items={[
            ["coding", "Coding", "2"],
            ["documentation", "Documentation", "1"],
            ["security", "Security", "0"],
            ["productivity", "Productivity", "0"],
          ]} />
          <FilterGroup title="Compatibility" items={[
            ["codex", "Codex", "2"],
            ["claude", "Claude Code", "2"],
            ["cursor", "Cursor", "2"],
            ["generic", "Generic agent", "2"],
          ]} />
          <FilterGroup title="Status" items={[
            ["global", "Global curated", String(skills.filter((skill) => skill.registryKind === "global").length)],
            ["profile", "Profile skills", String(skills.filter((skill) => skill.registryKind === "profile").length)],
          ]} />
        </aside>

        <section className="min-w-0 border-r border-border px-5 py-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
              <p className="mt-1 text-sm text-muted">
                Discover, install, fork, and improve portable agent skills.
              </p>
            </div>
            <Link
              href="/docs/authoring"
              className="inline-flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Publish a skill
            </Link>
          </div>

          <form className="mb-5">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search skills, authors, tags..."
                className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-accent"
              />
            </label>
          </form>

          <div className="mb-3 flex items-center justify-between text-sm text-muted">
            <span>{skills.length} skills</span>
            <span>Sort: curated first</span>
          </div>

          <div className="space-y-3">
            {skills.map((skill, index) => {
              const href = skillHref(skill);
              const reference = skillReference(skill);
              return (
              <article
                key={`${skill.registryKind}/${skill.slug}`}
                className={`rounded-lg border bg-white p-4 shadow-sm transition hover:border-slate-300 ${index === 0 ? "border-accent ring-1 ring-accent" : "border-border"}`}
              >
                <Link href={href} className="group flex gap-4 rounded-md outline-none focus-visible:ring-4 focus-visible:ring-accent/20">
                  <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-slate-950 font-mono text-lg font-semibold text-white">
                    {skill.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold group-hover:underline">{skill.name}</h2>
                      <Badge variant={skill.registryKind === "global" ? "blue" : "neutral"}>
                        {skill.registryKind === "global" ? "Global" : "Profile"}
                      </Badge>
                      <Badge variant="green">Validated</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">by {skill.author ?? "PapiSkill"}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">{skill.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skill.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 hidden size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 sm:block" aria-hidden />
                </Link>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center rounded-md border border-border bg-slate-50">
                    <code className="inline-flex min-w-0 items-center gap-2 px-3 py-2 font-mono text-xs text-slate-800">
                      <Terminal className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{`papiskill install ${reference}`}</span>
                    </code>
                    <CopyButton
                      value={`papiskill install ${reference}`}
                      label={`Copy install command for ${skill.name}`}
                      className="inline-grid size-9 shrink-0 place-items-center border-l border-border text-slate-500 hover:bg-white hover:text-slate-950"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={href} aria-label={`View ${skill.name}`} title="View" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                      <Eye className="size-4" aria-hidden />
                    </Link>
                    <Link href={`/download/${reference}`} aria-label={`Download ${skill.name}`} title="Download" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                      <Download className="size-4" aria-hidden />
                    </Link>
                    <Link href={`/dashboard/fork?skill=${reference}`} aria-label={`Fork ${skill.name}`} title="Fork" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                      <GitFork className="size-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            );})}
          </div>
        </section>

        <aside className="hidden bg-white px-6 py-6 xl:block">
          {selected ? (
            <div className="sticky top-24">
              <div className="flex items-start gap-4">
                <div className="grid size-16 place-items-center rounded-lg bg-slate-950 font-mono text-xl font-semibold text-white">
                  {selected.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">{selected.name}</h2>
                    <Badge variant="green">Verified</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">by {selected.author ?? "PapiSkill"}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-700">{selected.description}</p>
              <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
                <DetailRow label="Status" value="Curator-published" icon={<ShieldCheck className="size-4 text-emerald-600" />} />
                <DetailRow label="Safety" value="Review warnings before install" icon={<ShieldCheck className="size-4 text-emerald-600" />} />
                <DetailRow label="License" value="MIT" />
                <DetailRow label="Stars" value="Ready for community signals" icon={<Star className="size-4 text-slate-500" />} />
              </dl>
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold">Compatibility</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.compatibleWith.map((target) => (
                    <Badge key={target}>{compatibilityLabels[target] ?? target}</Badge>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">SKILL.md excerpt</h3>
                  <Link href={skillHref(selected)} className="text-sm font-medium text-accent hover:underline">Full view</Link>
                </div>
                <pre className="max-h-[360px] overflow-hidden rounded-lg border border-border bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800">
                  {selected.markdown.slice(0, 900)}
                </pre>
              </div>
            </div>
          ) : null}
        </aside>
      </main>
    </>
  );
}

function FilterGroup({ title, items }: { title: string; items: Array<[string, string, string]> }) {
  return (
    <div className="mb-7">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-1">
        {items.map(([id, label, count]) => (
          <div key={id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white">
            <span>{label}</span>
            <span className="text-xs text-muted">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-slate-800">{icon}{value}</dd>
    </div>
  );
}
