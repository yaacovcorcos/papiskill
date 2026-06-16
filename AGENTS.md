# PapiSkill Agent Constitution

This file is the always-loaded operating contract for this repository.

## Product

PapiSkill is a production registry, editor, and CLI for portable `SKILL.md` packages. The app is for any agent setup, not only Codex.

The product promise is:

> Discover, fork, edit, install, and contribute high-quality agent skills.

## Stack

- Next.js App Router in `apps/web`
- React 19
- TypeScript
- Prisma with Postgres
- Supabase Postgres for deployed database
- Better Auth with GitHub OAuth as identity authority
- Vercel deployment for `papiskill.com`
- npm workspaces
- `packages/skill-core` for portable skill schema and validation
- `packages/cli` for the `papiskill` command

## Directory Rules

- Web app code lives in `apps/web`.
- CLI code lives in `packages/cli`.
- Shared skill parsing, schema, validation, and install target logic lives in `packages/skill-core`.
- Globally published curated skills live in `registry/official`.
- Community Git-reviewed skills may live in `registry/community`.
- Runtime user forks live in Postgres, not in the registry directories.
- Plans live in `docs/plans`.
- Runbooks live in `docs/runbooks`.
- Architecture decisions live in `docs/architecture`.

## Canonical Commands

Run from repo root unless a command says otherwise.

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev app | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |
| Full check | `npm run check` |
| Prisma generate | `npm run db:generate` |
| Prisma migrate dev | `npm run db:migrate` |
| Prisma migration status | `npm run db:status` |
| Prisma migrate production | `npm run db:deploy` |
| Validate registry | `npm run registry:validate` |

## Quality Bar

- The app must be fast, calm, professional, minimal, and clear.
- Do not hide product complexity in giant pages. Split routes and components by workflow.
- Public pages must be useful without login.
- Mutating profile, fork, token, and private skill actions must require authenticated ownership.
- Globally published skills are collaborator-published and visible in the main registry. User profile skills can be public or private by user choice.
- The CLI is part of v1, not an afterthought.
- Docs are product surface. Keep them accurate when behavior changes.

## Auth and Data

- Better Auth is the identity authority.
- Supabase Auth is not used.
- GitHub OAuth is the primary login provider.
- App DB rows must enforce ownership in server code.
- Private forks and tokens must never be exposed through public routes.
- API tokens are hashed at rest.

## Skill Package Contract

- A skill package is a directory with `skill.yml` and `SKILL.md`.
- Additional files are allowed under `scripts/`, `assets/`, `examples/`, and `docs/`.
- The package format must remain portable across Codex, Claude Code, Cursor, and generic agent setups.
- Validation must distinguish structure warnings from security warnings.

## Git Workflow

- Root `main` is the canonical branch.
- Do not commit generated secrets or local env files.
- Use conventional commit messages.
- Before pushing delivery work, run `npm run check`.
- Keep commits scoped and inspect `git status` before every commit.

## Documentation Obligation

Update relevant docs in the same change when you change:

- schema or migrations
- CLI commands
- package format
- auth or permissions
- install behavior
- deployment requirements
- registry contribution flow
