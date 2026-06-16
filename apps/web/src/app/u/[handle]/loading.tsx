import { AppHeader } from "@/components/app-header";

export default function ProfileLoading() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <header className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-center">
          <div className="size-20 rounded-xl bg-slate-200" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-3 h-10 w-48 rounded bg-slate-200" />
            <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
          </div>
        </header>
        <section className="mt-8">
          <div className="mb-4 h-6 w-40 rounded bg-slate-200" />
          <div className="grid gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="mt-4 h-4 max-w-3xl rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
