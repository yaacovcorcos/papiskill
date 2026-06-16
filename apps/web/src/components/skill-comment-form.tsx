"use client";

import { useActionState } from "react";
import {
  createCommentAction,
  type CommentActionState,
} from "@/app/skills/engagement-actions";

const initialState: CommentActionState = {};

export function CommentForm({ reference }: { reference: string }) {
  const [state, action, pending] = useActionState(createCommentAction, initialState);

  return (
    <form action={action} className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="reference" value={reference} />
      <label className="block text-sm font-semibold" htmlFor="comment-body">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        name="body"
        required
        minLength={2}
        maxLength={2000}
        rows={4}
        className="mt-3 w-full resize-y rounded-md border border-border px-3 py-2 text-sm leading-6 outline-none focus:border-accent"
      />
      {state.error ? (
        <p className="mt-2 text-sm font-medium text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="mt-2 text-sm font-medium text-emerald-700" role="status">
          Comment posted.
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Posting..." : "Comment"}
        </button>
      </div>
    </form>
  );
}
