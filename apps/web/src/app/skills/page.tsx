import Link from "next/link";
import { Filter, Plus, Search, X } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { getCatalogSkills } from "@/lib/server/catalog";
import { getSkillByReference } from "@/lib/server/skills";
import { FilterGroup } from "./filter-group";
import { SkillCard } from "./skill-card";
import {
  buildFilterGroups,
  filterSummary,
  hasStructuredFilters,
  parseActiveFilters,
  selectedFilterLabels,
  skillReference,
  skillsHref,
  sortLabel,
  toggleFilterHref,
  type SearchParamValue,
} from "./skill-filters";
import { SkillPreviewPanel } from "./skill-preview-panel";
import { SkillsLayout } from "./skills-layout";

export const revalidate = 60;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const activeFilters = parseActiveFilters(await searchParams);
  const baseSkillsPromise = getCatalogSkills({
    query: activeFilters.query,
    sort: activeFilters.sort,
  });
  const skillsPromise = hasStructuredFilters(activeFilters)
    ? getCatalogSkills(activeFilters)
    : baseSkillsPromise;
  const [baseSkills, skills] = await Promise.all([
    baseSkillsPromise,
    skillsPromise,
  ]);
  const filterGroups = buildFilterGroups(baseSkills, activeFilters);
  const selected = skills[0];
  const selectedDetail = selected
    ? await getSkillByReference(skillReference(selected))
    : null;
  const activeFilterLabels = selectedFilterLabels(activeFilters, filterGroups);

  return (
    <>
      <AppHeader />
      <SkillsLayout
        detail={
          <SkillPreviewPanel
            selected={selected}
            markdown={selectedDetail?.markdown ?? ""}
          />
        }
      >
        <section className="mx-auto w-full max-w-5xl min-w-0 px-5 py-6 xl:max-w-none xl:border-r xl:border-border">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
              <p className="mt-1 text-sm text-muted">
                Discover, install, copy, and improve portable agent skills.
              </p>
            </div>
            <Link
              href="/docs/authoring"
              className="focus-ring hidden items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 xl:inline-flex"
            >
              Publish a skill
            </Link>
          </div>

          <SearchForm activeFilters={activeFilters} />

          <MobileFilterBar
            activeFilters={activeFilters}
            filterGroups={filterGroups}
            activeFilterLabels={activeFilterLabels}
            countSource={baseSkills}
          />

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
                  className="focus-ring inline-flex h-8 items-center gap-1 rounded-md border border-border bg-slate-50 px-2.5 text-sm font-medium text-slate-700 hover:bg-white"
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
                className="focus-ring rounded-sm text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                Clear filters
              </Link>
            </div>
          ) : null}

          <div className="mb-3 flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>{skills.length} skills</span>
            <SortLinks activeFilters={activeFilters} />
          </div>

          {skills.length === 0 ? (
            <EmptySkillResults />
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <SkillCard
                  key={`${skill.registryKind}/${skill.slug}`}
                  skill={skill}
                />
              ))}
            </div>
          )}
        </section>
      </SkillsLayout>
    </>
  );
}

function SearchForm({
  activeFilters,
}: {
  activeFilters: ReturnType<typeof parseActiveFilters>;
}) {
  return (
    <form className="mb-5">
      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          name="q"
          defaultValue={activeFilters.query}
          aria-label="Search skills"
          placeholder="Search skills, authors, tags..."
          className="h-11 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
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
        {activeFilters.sort !== "curated" ? (
          <input type="hidden" name="sort" value={activeFilters.sort} />
        ) : null}
      </label>
    </form>
  );
}

function SortLinks({
  activeFilters,
}: {
  activeFilters: ReturnType<typeof parseActiveFilters>;
}) {
  const options = [
    { value: "curated", label: "Curated" },
    { value: "popular", label: "Popular" },
    { value: "recent", label: "Recent" },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>{sortLabel(activeFilters.sort)}</span>
      <span aria-hidden>·</span>
      <div className="flex flex-wrap gap-1" aria-label="Sort skills">
        {options.map((option) => {
          const active = activeFilters.sort === option.value;
          return active ? (
            <span
              key={option.value}
              className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-950"
            >
              {option.label}
            </span>
          ) : (
            <Link
              key={option.value}
              href={skillsHref({ ...activeFilters, sort: option.value })}
              className="focus-ring rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileFilterBar({
  activeFilters,
  filterGroups,
  activeFilterLabels,
  countSource,
}: {
  activeFilters: ReturnType<typeof parseActiveFilters>;
  filterGroups: ReturnType<typeof buildFilterGroups>;
  activeFilterLabels: ReturnType<typeof selectedFilterLabels>;
  countSource: Awaited<ReturnType<typeof getCatalogSkills>>;
}) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <details className="group">
        <summary className="focus-ring inline-flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50">
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
              countSource={countSource}
              compact
            />
          ))}
          {activeFilterLabels.length > 0 ? (
            <Link
              href={skillsHref({
                ...activeFilters,
                categories: [],
                compatibility: [],
                statuses: [],
              })}
              className="focus-ring rounded-sm text-sm font-semibold text-slate-600 hover:text-slate-950 sm:col-span-3"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </details>
      <Link
        href="/docs/authoring"
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
      >
        <Plus className="size-4" aria-hidden />
        Publish
      </Link>
    </div>
  );
}

function EmptySkillResults() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
      <h2 className="text-base font-semibold">No skills match these filters</h2>
      <p className="mt-2 text-sm text-muted">
        Try removing a filter or searching for a broader term.
      </p>
      <Link
        href="/skills"
        className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold hover:bg-slate-50"
      >
        Clear filters
      </Link>
    </div>
  );
}
