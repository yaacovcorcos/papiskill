import Link from "next/link";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import type { SkillEngagement } from "@/lib/server/engagement";
import {
  deleteCommentAction,
  toggleStarAction,
} from "@/app/skills/engagement-actions";
import { CommentForm } from "./skill-comment-form";

export function SkillEngagementPanel({
  engagement,
  viewerSignedIn,
}: {
  engagement: SkillEngagement;
  viewerSignedIn: boolean;
}) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Community</h2>
          <p className="mt-1 text-sm text-muted">
            {engagement.commentCount} comments · {engagement.starCount} stars
          </p>
        </div>
        <StarControl engagement={engagement} viewerSignedIn={viewerSignedIn} />
      </div>

      <div className="mt-6">
        {engagement.enabled && viewerSignedIn ? (
          <CommentForm reference={engagement.reference} />
        ) : engagement.enabled ? (
          <div className="rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
            <Link href="/auth/sign-in" className="font-semibold text-slate-950 hover:underline">
              Sign in with GitHub
            </Link>{" "}
            to star and comment.
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        {engagement.comments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted">
            No comments yet.
          </div>
        ) : (
          engagement.comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-slate-950 text-xs font-semibold text-white">
                  {comment.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.authorAvatarUrl} alt="" className="size-full object-cover" />
                  ) : (
                    initials(comment.authorHandle ?? comment.authorName ?? "PS")
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                      {comment.authorHandle ? `@${comment.authorHandle}` : (comment.authorName ?? "PapiSkill user")}
                    </p>
                    <time className="text-xs text-muted" dateTime={comment.createdAt.toISOString()}>
                      {formatCommentDate(comment.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                </div>
                {comment.viewerCanDelete ? (
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="reference" value={engagement.reference} />
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button
                      type="submit"
                      aria-label="Delete comment"
                      title="Delete"
                      className="inline-grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function StarControl({
  engagement,
  viewerSignedIn,
}: {
  engagement: SkillEngagement;
  viewerSignedIn: boolean;
}) {
  const label = engagement.viewerHasStarred ? "Unstar skill" : "Star skill";
  if (!engagement.enabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-muted"
      >
        <Star className="size-4" aria-hidden />
        {engagement.starCount}
      </button>
    );
  }

  if (!viewerSignedIn) {
    return (
      <Link
        href="/auth/sign-in"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold hover:bg-slate-50"
      >
        <Star className="size-4" aria-hidden />
        {engagement.starCount}
      </Link>
    );
  }

  return (
    <form action={toggleStarAction}>
      <input type="hidden" name="reference" value={engagement.reference} />
      <button
        type="submit"
        aria-label={label}
        title={label}
        className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${engagement.viewerHasStarred ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800" : "border-border bg-white hover:bg-slate-50"}`}
      >
        <Star className="size-4" fill={engagement.viewerHasStarred ? "currentColor" : "none"} aria-hidden />
        {engagement.starCount}
      </button>
    </form>
  );
}

function initials(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCommentDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function EngagementCounts({
  stars,
  comments,
}: {
  stars: number;
  comments: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted">
      <span className="inline-flex items-center gap-1">
        <Star className="size-3.5" aria-hidden />
        {stars}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageSquare className="size-3.5" aria-hidden />
        {comments}
      </span>
    </div>
  );
}
