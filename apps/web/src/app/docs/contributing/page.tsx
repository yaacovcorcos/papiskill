import { AppHeader } from "@/components/app-header";

const contributionAreas = [
  "improve the web app",
  "improve the CLI",
  "improve skill validation",
  "submit new global registry skills",
  "improve documentation",
];

const registryRequirements = [
  "valid skill.yml",
  "valid SKILL.md",
  "MIT-compatible license unless explicitly approved",
  "clear author attribution",
  "validation without errors",
  "collaborator approval",
];

export default function ContributingDocsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Contributing</h1>
        <p className="mt-3 text-lg leading-8 text-muted">
          PapiSkill is open source. Contributions can improve the app, CLI, validation rules, docs, or the curated global registry.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Ways to contribute</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {contributionAreas.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Global registry skills</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Curated global skills live in <code className="rounded bg-slate-100 px-1.5 py-0.5">registry/official/&lt;skill-id&gt;/</code>.
            Existing skill detail pages show the exact source path and link to GitHub for focused edits.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {registryRequirements.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <code className="mt-5 block rounded-lg border border-border bg-slate-950 px-4 py-3 font-mono text-sm text-white">
            npm run registry:validate
          </code>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Development flow</h2>
          <pre className="mt-4 overflow-auto rounded-lg border border-border bg-slate-50 p-5 text-sm">
{`npm install
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run build`}
          </pre>
        </section>
      </main>
    </>
  );
}
