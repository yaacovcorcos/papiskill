import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Eye,
  Filter,
  GitFork,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Terminal,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { EngagementCounts } from "@/components/skill-engagement-panel";
import { SkillMarkdown } from "@/components/skill-markdown";
import { getCatalogSkills, type CatalogSkill } from "@/lib/server/catalog";
import { getSkillByReference } from "@/lib/server/skills";
import { SkillsLayout } from "./skills-layout";

export const revalidate = 60;

const compatibilityLabels: Record<string, string> = {
  codex: "Codex",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  "generic-agent": "Generic",
};

type FilterKey = "categories" | "compatibility" | "statuses";
type SearchParamValue = string | string[] | undefined;

interface ActiveFilters {
  query: string;
  categories: string[];
  compatibility: string[];
  statuses: string[];
}

const filterGroups: Array<{
  title: string;
  key: FilterKey;
  param: string;
  items: Array<{ value: string; label: string }>;
}> = [
  {
    title: "Categories",
    key: "categories",
    param: "category",
    items: [
      { value: "coding", label: "Coding" },
      { value: "documentation", label: "Documentation" },
      { value: "security", label: "Security" },
      { value: "productivity", label: "Productivity" },
    ],
  },
  {
    title: "Compatibility",
    key: "compatibility",
    param: "compatibility",
    items: [
      { value: "codex", label: "Codex" },
      { value: "claude-code", label: "Claude Code" },
      { value: "cursor", label: "Cursor" },
      { value: "generic-agent", label: "Generic agent" },
    ],
  },
  {
    title: "Status",
    key: "statuses",
    param: "status",
    items: [
      { value: "global", label: "Global curated" },
      { value: "profile", label: "Profile skills" },
    ],
  },
];

function skillReference(skill: {
  registryKind: string;
  slug: string;
  author: string | null;
}) {
  if (skill.registryKind === "profile" && skill.author) {
    return `${skill.author}/${skill.slug}`;
  }
  if (skill.registryKind === "community") {
    return `community/${skill.slug}`;
  }
  return `official/${skill.slug}`;
}

