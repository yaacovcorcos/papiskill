import Link from "next/link";
import type { ReactNode } from "react";
import { MessageSquare, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/badge";
import { SkillMarkdown } from "@/components/skill-markdown";
import type { CatalogSkill } from "@/lib/server/catalog";
import {
  compatibilityLabels,
  skillHref,
} from "./skill-filters";
import { SkillMark } from "./skill-card";

export function SkillPreviewPanel({
  selected,
  markdown,
}: {
  selected: CatalogSkill | undefined;
  markdown: string;
}) {
  return (
    <aside className="hidden bg-white px-6 py-6 xl:block">
      {selected ? (
        <div className="sticky top-24">
          <div className="flex items-start gap-4">
            <SkillMark name={selected.name} />
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
              value={statusDetailLabel(selected.registryKind)}
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
                markdown={markdown}
                className="skill-markdown--compact"
              />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function statusDetailLabel(registryKind: string) {
  if (registryKind === "profile") return "Profile-published";
  if (registryKind === "community") return "Community-reviewed";
  return "Curator-published";
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
