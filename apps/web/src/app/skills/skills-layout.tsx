"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SkillsLayout({
  filters,
  children,
  detail,
}: {
  filters: ReactNode;
  children: ReactNode;
  detail: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = collapsed ? "Expand filters" : "Collapse filters";
  const gridColumns = collapsed
    ? "min-[900px]:grid-cols-[56px_minmax(0,1fr)] xl:grid-cols-[56px_minmax(0,1fr)_430px]"
    : "min-[900px]:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_430px]";

  return (
    <main
      className={`mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 transition-[grid-template-columns] duration-200 ${gridColumns}`}
    >
      <aside className={`hidden border-r border-border bg-surface-subtle py-6 transition-all duration-200 min-[900px]:block ${collapsed ? "px-2" : "px-5"}`}>
        <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? null : (
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">Filters</h2>
          )}
          <button
            type="button"
            aria-label={label}
            title={label}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            className="inline-grid size-7 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-950 focus-visible:bg-white focus-visible:text-slate-950 focus-visible:outline-none"
          >
            {collapsed ? <ChevronRight className="size-4" aria-hidden /> : <ChevronLeft className="size-4" aria-hidden />}
          </button>
        </div>
        <div className={collapsed ? "hidden" : "block"}>{filters}</div>
      </aside>
      {children}
      {detail}
    </main>
  );
}
