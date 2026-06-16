import { AppHeader } from "@/components/app-header";

export default function DashboardLoading() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="h-10 w-44 rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="h-20 rounded-md bg-slate-100" />
              <div className="h-20 rounded-md bg-slate-100" />
              <div className="h-20 rounded-md bg-slate-100" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="h-12 rounded bg-slate-100" />
              <div className="h-12 rounded bg-slate-100" />
              <div className="h-12 rounded bg-slate-100" />
            </div>
          </section>
          <aside className="space-y-6">
            <div className="h-40 rounded-lg border border-border bg-white shadow-sm" />
            <div className="h-52 rounded-lg border border-border bg-white shadow-sm" />
          </aside>
        </div>
      </main>
    </>
  );
}
