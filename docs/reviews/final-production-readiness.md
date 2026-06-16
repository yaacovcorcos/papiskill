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
- authenticated editor accessibility and performance passes
- a final decision on the sidebar/filter layout after the user's review
- CLI npm publication is dry-run verified, but the first npm publish is not yet done

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

Public pages are already small and fast enough for the seed catalog, and public registry/detail routes now
have a repeatable browser smoke:

- `npm run perf:public -- --base-url https://papiskill.com` records `/skills`, official skill detail, public API, and public download baselines
- the first production baseline is recorded in `docs/reviews/performance-baseline.md`
- public API, public registry downloads, and health responses now use explicit shared cache headers
- private library/download/token/user responses remain `no-store` or `private, no-store`
- shared header navigation disables automatic route prefetching to avoid unrelated page data and avatar preloads
- authenticated editor performance still needs a signed-in browser pass before calling performance complete
- preload detail routes only after checking that it improves the current layout

### Accessibility

Public pages now have a repeatable accessibility smoke. The authenticated editor still needs a signed-in browser pass:

- shared header now provides a skip-to-content link on AppHeader-backed pages
- public registry search, filters, sort links, cards, and icon actions now share a visible focus style
- `npm run a11y:public -- --base-url https://papiskill.com` checks public route landmarks, `h1`s, skip link behavior, duplicate IDs, unlabeled controls, missing image alt text, and console noise
- the first local baseline is recorded in `docs/reviews/accessibility-baseline.md`
- rendered `SKILL.md` headings are demoted inside product pages so the page title remains the only `h1`
- comment, token, profile, and library-skill save feedback now use explicit live-region roles
- icon-only registry, dashboard, library, edit, comment, copy, and star controls now have explicit target-aware labels
- authenticated screen-reader and editor traversal pass still needed before calling accessibility complete

### Sidebar and filters

Current filters are data-backed and functional. The registry now keeps filters in compact controls until
the viewport is wide enough to show filters, the skill list, and the preview panel together. Do not add
more filter categories until there is real data. The next design decision is whether the extra-wide
sidebar should remain, collapse by default, or move permanently into compact controls above the list.

### CLI distribution

The CLI is implemented and tested as the `papiskill` workspace package. The npm package path is prepared
but not published:

- `npm run cli:pack` builds and dry-runs npm packs for `@papiskill/skill-core` and `papiskill`
- package tarballs exclude compiled test files and include package READMEs
- CI runs the dry-run packaging gate after build
- first npm publication still needs an explicit release decision and npm account/auth confirmation
