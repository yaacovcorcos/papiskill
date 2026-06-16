# Product Backlog

Last updated: 2026-06-17

This file keeps product ideas that should survive chat context. Items here are not commitments to implement immediately; they are candidates to review, design, and build without short-term workarounds.

## Engagement: Stars And Comments

Current state:

- Public skill detail pages can show stars and visible comments.
- Signed-in users can star public registry skills and public profile skills.
- Signed-in users can comment on public registry skills and public profile skills.
- Comment authors can soft-delete their own comments.
- Lists and profile pages can show public star and comment counts.
- Comment posting has persisted server-side limits for hourly volume and duplicate rapid posts.

Follow-up ideas:

- Add a curator/moderator view for hiding abusive or low-quality comments.
- Add stricter engagement abuse controls over time. Star toggles may need a dedicated action log if abuse appears.
- Add comment reporting or moderation notes before the app has meaningful public traffic.
- Consider comment editing, with edited timestamps, only if it improves trust rather than creating ambiguity.
- Consider sorting and discovery signals that combine stars, comments, downloads, and freshness.

## Performance And Caching

Goal: make the app feel instant while preserving correct auth and privacy boundaries.

Follow-up ideas:

- Audit public registry list, detail, API, and download cache headers.
- Preload common detail routes from registry cards.
- Keep public registry responses cacheable, but never cache private or owner-scoped library responses in shared caches.
- Profile page and engagement counts need deliberate revalidation after comments, stars, downloads, and visibility changes.
- Track slow routes locally and in Vercel before adding complexity.
- Keep generated registry data and database indexing aligned so public pages do not do unnecessary work.

## Personal Library And In-App Editing

Goal: make fork, edit, validate, publish-to-profile, and download/export feel complete enough to trust.

Follow-up ideas:

- Review the full authenticated flow from opening a public skill to creating a private personal fork.
- Review editing metadata, slug, `SKILL.md`, package files, preview, validation, visibility, download, and profile publishing.
- Make validation warnings and safety warnings visible at the point where users decide to save, publish, download, or install.
- Preserve source attribution and update information for copied skills.
- Make public/private/unlisted visibility consequences extremely clear.
- Decide whether editing should support folder packages beyond `SKILL.md` in v1 UI, or expose that mainly through CLI/Git first.

## Sidebar And Discovery Filters

Current state:

- Main skill discovery supports search, filter counts, category filters, compatibility filters, status filters, and sorting.

Follow-up ideas:

- Keep only filters that are backed by real data and affect the result set.
- Hide or disable zero-count filters if they make the sidebar feel broken.
- Consider replacing the persistent desktop sidebar with compact filter controls if the screen feels too split or sparse.
- Add download/star/comment/popularity signals only after they are meaningful and not misleading.
