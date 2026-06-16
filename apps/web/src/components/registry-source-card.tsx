import { ExternalLink, Github, Pencil } from "lucide-react";
import Link from "next/link";

const GITHUB_REPO_URL = "https://github.com/yaacovcorcos/papiskill";

export function registrySourcePath({
  registryKind,
  slug,
}: {
  registryKind: string;
  slug: string;
}) {
  if (registryKind === "global") return `registry/official/${slug}`;
  if (registryKind === "community") return `registry/community/${slug}`;
  return null;
}

export function RegistrySourceCard({
  registryKind,
  slug,
}: {
  registryKind: string;
  slug: string;
}) {
  const sourcePath = registrySourcePath({ registryKind, slug });
  if (!sourcePath) return null;

  const folderUrl = `${GITHUB_REPO_URL}/tree/main/${sourcePath}`;
  const editUrl = `${GITHUB_REPO_URL}/edit/main/${sourcePath}/SKILL.md`;

  return (
    <div className="mt-4 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
        Contribute
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Global registry changes go through GitHub pull requests and collaborator review.
      </p>
      <code className="mt-3 block break-all rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
        {sourcePath}/
      </code>
      <div className="mt-4 grid gap-2">
        <a
          href={folderUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          <Github className="size-4" aria-hidden />
          View source
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Pencil className="size-4" aria-hidden />
          Propose edit
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
        <Link
          href="/docs/contributing"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Contribution guide
        </Link>
      </div>
    </div>
  );
}
