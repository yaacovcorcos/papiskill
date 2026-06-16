import { AppHeader } from "@/components/app-header";

export default function AuthorsLoading() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-10">
        <div className="h-10 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="size-12 rounded-lg bg-slate-200" />
              <div className="flex-1">
                <div className="h-5 w-32 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-24 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
