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

Status: in progress

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

### 2. Skill Core

Status: pending

Deliverables:

- `skill.yml` schema
- `SKILL.md` parser
- package validator
- security warning classifier
- install target resolver
- registry filesystem loader
- tests

### 3. Web Backend

Status: pending

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

### 4. Web Frontend

Status: pending

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

### 5. CLI

Status: pending

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

### 6. Docs

Status: pending

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

### 7. Production Readiness

Status: pending

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

## Open Defaults

The user left; defaults are active unless later corrected:

- repo name: `papiskill`
- visibility: public
- brand: `PapiSkill`
- global registry path: `registry/official`
- public profile publishing: allowed immediately
- private CLI install: included in v1
- license: MIT