function skillHref(skill: {
  registryKind: string;
  slug: string;
  author: string | null;
}) {
  if (skill.registryKind === "profile" && skill.author) {
    return `/u/${skill.author}/skills/${skill.slug}`;
  }
  if (skill.registryKind === "community") {
    return `/skills/community/${skill.slug}`;
  }
  return `/skills/official/${skill.slug}`;
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const activeFilters: ActiveFilters = {
    query: q,
    categories: paramList(params.category),
    compatibility: paramList(params.compatibility),
    statuses: paramList(params.status).filter(
      (status) => status === "global" || status === "profile",
    ),
  };
  const hasStructuredFilters =
    activeFilters.categories.length > 0 ||
    activeFilters.compatibility.length > 0 ||
    activeFilters.statuses.length > 0;
  const baseSkillsPromise = getCatalogSkills({ query: q });
  const skillsPromise = hasStructuredFilters
    ? getCatalogSkills(activeFilters)
    : baseSkillsPromise;
  const [baseSkills, skills] = await Promise.all([
    baseSkillsPromise,
    skillsPromise,
  ]);
  const selected = skills[0];
  const selectedDetail = selected
    ? await getSkillByReference(skillReference(selected))
    : null;
  const activeFilterLabels = selectedFilterLabels(activeFilters);

  return (
    <>
      <AppHeader />
      <SkillsLayout
        filters={
          <>
            <div className="mb-6 flex justify-end">
              <Link
                href="/skills"
                className="text-xs font-medium text-slate-500 hover:text-slate-950"
              >
                Clear
              </Link>
            </div>
            {filterGroups.map((group) => (
              <FilterGroup
                key={group.title}
                group={group}
                filters={activeFilters}
                countSource={baseSkills}
              />
            ))}
          </>
        }
        detail={
          <aside className="hidden bg-white px-6 py-6 xl:block">
            {selected ? (
              <div className="sticky top-24">
                <div className="flex items-start gap-4">
                  <div className="grid size-16 place-items-center rounded-lg bg-slate-950 font-mono text-xl font-semibold text-white">
                    {selected.name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight">
                        {selected.name}
                      </h2>
                      <Badge variant="green">Verified</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      by {selected.author ?? "PapiSkill"}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-700">
                  {selected.description}
                </p>
                <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
                  <DetailRow
                    label="Status"
                    value={
                      selected.registryKind === "profile"
                        ? "Profile-published"
                        : "Curator-published"
                    }
                    icon={<ShieldCheck className="size-4 text-emerald-600" />}
                  />
                  <DetailRow
                    label="Safety"
                    value="Review warnings before install"
                    icon={<ShieldCheck className="size-4 text-emerald-600" />}
                  />
                  <DetailRow label="License" value="MIT" />
                  <DetailRow
                    label="Stars"
                    value={String(selected.starCount)}
                    icon={<Star className="size-4 text-slate-500" />}
                  />
                  <DetailRow
                    label="Comments"
                    value={String(selected.commentCount)}
                    icon={<MessageSquare className="size-4 text-slate-500" />}
                  />
                </dl>
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-semibold">Compatibility</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.compatibleWith.map((target) => (
                      <Badge key={target}>
                        {compatibilityLabels[target] ?? target}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">SKILL.md excerpt</h3>
                    <Link
                      href={skillHref(selected)}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Full view
                    </Link>
                  </div>
                  <div className="max-h-[380px] overflow-hidden rounded-lg border border-border bg-white p-4">
                    <SkillMarkdown
                      markdown={selectedDetail?.markdown ?? ""}
                      className="skill-markdown--compact"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        }
      >
        <section className="min-w-0 border-r border-border px-5 py-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
              <p className="mt-1 text-sm text-muted">
                Discover, install, copy, and improve portable agent skills.
              </p>
            </div>
            <Link
              href="/docs/authoring"
              className="hidden items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 min-[900px]:inline-flex"
            >
              Publish a skill
            </Link>
          </div>

          <form className="mb-5">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search skills, authors, tags..."
                className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-accent"
              />
              {activeFilters.categories.map((value) => (
                <input
                  key={`category-${value}`}
                  type="hidden"
                  name="category"
                  value={value}
                />
              ))}
              {activeFilters.compatibility.map((value) => (
                <input
                  key={`compatibility-${value}`}
                  type="hidden"
                  name="compatibility"
                  value={value}
                />
              ))}
              {activeFilters.statuses.map((value) => (
                <input
                  key={`status-${value}`}
                  type="hidden"
                  name="status"
                  value={value}
                />
              ))}
            </label>
          </form>

          <div className="mb-5 flex items-center gap-2 min-[900px]:hidden">
            <details className="group">
              <summary className="inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50">
                <Filter className="size-4" aria-hidden />
                <span>Filters</span>
                <span className="text-xs font-medium text-muted">
                  {filterSummary(activeFilters)}
                </span>
              </summary>
              <div className="absolute left-5 right-5 z-10 mt-3 grid gap-4 rounded-lg border border-border bg-surface-subtle p-3 shadow-lg sm:grid-cols-3">
                {filterGroups.map((group) => (
                  <FilterGroup
                    key={group.title}
                    group={group}
                    filters={activeFilters}
                    countSource={baseSkills}
                    compact
                  />
                ))}
                <Link
                  href={skillsHref({
                    ...activeFilters,
                    categories: [],
                    compatibility: [],
                    statuses: [],
                  })}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-950 sm:col-span-3"
                >
                  Clear filters
                </Link>
              </div>
            </details>
            <Link
              href="/docs/authoring"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
            >
              <Plus className="size-4" aria-hidden />
              Publish
            </Link>
          </div>

          {activeFilterLabels.length > 0 ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {activeFilterLabels.map((filter) => (
                <Link
                  key={`${filter.key}-${filter.value}`}
                  href={toggleFilterHref(
                    activeFilters,
                    filter.key,
                    filter.value,
                  )}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-slate-50 px-2.5 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  {filter.label}
                  <X className="size-3.5" aria-hidden />
                </Link>
              ))}
              <Link
                href={skillsHref({
                  ...activeFilters,
                  categories: [],
                  compatibility: [],
                  statuses: [],
                })}
                className="text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                Clear filters
              </Link>
            </div>
          ) : null}

          <div className="mb-3 flex items-center justify-between text-sm text-muted">
            <span>{skills.length} skills</span>
            <span>Sort: curated first</span>
          </div>

          <div className="space-y-3">
            {skills.map((skill) => {
              const href = skillHref(skill);
              const reference = skillReference(skill);
              return (
                <article
                  key={`${skill.registryKind}/${skill.slug}`}
                  className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-slate-300"
                >
                  <Link
                    href={href}
                    className="group flex gap-4 rounded-md outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                  >
                    <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-slate-950 font-mono text-lg font-semibold text-white">
                      {skill.name
                        .split(/\s+/)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold group-hover:underline">
                          {skill.name}
                        </h2>
                        <Badge
                          variant={
                            skill.registryKind === "global" ? "blue" : "neutral"
                          }
                        >
                          {skill.registryKind === "global"
                            ? "Global"
                            : "Profile"}
                        </Badge>
                        <Badge variant="green">Validated</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        by {skill.author ?? "PapiSkill"}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                        {skill.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skill.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      <div className="mt-3">
                        <EngagementCounts stars={skill.starCount} comments={skill.commentCount} />
                      </div>
                    </div>
                    <ArrowRight
                      className="mt-1 hidden size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 sm:block"
                      aria-hidden
                    />
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
                      <Link
                        href={href}
                        aria-label={`View ${skill.name}`}
                        title="View"
                        className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      >
                        <Eye className="size-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/download/${reference}`}
                        prefetch={false}
                        aria-label={`Download ${skill.name}`}
                        title="Download"
                        className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      >
                        <Download className="size-4" aria-hidden />
                      </Link>
                      <Link
                        href={`/dashboard/fork?skill=${reference}`}
                        prefetch={false}
                        aria-label={`Copy ${skill.name} to library`}
                        title="Copy to library"
                        className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      >
                        <GitFork className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </SkillsLayout>
    </>
  );
}

function FilterGroup({
  group,
  filters,
  countSource,
  compact = false,
}: {
  group: (typeof filterGroups)[number];
  filters: ActiveFilters;
  countSource: CatalogSkill[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mb-7"}>
      <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
      <div className="space-y-1">
        {group.items.map(({ value, label }) => {
          const isActive = filters[group.key].includes(value);
          const count = countMatching(countSource, group.key, value);
          return (
            <Link
              key={value}
              href={toggleFilterHref(filters, group.key, value)}
              className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm ${isActive ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-700 hover:bg-white"}`}
              aria-pressed={isActive}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`grid size-4 shrink-0 place-items-center rounded border ${isActive ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white"}`}
                >
                  {isActive ? <Check className="size-3" aria-hidden /> : null}
                </span>
                <span className="truncate">{label}</span>
              </span>
              <span className="shrink-0 text-xs text-muted">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function paramList(value: SearchParamValue) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return Array.from(
    new Set(
      values
        .flatMap((item) => item.split(","))
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function skillsHref(filters: ActiveFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  filters.categories.forEach((value) => params.append("category", value));
  filters.compatibility.forEach((value) =>
    params.append("compatibility", value),
  );
  filters.statuses.forEach((value) => params.append("status", value));
  const query = params.toString();
  return query ? `/skills?${query}` : "/skills";
}

function toggleFilterHref(
  filters: ActiveFilters,
  key: FilterKey,
  value: string,
) {
  const currentValues = filters[key];
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
  return skillsHref({ ...filters, [key]: nextValues });
}

function filterSummary(filters: ActiveFilters) {
  const count =
    filters.categories.length +
    filters.compatibility.length +
    filters.statuses.length;
  return count === 0 ? "All skills" : `${count} selected`;
}

function countMatching(skills: CatalogSkill[], key: FilterKey, value: string) {
  return skills.filter((skill) => {
    if (key === "categories") return skill.categories.includes(value);
    if (key === "compatibility") return skill.compatibleWith.includes(value);
    return skill.registryKind === value;
  }).length;
}

function selectedFilterLabels(filters: ActiveFilters) {
  return filterGroups.flatMap((group) =>
    group.items
      .filter((item) => filters[group.key].includes(item.value))
      .map((item) => ({
        key: group.key,
        value: item.value,
        label: item.label,
      })),
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-slate-800">
        {icon}
        {value}
      </dd>
    </div>
  );
}
