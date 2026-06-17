"use client";

import { useActionState, useEffect } from "react";
import {
  createCommentAction,
  type CommentActionState,
} from "@/app/skills/engagement-actions";
import { FormFeedback } from "@/components/form-feedback";

const initialState: CommentActionState = {};

export function CommentForm({
  reference,
  onPosted,
}: {
  reference: string;
  onPosted?: () => void | Promise<void>;
}) {
  const [state, action, pending] = useActionState(createCommentAction, initialState);

  useEffect(() => {
    if (state.ok && state.commentId) {
      void onPosted?.();
    }
  }, [onPosted, state.commentId, state.ok]);

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
        <FormFeedback id="comment-feedback" kind="error">
          {state.error}
        </FormFeedback>
      ) : null}
      {state.ok ? (
        <FormFeedback id="comment-feedback" kind="success">
          Comment posted.
        </FormFeedback>
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
