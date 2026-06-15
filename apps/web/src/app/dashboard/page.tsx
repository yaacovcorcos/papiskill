import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
              Manage profile skills, private forks, API tokens, validation, and downloads.
            </p>
          </div>
          <Link href="/api/auth/sign-in/github" className="inline-flex justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Sign in with GitHub
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Forks", "Edit your public or private skill copies."],
            ["API tokens", "Create tokens for authenticated private CLI installs."],
            ["Publishing", "Submit validated packages for global registry review."],
          ].map(([title, body]) => (
            <section key={title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
