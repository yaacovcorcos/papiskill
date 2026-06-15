import { AppHeader } from "@/components/app-header";

export default function AuthorsPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        <h1 className="text-4xl font-semibold tracking-tight">Authors</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Public author profiles collect published skills, forks, attribution, and contribution history.
        </p>
        <div className="mt-8 rounded-lg border border-border bg-slate-50 p-8 text-sm text-muted">
          Author discovery will populate as GitHub-authenticated users publish public skills.
        </div>
      </main>
    </>
  );
}
