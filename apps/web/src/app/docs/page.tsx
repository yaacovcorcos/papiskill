import Link from "next/link";
import { AppHeader } from "@/components/app-header";

const docs = [
  ["Authoring skills", "/docs/authoring", "Package format, writing rules, validation, and publishing."],
  ["CLI", "/docs/cli", "Search, install, download, validate, and authenticate from the terminal."],
  ["Contributing", "/docs/contributing", "How global registry publishing and pull requests work."],
  ["Security", "/docs/security", "Trust model, private forks, API tokens, and safety warnings."],
];

export default function DocsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Practical docs for using PapiSkill, authoring portable skills, and contributing to the global registry.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {docs.map(([title, href, body]) => (
            <Link key={href} href={href} className="rounded-lg border border-border bg-white p-5 shadow-sm hover:border-slate-300">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
