import { AppHeader } from "@/components/app-header";

export default function AuthoringDocsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Authoring skills</h1>
        <p className="mt-3 text-lg leading-8 text-muted">
          A PapiSkill package is a folder with `skill.yml` and `SKILL.md`. Keep skills portable, inspectable, and honest about safety boundaries.
        </p>
        <pre className="mt-8 overflow-auto rounded-lg border border-border bg-slate-50 p-5 text-sm">
{`my-skill/
  skill.yml
  SKILL.md
  examples/
  scripts/
  assets/`}
        </pre>
        <section className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
          <p>Use `skill.yml` for metadata: id, name, summary, description, categories, tags, license, compatibility, and install targets.</p>
          <p>Use `SKILL.md` for agent-facing instructions. Name when to use the skill, what inputs it expects, what outputs it should produce, and which actions require explicit user approval.</p>
          <p>Global registry publishing is collaborator-approved. Public profile skills can be published by users directly, but curated global status means the package is visible in the main registry.</p>
        </section>
      </main>
    </>
  );
}
