# Production readiness audit

Date: 2026-06-17

This review records the current production state after the production quality passes on June 17, 2026.
It is not a claim that every v1 product decision is finished. It separates shipped surfaces from the
remaining work that needs explicit review before calling the whole product complete.

## Verdict

PapiSkill is deployed and usable as a public registry, public skill detail surface, download surface,
local/repo CLI, authenticated library editor, and engagement foundation.

The remaining blockers for declaring the overall build complete are:

- authenticated browser verification against production or a production-like database
- explicit accessibility and performance passes on the registry, detail, and editor flows
- a final decision on the sidebar/filter layout after the user's review
- CLI distribution decision: repo/local CLI is implemented, npm publication is not yet done

## Production deploy evidence

- Production domain: `https://papiskill.com`
- Recent production smoke checks returned live health API `{ "ok": true, "service": "papiskill" }`.
- Recent live skill API checks for `official/code-review` returned `version: "1.0.0"`, `license: "MIT"`, and the expected `mentions-network` validation warning.
- CLI `info official/code-review` against `https://papiskill.com` returned the skill metadata and validation warning in recent production checks.
- GitHub Actions `check` has been kept green on pushed production commits.
- `npm audit --audit-level=moderate` has reported zero vulnerabilities in recent release checks.

## Requirement checklist

| Requirement | Status | Evidence |
|---|---:|---|
| Public registry for official skills | Shipped | `/skills`, `/api/v1/skills`, generated registry fallback, database-backed catalog when indexed |
| Official skill detail pages | Shipped | `/skills/official/[slug]`, markdown rendering, validation panel, download and fork actions |
| User profiles | Shipped | `/u/[handle]`, `/u/[handle]/skills/[slug]`, profile update dashboard |
| Public/private personal forks | Shipped in code; needs signed-in browser pass | `SkillFork.visibility`, dashboard library, action-level ownership tests, profile visibility checks |
| In-browser editing | Shipped in code; needs signed-in browser pass | dashboard library edit form, validation before save, generated `skill.yml`, action-level save tests |
| Download/export | Shipped | `/download/[...reference]`, package archive tests, CLI download/install |
| Git-backed official registry | Shipped | `registry/official`, registry validation, generated registry |
| Contribution path | Shipped as docs/runbook | docs contributing and registry operations runbooks |
| GitHub OAuth | Configured in code and production env; needs user-assisted browser auth pass | Better Auth GitHub provider and sign-in route; GitHub credential prompt reached in automated pass |
| API tokens for private CLI access | Shipped in code; needs signed-in browser pass | token model, token create/revoke UI, action-level token tests, CLI login/whoami/logout |
| Stars and comments | Shipped foundation; moderation still backlog | star/comment tables, detail panel, server actions, engagement tests |
| Validation warnings visible | Shipped | cards, detail pages, profile detail pages, CLI info |
| Vercel production deployment | Shipped | production deployment and domain alias |
| CI and local quality gates | Shipped | GitHub Actions and `npm run check` |

## Known limits and next passes

### Authenticated flows

The server-side implementation and action-level tests cover ownership checks for library copies, edits,
token creation, token revocation, and private/unlisted visibility. The automated production browser pass
reached GitHub credential entry and stopped there. Before completion, run a browser pass while signed in
with GitHub:

- sign in
- create or update profile
- fork an official skill to private library
- edit `SKILL.md`
- save and confirm validation notes
- publish to public profile
- download the public profile skill
- create and revoke a CLI token

See `docs/reviews/authenticated-flow-verification.md` for the current blocker and coverage added while
live auth remains user-assisted.

### Engagement

Stars and comments exist, and comment posting has persisted server-side limits. Public production still
needs moderation hardening before meaningful traffic:

- curator/moderator controls for hiding comments
- reporting or review queue if comments become public-facing at scale
- a dedicated star-toggle action log if star abuse appears in practice

### Performance and caching

Public pages are already small and fast enough for the seed catalog, but the app still needs a measured pass:

- record baseline Lighthouse or Playwright trace for `/skills`, skill detail, and editor
- public API, public registry downloads, and health responses now use explicit shared cache headers
- private library/download/token/user responses remain `no-store` or `private, no-store`
- preload detail routes only after checking that it improves the current layout

### Accessibility

The UI has semantic forms, labels, and icon button labels in core places, but still needs an explicit pass:

- keyboard traversal for registry filters, cards, detail links, and editor controls
- focus style consistency after the focus-ring simplification
- screen reader labels for all icon-only controls
- form error announcement on save/comment/token actions

### Sidebar and filters

Current filters are data-backed and functional, but the layout can feel too split at some desktop widths.
Do not add more filter categories until there is real data. The next design decision is whether to keep
the persistent sidebar, collapse it by default, or move filters into compact controls above the list.

### CLI distribution

The CLI is implemented and tested as the `papiskill` workspace package. Publication to npm is not done.
Before announcing CLI installation broadly, decide whether v1 means:

- local repo install only
- GitHub package/release artifact
- npm publication under the `papiskill` package name
