# PapiSkill Web App

This is the Next.js web application for [PapiSkill](https://papiskill.com), a registry, editor, and CLI for portable `SKILL.md` agent-skill packages.

The web app handles:

- public skill discovery and detail pages
- official and community registry packages
- GitHub-authenticated profiles
- private, unlisted, and public personal library skills
- in-browser skill editing and validation
- skill downloads
- stars, comments, and download tracking
- API routes consumed by the `papiskill` CLI

This app is part of the [PapiSkill monorepo](../../README.md). Run commands from the repository root unless a command explicitly says otherwise.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Postgres through Prisma 7 |
| Production DB | Supabase Postgres |
| Auth | Better Auth with GitHub OAuth |
| Markdown | `react-markdown` and `remark-gfm` |
| Tests | Vitest plus public accessibility and performance smoke scripts |
| Hosting | Vercel |

Shared skill parsing and validation lives in [`packages/skill-core`](../../packages/skill-core). The terminal client lives in [`packages/cli`](../../packages/cli).

## Prerequisites

- Node.js `>=22.12.0`
- npm `>=10.0.0`
- a Postgres database for full local auth, library, and engagement behavior
- a GitHub OAuth app for local sign-in

Public registry pages can still render from the generated registry fallback when database access is unavailable, but authenticated flows require `DATABASE_URL`.

## Quick Start

From the repository root:

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run registry:generate
npm run dev
```

Open:

```text
http://localhost:3000
```

If this is the first time using a local database, run migrations before using authenticated library/profile flows:

```bash
npm run db:migrate
```

## Environment

Local environment is read from the repository-level `.env.local`.

Start from:

```text
.env.example
```

Required for full local behavior:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-random-secret
GITHUB_CLIENT_ID=replace-with-github-oauth-client-id
GITHUB_CLIENT_SECRET=replace-with-github-oauth-client-secret
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/papiskill
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/papiskill
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/papiskill_shadow
PAPISKILL_API_URL=http://localhost:3000
```

Do not commit `.env.local`, production URLs with credentials, OAuth secrets, API tokens, or database passwords.

## GitHub OAuth

Create a GitHub OAuth app for local sign-in:

```text
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

The user-facing sign-in button starts at:

```text
/auth/github
```

Better Auth handles the OAuth callback under:

```text
/api/auth/callback/github
```

If GitHub OAuth or database env vars are missing, public pages should still work, but sign-in redirects back to the sign-in page with an explanatory reason.

## Common Commands

Run from the repository root:

| Task | Command |
|---|---|
| Start dev server | `npm run dev` |
| Generate Prisma client | `npm run db:generate` |
| Run local migrations | `npm run db:migrate` |
| Check migration status | `npm run db:status` |
| Open Prisma Studio | `npm run db:studio` |
| Generate static registry fallback | `npm run registry:generate` |
| Validate registry packages | `npm run registry:validate` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |
| Full quality gate | `npm run check` |

The full quality gate runs registry validation, generated registry refresh, Prisma generation, typecheck, lint, tests, and a production build.

## Registry Data

Official curated skill packages live in:

```text
registry/official/<skill-id>/
```

Each package must contain:

```text
skill.yml
SKILL.md
```

Optional package folders include:

```text
docs/
examples/
scripts/
assets/
```

The generated registry fallback used by public pages lives at:

```text
apps/web/src/lib/server/generated-registry.ts
```

After changing registry packages, run:

```bash
npm run registry:validate
npm run registry:generate
```

Production can also index registry packages into Postgres for search metadata, engagement counts, and DB-backed catalog reads:

```bash
npm --workspace @papiskill/web run registry:index
```

Official registry package files are the source of truth for official skills. Postgres stores indexed metadata, user profiles, personal library skills, comments, stars, downloads, API tokens, and auth state.

## Project Layout

```text
apps/web/
  prisma/             Prisma schema and migrations
  scripts/            Registry generation and public smoke scripts
  src/app/            App Router pages, layouts, server actions, and route handlers
  src/components/     Shared UI components
  src/lib/            Client-safe utilities and shared helpers
  src/lib/server/     Server-only catalog, auth, ownership, library, API, and DB logic
```

Important source areas:

| Path | Purpose |
|---|---|
| `src/app/skills` | Public registry list, filters, cards, detail layouts, and engagement actions |
| `src/app/dashboard` | Authenticated profile, library, fork, token, and editor flows |
| `src/app/api/v1` | Public and authenticated API routes used by the web app and CLI |
| `src/components/skill-markdown.tsx` | Rendered `SKILL.md` display |
| `src/components/skill-markdown-editor.tsx` | In-browser skill editor |
| `src/lib/server/catalog.ts` | Public catalog and registry lookup behavior |
| `src/lib/server/library.ts` | User library and copy/fork source behavior |
| `src/lib/server/engagement.ts` | Stars, comments, and moderation behavior |
| `src/lib/server/visibility.ts` | Public/private/unlisted visibility rules |
| `src/lib/server/generated-registry.ts` | Generated file-backed public registry fallback |

## Important Routes

Public pages:

```text
/
/skills
/skills/official/[slug]
/skills/community/[slug]
/u/[handle]
/u/[handle]/skills/[slug]
/download/[...reference]
/authors
/docs
```

Authenticated pages:

```text
/dashboard
/dashboard/library
/dashboard/library/[id]/edit
/dashboard/profile
/dashboard/fork
/dashboard/skills/[id]/edit
```

API routes:

```text
/api/v1/health
/api/v1/skills
/api/v1/skills/[...reference]
/api/v1/me
/api/v1/account
/api/v1/engagement/[...reference]
```

Auth routes:

```text
/auth/github
/auth/sign-in
/api/auth/[...all]
```

## Testing

Run all tests:

```bash
npm run test
```

Run the full pre-push gate:

```bash
npm run check
```

Public accessibility smoke:

```bash
npm run a11y:public -- --base-url http://localhost:3000
```

Public performance smoke:

```bash
npm run perf:public -- --base-url http://localhost:3000
```

Testing expectations:

- test the real risk changed
- use route/API tests for HTTP contracts
- use server tests for auth, ownership, and visibility
- use component tests for rendered UI behavior
- add a regression test for bug fixes when practical
- do not mock local validation, ownership, serialization, or install-target logic just to make tests easier

## Development Rules

- Public pages must be useful without login.
- Mutations must derive the user from the server session.
- Private and unlisted library skills must never leak through public routes.
- API tokens must be hashed at rest and shown only once.
- Official skills come from `registry/official`, not direct database edits.
- User-owned editable skills live in Postgres as `SkillFork` rows.
- Do not execute skill scripts in the web app.
- Preserve registry namespaces: `community/<slug>` must not silently fall back to `official/<slug>`.
- Keep `generated-registry.ts` committed when registry packages change.
- Update docs when schema, auth, CLI/API contracts, package format, install behavior, or deployment requirements change.

## Deployment

Production is deployed to Vercel:

```text
https://papiskill.com
```

Production uses Supabase Postgres and Better Auth with GitHub OAuth.

Vercel does not run Prisma migrations automatically. Before deploying schema-dependent code, apply production migrations with the intended production database connection:

```bash
npm run db:status
npm run db:deploy
```

See the release runbook before production deploys:

```text
docs/runbooks/release.md
```

## More Documentation

- [Root README](../../README.md)
- [Agent Constitution](../../AGENTS.md)
- [PapiSkill PRD](../../docs/product/prd.md)
- [Architecture Overview](../../docs/architecture/overview.md)
- [Skill Package Specification](../../docs/architecture/skill-package-spec.md)
- [Database Architecture](../../docs/runbooks/db-architecture.md)
- [Auth Runbook](../../docs/runbooks/auth.md)
- [Registry Operations](../../docs/runbooks/registry-operations.md)
- [Testing Runbook](../../docs/runbooks/testing.md)
- [Release Runbook](../../docs/runbooks/release.md)
- [Security Baseline](../../docs/runbooks/security-baseline.md)
- [API Docs](../../docs/api.md)
- [CLI Docs](../../docs/cli.md)
