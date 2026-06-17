import { CopyButton } from "./copy-button";

export function SkillSourceBlock({
  markdown,
  title = "Raw SKILL.md",
}: {
  markdown: string;
  title?: string;
}) {
  const source = markdown.trim() ? markdown : "No SKILL.md source was found.";

  return (
    <section className="mt-8 min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-xs text-muted">
            Exact source shown before download or install.
          </p>
        </div>
        <CopyButton
          value={source}
          label={`Copy ${title}`}
          className="inline-grid size-9 shrink-0 place-items-center rounded-md border border-border bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950"
        />
      </div>
      <pre className="max-h-[420px] max-w-full overflow-x-auto overflow-y-auto bg-slate-950 p-4 text-xs leading-5 text-slate-100">
        <code>{source}</code>
      </pre>
    </section>
  );
}
