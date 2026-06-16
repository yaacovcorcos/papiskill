import Link from "next/link";
import { Check } from "lucide-react";
import type { CatalogSkill } from "@/lib/server/catalog";
import {
  countMatching,
  toggleFilterHref,
  type ActiveFilters,
  type FilterGroupDefinition,
} from "./skill-filters";

export function FilterGroup({
  group,
  filters,
  countSource,
  compact = false,
}: {
  group: FilterGroupDefinition;
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
              className={`focus-ring flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm ${isActive ? "bg-white font-semibold text-slate-950 shadow-sm" : "text-slate-700 hover:bg-white"}`}
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
