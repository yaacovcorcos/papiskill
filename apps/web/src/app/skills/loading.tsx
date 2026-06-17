import { AppHeader } from "@/components/app-header";

export default function SkillsLoading() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="min-w-0 border-r border-border px-5 py-6">
          <div className="mb-5 h-8 w-28 rounded bg-slate-200" />
          <div className="mb-5 h-11 rounded-lg bg-slate-100" />
          <div className="space-y-3">
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
          </div>
        </section>
        <aside className="hidden bg-white px-6 py-6 xl:block">
          <div className="flex items-start gap-4">
            <div className="size-16 rounded-lg bg-slate-200" />
            <div className="flex-1">
              <div className="h-5 w-36 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-24 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 h-24 rounded-lg bg-slate-100" />
          <div className="mt-6 h-56 rounded-lg bg-slate-100" />
        </aside>
      </main>
    </>
  );
}

function SkillCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="size-14 rounded-lg bg-slate-200" />
        <div className="min-w-0 flex-1">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
          <div className="mt-4 h-4 max-w-2xl rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
