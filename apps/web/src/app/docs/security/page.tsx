import { AppHeader } from "@/components/app-header";

const sensitiveSurfaces = [
  "private library skills",
  "API tokens",
  "GitHub OAuth account linkage",
  "skill downloads",
  "global registry contribution flow",
  "package validation and script warnings",
];

const requirements = [
  "No secrets in source control.",
  "API tokens are hashed at rest.",
  "Private library access requires an owner session or owner token.",
  "Mutations derive the user ID from the server session.",
  "The web app does not execute skill scripts.",
  "Packages with scripts or risky instructions show validation warnings.",
  "Global curated status comes from collaborator-published registry source.",
];

export default function SecurityDocsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Security</h1>
        <p className="mt-3 text-lg leading-8 text-muted">
          PapiSkill is a multi-user public registry. Authenticated users are not trusted operators, and server-side ownership checks are mandatory.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Sensitive surfaces</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {sensitiveSurfaces.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Requirements</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {requirements.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Security finding format</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Findings should name the affected route or file, auth requirement, ownership check result, exploitability, smallest safe remediation, and a verification command or test.
          </p>
        </section>
      </main>
    </>
  );
}
