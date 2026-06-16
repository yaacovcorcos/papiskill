import Link from "next/link";
import { ArrowRight, Download, Eye, GitFork, Terminal } from "lucide-react";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/copy-button";
import { EngagementCounts } from "@/components/skill-engagement-panel";
import type { CatalogSkill } from "@/lib/server/catalog";
import {
  skillHref,
  skillReference,
  statusBadgeLabel,
} from "./skill-filters";

export function SkillCard({ skill }: { skill: CatalogSkill }) {
  const href = skillHref(skill);
  const reference = skillReference(skill);

  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-slate-300">
      <Link
        href={href}
        className="group flex gap-4 rounded-md outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
      >
        <SkillMark name={skill.name} size="list" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold group-hover:underline">
              {skill.name}
            </h2>
            <Badge
              variant={skill.registryKind === "global" ? "blue" : "neutral"}
            >
              {statusBadgeLabel(skill.registryKind)}
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
            <EngagementCounts
              stars={skill.starCount}
              comments={skill.commentCount}
            />
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
            href={`/download/${reference}?format=zip`}
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
}

export function SkillMark({
  name,
  size = "preview",
}: {
  name: string;
  size?: "list" | "preview";
}) {
  return (
    <div className={`${size === "list" ? "size-14 text-lg" : "size-16 text-xl"} grid shrink-0 place-items-center rounded-lg bg-slate-950 font-mono font-semibold text-white`}>
      {name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}
