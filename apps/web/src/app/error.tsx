"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-5">
          <span className="grid size-9 place-items-center rounded-lg bg-[#111318] font-mono text-sm font-semibold text-white">
            PS
          </span>
          <span className="text-xl font-semibold tracking-tight">PapiSkill</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-16">
        <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Something failed
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            PapiSkill could not finish loading this view.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Retry the request. If it keeps happening, the error digest can be
            checked in the deployment logs.
          </p>
          {error.digest ? (
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
              {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </section>
      </main>
    </>
  );
}
