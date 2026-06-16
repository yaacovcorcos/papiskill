"use client";

import { useActionState } from "react";
import { createTokenAction, type TokenActionState } from "./actions";

const initialState: TokenActionState = {};

export function TokenForm() {
  const [state, action, pending] = useActionState(createTokenAction, initialState);

  return (
    <form action={action} className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Create CLI token</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Tokens allow `papiskill` to install your private library skills. Copy the token now; it is shown once.
      </p>
      <label className="mt-4 block text-sm font-medium">
        Token name
        <input
          name="name"
          defaultValue="Laptop CLI"
          className="mt-2 h-10 w-full rounded-md border border-border px-3 text-sm outline-none focus:border-accent"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create token"}
      </button>
      {state.token ? (
        <code className="mt-4 block break-all rounded-md border border-emerald-200 bg-emerald-50 p-3 font-mono text-xs text-emerald-900">
          {state.token}
        </code>
      ) : null}
      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
