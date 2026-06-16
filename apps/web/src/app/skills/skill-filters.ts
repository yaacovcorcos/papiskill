import type { CatalogSkill } from "@/lib/server/catalog";

export const compatibilityLabels: Record<string, string> = {
  codex: "Codex",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  "generic-agent": "Generic",
};

export type FilterKey = "categories" | "compatibility" | "statuses";
export type SearchParamValue = string | string[] | undefined;

export type FilterItem = { value: string; label: string };
export type FilterGroupDefinition = {
  title: string;
  key: FilterKey;
  items: FilterItem[];
};

export interface ActiveFilters {
  query: string;
  categories: string[];
  compatibility: string[];
  statuses: string[];
}

export interface ActiveFilterLabel {
  key: FilterKey;
  value: string;
  label: string;
}

const categoryOrder = ["coding", "documentation", "security", "productivity"];
const compatibilityOrder = ["codex", "claude-code", "cursor", "generic-agent"];
const statusOrder = ["global", "community", "profile"];

const categoryLabels: Record<string, string> = {
  coding: "Coding",
  documentation: "Documentation",
  security: "Security",
  productivity: "Productivity",
};

const statusLabels: Record<string, string> = {
  global: "Global curated",
  community: "Community reviewed",
  profile: "Profile skills",
};

const validStatuses = new Set(statusOrder);

export function skillReference(skill: {
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

export function skillHref(skill: {
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

export function parseActiveFilters(params: Record<string, SearchParamValue>): ActiveFilters {
  return {
    query: firstParam(params.q),
    categories: paramList(params.category),
    compatibility: paramList(params.compatibility),
    statuses: paramList(params.status).filter((status) =>
      validStatuses.has(status),
    ),
  };
}

export function hasStructuredFilters(filters: ActiveFilters) {
  return (
    filters.categories.length > 0 ||
    filters.compatibility.length > 0 ||
    filters.statuses.length > 0
  );
}

export function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function paramList(value: SearchParamValue) {
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

export function skillsHref(filters: ActiveFilters) {
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

export function toggleFilterHref(
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

export function filterSummary(filters: ActiveFilters) {
  const count =
    filters.categories.length +
    filters.compatibility.length +
    filters.statuses.length;
  return count === 0 ? "All skills" : `${count} selected`;
}

export function statusBadgeLabel(registryKind: string) {
  if (registryKind === "global") return "Global";
  if (registryKind === "community") return "Community";
  return "Profile";
}

export function countMatching(skills: CatalogSkill[], key: FilterKey, value: string) {
  return skills.filter((skill) => {
    if (key === "categories") return skill.categories.includes(value);
    if (key === "compatibility") return skill.compatibleWith.includes(value);
    return skill.registryKind === value;
  }).length;
}

export function selectedFilterLabels(
  filters: ActiveFilters,
  filterGroups: FilterGroupDefinition[],
): ActiveFilterLabel[] {
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

export function buildFilterGroups(
  skills: CatalogSkill[],
  filters: ActiveFilters,
): FilterGroupDefinition[] {
  return [
    buildFilterGroup({
      title: "Categories",
      key: "categories",
      values: skills.flatMap((skill) => skill.categories),
      activeValues: filters.categories,
      preferredOrder: categoryOrder,
      labels: categoryLabels,
    }),
    buildFilterGroup({
      title: "Compatibility",
      key: "compatibility",
      values: skills.flatMap((skill) => skill.compatibleWith),
      activeValues: filters.compatibility,
      preferredOrder: compatibilityOrder,
      labels: compatibilityLabels,
    }),
    buildFilterGroup({
      title: "Status",
      key: "statuses",
      values: skills.map((skill) => skill.registryKind),
      activeValues: filters.statuses,
      preferredOrder: statusOrder,
      labels: statusLabels,
    }),
  ].filter((group) => group.items.length > 0);
}

function buildFilterGroup({
  title,
  key,
  values,
  activeValues,
  preferredOrder,
  labels,
}: {
  title: string;
  key: FilterKey;
  values: string[];
  activeValues: string[];
  preferredOrder: string[];
  labels: Record<string, string>;
}): FilterGroupDefinition {
  const available = new Set(values.map((value) => value.toLowerCase()));
  const active = new Set(activeValues);
  const allValues = Array.from(new Set([...available, ...active]));
  allValues.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.localeCompare(b);
  });

  return {
    title,
    key,
    items: allValues.map((value) => ({
      value,
      label: labels[value] ?? titleCase(value),
    })),
  };
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
