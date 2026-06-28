# Production Build Plan

## Objective

Build PapiSkill end to end as a production-ready open-source registry, editor, and CLI for portable `SKILL.md` packages.

## Product Scope

Required:

- public registry for globally published and public community/user skills
- GitHub OAuth login
- user profiles
- public and private personal forks
- in-browser editor with validation and preview
- download/export for single-file and folder skills
- Git-backed curator-published global registry
- contribution path through GitHub PRs
- flexible CLI in v1
- Vercel deployment for `papiskill.com`
- production docs, tests, CI, and release runbooks

## Architecture Decisions

- Use Supabase Postgres with Prisma.
- Use Better Auth with GitHub OAuth.
- Do not use Supabase Auth.
- Use Git as source of truth for curator-published global and Git-reviewed registry packages.
- Use Postgres for user profiles, forks, tokens, stars, downloads, validation results, and indexed search metadata.
- Use API routes for CLI access.
- Use hashed API tokens for authenticated CLI access to private forks.

## Slices

### 1. Repository Foundation

Status: complete

Deliverables:

- root git repository
- npm workspace structure
- app/package boundaries
- agent constitution
- docs/runbook skeleton
- active plan files

Evidence:

- `package.json`
- `AGENTS.md`
- `docs/plans/*`
- `.github/workflows/check.yml`

### 2. Skill Core

Status: implemented; keep extending with package-format changes

Deliverables:

- `skill.yml` schema
- `SKILL.md` parser
- package validator
- security warning classifier
- install target resolver
- registry filesystem loader
- tests

Evidence:

- `packages/skill-core/src/schema.ts`
- `packages/skill-core/src/validation.ts`
- `packages/skill-core/src/install-targets.ts`
- `packages/skill-core/src/registry-loader.ts`
- `packages/skill-core/src/validate-registry.ts`
- `packages/skill-core/src/*.test.ts`

### 3. Web Backend

Status: implemented; needs final readiness audit before goal completion

Deliverables:

- Prisma schema and migration
- lazy Prisma client
- Better Auth GitHub OAuth
- profile and skill services
- registry indexer
- public API routes
- authenticated API token routes
- ownership checks
- tests

Evidence:

- `apps/web/prisma/schema.prisma`
- `apps/web/prisma/migrations/*`
- `apps/web/src/lib/server/*`
- `apps/web/src/app/api/v1/*`
- `apps/web/scripts/index-registry.ts`
- `apps/web/src/app/skills/engagement-actions.ts`
- `apps/web/src/lib/server/*.test.ts`

### 4. Web Frontend

Status: implemented; needs continued UX review on sidebar, editing, and performance

Deliverables:

- polished public registry
- search and filters
- skill detail pages
- profile pages
- dashboard
- fork/edit/preview/validate/download workflow
- token management
- contribution docs and GitHub handoff
- responsive desktop/mobile design

Evidence:

- `apps/web/src/app/skills/*`
- `apps/web/src/app/skills/[...reference]/page.tsx`
- `apps/web/src/app/u/[handle]/*`
- `apps/web/src/app/dashboard/*`
- `apps/web/src/app/docs/*`
- `apps/web/src/components/*`
- `docs/reviews/ui-verification.md`

### 5. CLI

Status: implemented; npm publication still requires release credentials/process

Deliverables:

- `papiskill search`
- `papiskill info`
- `papiskill install`
- `papiskill download`
- `papiskill validate`
- `papiskill login`
- `papiskill whoami`
- `papiskill logout`
- install target flexibility for Codex, Claude Code, Cursor, and custom paths
- tests

Evidence:

- `packages/cli/src/index.ts`
- `packages/cli/src/install.ts`
- `packages/cli/src/api.ts`
- `packages/cli/src/*.test.ts`
- `docs/cli.md`

### 6. Docs

Status: current for implemented v1 surface; keep updated with behavior changes

Deliverables:

- product docs
- contributor guide
- skill authoring guide
- package spec
- CLI docs
- API docs
- DB runbook
- auth runbook
- release runbook
- security baseline
- operating docs for maintainers

Evidence:

- `README.md`
- `docs/product/prd.md`
- `docs/architecture/*`
- `docs/runbooks/*`
- `docs/cli.md`
- `docs/authoring-skills.md`
- `docs/contributing.md`
- `docs/plans/product-backlog.md`

### 7. Production Readiness

Status: in progress

Deliverables:

- CI workflow
- full local validation
- self-review report
- browser verification
- performance pass
- accessibility pass
- security pass
- GitHub repo created on personal account
- remote pushed
- Vercel project configured
- domain plan for `papiskill.com`

Evidence:

- `.github/workflows/check.yml`
- `npm run check`
- `npm audit`
- `docs/reviews/initial-readiness.md`
- `docs/reviews/ui-verification.md`
- `docs/runbooks/release.md`
- `docs/runbooks/deployment-access.md`
- live production health: `https://papiskill.com/api/v1/health`

Remaining before marking the overall goal complete:

- Record a final requirement-by-requirement readiness audit in `docs/reviews/final-production-readiness.md`.
- Re-test the authenticated editing/library/token flows against production or a production-like database.
- Run an explicit accessibility and performance pass on the public registry and editor.
- Decide the sidebar/filter redesign questions captured in `docs/plans/product-backlog.md`.
- Confirm CLI publication/distribution expectations, or document that v1 CLI is repo/local install until npm credentials are available.

## Open Defaults

The user left; defaults are active unless later corrected:

- repo name: `papiskill`
- visibility: public
- brand: `PapiSkill`
- global registry path: `registry/official`
- public profile publishing: allowed immediately
- private CLI install: included in v1
- license: MIT
