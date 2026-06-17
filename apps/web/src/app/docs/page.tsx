import Link from "next/link";
import { AppHeader } from "@/components/app-header";

const docs: Array<{ title: string; href: string; body: string }> = [
  { title: "Authoring skills", href: "/docs/authoring", body: "Package format, writing rules, validation, and publishing." },
  { title: "CLI", href: "/docs/cli", body: "Search, install, download, validate, and authenticate from the terminal." },
  { title: "Contributing", href: "/docs/contributing", body: "How global registry publishing and pull requests work." },
  { title: "Security", href: "/docs/security", body: "Trust model, private forks, API tokens, and safety warnings." },
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
          {docs.map(({ title, href, body }) => (
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
