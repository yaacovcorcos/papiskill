"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Download, ExternalLink, Save } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { SkillMarkdownEditor } from "@/components/skill-markdown-editor";
import { saveForkAction, type SaveForkActionIssue, type SaveForkActionState } from "../../../actions";

interface EditLibrarySkillFormProps {
  fork: {
    id: string;
    name: string;
    slug: string;
    summary: string;
    description: string;
    visibility: string;
    markdown: string;
  };
  reference: string;
  installCommand: string;
  publicHref: string;
  showPublicLink: boolean;
  sourceLabel: string;
  sourceVersion: string;
  lastValidatedAt: string;
  initialIssues: SaveForkActionIssue[];
}

const initialState: SaveForkActionState = {};

export function EditLibrarySkillForm({
  fork,
  reference,
  installCommand,
  publicHref,
  showPublicLink,
  sourceLabel,
  sourceVersion,
  lastValidatedAt,
  initialIssues,
}: EditLibrarySkillFormProps) {
  const [state, action, pending] = useActionState(saveForkAction, initialState);
  const issues = state.issues ?? initialIssues;

  return (
    <>
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
          <Link href={`/download/${reference}?format=zip`} aria-label="Download" title="Download package" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
            <Download className="size-4" aria-hidden />
          </Link>
          {showPublicLink ? (
            <Link href={publicHref} aria-label="Open profile page" title="Open profile page" className="inline-grid size-10 place-items-center rounded-md border border-border text-slate-700 hover:bg-slate-50 hover:text-slate-950">
              <ExternalLink className="size-4" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      <form action={action} className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <input type="hidden" name="forkId" value={fork.id} />
        <aside className="space-y-5">
          <section className="space-y-4 rounded-lg border border-border bg-white p-5 shadow-sm">
            {state.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                {state.error}
              </div>
            ) : null}
            {state.ok ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                Saved and validated.
              </div>
            ) : null}

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
            <button disabled={pending} type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Save className="size-4" aria-hidden />
              {pending ? "Saving..." : "Save and validate"}
            </button>
          </section>

          <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Reference</h2>
            <div className="mt-3 rounded-md bg-slate-950 px-3 py-2 font-mono text-xs text-white">
              <span className="break-all">{installCommand}</span>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Meta label="Profile ref" value={reference} />
              <Meta label="Source" value={sourceLabel} />
              <Meta label="Source version" value={sourceVersion} />
              <Meta label="Last validated" value={lastValidatedAt} />
            </dl>
          </section>

          <ValidationPanel issues={issues} />
        </aside>

        <SkillMarkdownEditor name="skillMarkdown" defaultValue={fork.markdown} />
      </form>
    </>
  );
}

function ValidationPanel({ issues }: { issues: SaveForkActionIssue[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Validation</h2>
      {issues.length === 0 ? (
        <div className="mt-3">
          <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            No validation notes
          </span>
        </div>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {issues.map((issue, index) => (
            <li key={`${issue.code}-${issue.path ?? "package"}-${index}`} className="rounded-md border border-border bg-surface-subtle p-3">
              <p className="font-semibold">
                <IssueLevelBadge level={issue.level} /> {issue.code}
              </p>
              <p className="mt-1 text-muted">{issue.message}</p>
              {issue.path ? <p className="mt-1 font-mono text-xs text-slate-500">{issue.path}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IssueLevelBadge({ level }: { level: SaveForkActionIssue["level"] }) {
  const className = level === "error"
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <span className={`mr-1 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium uppercase ${className}`}>
      {level}
    </span>
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
