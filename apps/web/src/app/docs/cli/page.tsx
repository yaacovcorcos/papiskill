import { AppHeader } from "@/components/app-header";

const commands = [
  "npx papiskill search review",
  "npx papiskill info official/code-review",
  "npx papiskill install official/code-review --target codex",
  "npx papiskill install yaacov/my-private-skill",
  "npx papiskill validate ./my-skill",
  "npx papiskill login psk_...",
];

export default function CliDocsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">CLI</h1>
        <p className="mt-3 text-lg leading-8 text-muted">
          The `papiskill` CLI installs skills into Codex, Claude Code, Cursor, generic project folders, or a custom directory.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          The npm package is prepared through a dry-run packaging gate and will be available with `npx papiskill` after the first npm publication.
        </p>
        <div className="mt-8 space-y-3">
          {commands.map((command) => (
            <code key={command} className="block rounded-lg border border-border bg-slate-950 px-4 py-3 font-mono text-sm text-white">
              {command}
            </code>
          ))}
        </div>
      </main>
    </>
  );
}
