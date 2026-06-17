"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EyeOff, Star, Trash2 } from "lucide-react";
import {
  deleteCommentAction,
  hideCommentAction,
  toggleStarAction,
} from "@/app/skills/engagement-actions";
import { signInPath } from "@/lib/auth-callback";
import type { SerializedSkillEngagement } from "@/lib/engagement-types";
import {
  commentAuthorLabel,
  deleteCommentLabel,
  hideCommentLabel,
  signInToStarLabel,
  starCountLabel,
} from "./action-labels";
import { PendingSubmitButton } from "./pending-submit-button";
import { CommentForm } from "./skill-comment-form";

interface EngagementResponse {
  engagement: SerializedSkillEngagement;
  viewerSignedIn: boolean;
}

export function SkillEngagementLoader({
  reference,
}: {
  reference: string;
}) {
  const [state, setState] = useState<EngagementLoadState>({
    status: "loading",
  });

  const applyEngagement = useCallback((payload: EngagementResponse) => {
    setState({
      status: "ready",
      engagement: payload.engagement,
      viewerSignedIn: payload.viewerSignedIn,
    });
  }, []);

  const refreshEngagement = useCallback(async () => {
    try {
      const response = await fetchEngagement(reference);
      if (!response.ok) {
        setState({ status: "error" });
        return;
      }
      const payload = (await response.json()) as EngagementResponse;
      applyEngagement(payload);
    } catch {
      setState({ status: "error" });
    }
  }, [applyEngagement, reference]);

  useEffect(() => {
    let active = true;
    void fetchEngagement(reference).then(async (response) => {
      if (!active) return;
      if (!response.ok) {
        setState({ status: "error" });
        return;
      }
      const payload = (await response.json()) as EngagementResponse;
      if (active) applyEngagement(payload);
    }).catch(() => {
      if (active) setState({ status: "error" });
    });
    return () => {
      active = false;
    };
  }, [applyEngagement, reference]);

  if (state.status === "loading") {
    return (
      <SkillEngagementPlaceholder
        statusText="Loading community..."
        bodyText="Community activity is loading."
      />
    );
  }

  if (state.status === "error") {
    return (
      <SkillEngagementPlaceholder
        statusText="Community activity unavailable"
        bodyText="Stars and comments could not be loaded right now."
      />
    );
  }

  return (
    <SkillEngagementClientPanel
      engagement={state.engagement}
      viewerSignedIn={state.viewerSignedIn}
      onRefresh={refreshEngagement}
    />
  );
}

type EngagementLoadState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      engagement: SerializedSkillEngagement;
      viewerSignedIn: boolean;
    };

function fetchEngagement(reference: string) {
  return fetch(`/api/v1/engagement/${reference}`, {
    cache: "no-store",
    credentials: "same-origin",
  });
}

function SkillEngagementPlaceholder({
  statusText,
  bodyText,
}: {
  statusText: string;
  bodyText: string;
}) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Community</h2>
          <p className="mt-1 text-sm text-muted">{statusText}</p>
        </div>
        <button
          type="button"
          disabled
          aria-label={statusText}
          title={statusText}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-muted"
        >
          <Star className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted">
        {bodyText}
      </div>
    </section>
  );
}

function SkillEngagementClientPanel({
  engagement,
  viewerSignedIn,
  onRefresh,
}: {
  engagement: SerializedSkillEngagement;
  viewerSignedIn: boolean;
  onRefresh: () => Promise<void>;
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
        <StarControl
          engagement={engagement}
          viewerSignedIn={viewerSignedIn}
          onRefresh={onRefresh}
        />
      </div>

      <div className="mt-6">
        {engagement.enabled && viewerSignedIn ? (
          <CommentForm reference={engagement.reference} onPosted={onRefresh} />
        ) : engagement.enabled ? (
          <div className="rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
            <Link href={signInPath(engagement.path)} className="font-semibold text-slate-950 hover:underline">
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
          engagement.comments.map((comment) => {
            const authorLabel = commentAuthorLabel(comment.authorHandle, comment.authorName);
            const hideLabel = hideCommentLabel(comment.authorHandle, comment.authorName);
            const deleteLabel = deleteCommentLabel(comment.authorHandle, comment.authorName);

            return (
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
                      <p className="text-sm font-semibold">{authorLabel}</p>
                      <time className="text-xs text-muted" dateTime={comment.createdAt}>
                        {formatCommentDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {comment.viewerCanHide ? (
                      <form
                        action={async (formData) => {
                          await hideCommentAction(formData);
                          await onRefresh();
                        }}
                      >
                        <input type="hidden" name="reference" value={engagement.reference} />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <PendingSubmitButton
                          aria-label={hideLabel}
                          title={hideLabel}
                          pendingChildren={<EyeOff className="size-4" aria-hidden />}
                          className="focus-ring inline-grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-amber-700"
                        >
                          <EyeOff className="size-4" aria-hidden />
                        </PendingSubmitButton>
                      </form>
                    ) : null}
                    {comment.viewerCanDelete ? (
                      <form
                        action={async (formData) => {
                          await deleteCommentAction(formData);
                          await onRefresh();
                        }}
                      >
                        <input type="hidden" name="reference" value={engagement.reference} />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <PendingSubmitButton
                          aria-label={deleteLabel}
                          title={deleteLabel}
                          pendingChildren={<Trash2 className="size-4" aria-hidden />}
                          className="focus-ring inline-grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-red-700"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </PendingSubmitButton>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function StarControl({
  engagement,
  viewerSignedIn,
  onRefresh,
}: {
  engagement: SerializedSkillEngagement;
  viewerSignedIn: boolean;
  onRefresh: () => Promise<void>;
}) {
  const label = engagement.viewerHasStarred ? "Unstar skill" : "Star skill";
  const countLabel = starCountLabel(engagement.starCount);
  if (!engagement.enabled) {
    return (
      <button
        type="button"
        disabled
        aria-label={countLabel}
        title={countLabel}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold text-muted"
      >
        <Star className="size-4" aria-hidden />
        {engagement.starCount}
      </button>
    );
  }

  if (!viewerSignedIn) {
    return (
      <Link
        href={signInPath(engagement.path)}
        aria-label={signInToStarLabel(engagement.starCount)}
        title="Sign in to star skill"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold hover:bg-slate-50"
      >
        <Star className="size-4" aria-hidden />
        {engagement.starCount}
      </Link>
    );
  }

  return (
    <form
      action={async (formData) => {
        await toggleStarAction(formData);
        await onRefresh();
      }}
    >
      <input type="hidden" name="reference" value={engagement.reference} />
      <PendingSubmitButton
        aria-label={label}
        title={label}
        pendingChildren={
          <>
            <Star className="size-4" fill={engagement.viewerHasStarred ? "currentColor" : "none"} aria-hidden />
            {engagement.starCount}
          </>
        }
        className={`focus-ring inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${engagement.viewerHasStarred ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800" : "border-border bg-white hover:bg-slate-50"}`}
      >
        <Star className="size-4" fill={engagement.viewerHasStarred ? "currentColor" : "none"} aria-hidden />
        {engagement.starCount}
      </PendingSubmitButton>
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

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
