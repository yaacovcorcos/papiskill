# Onboarding

Welcome. This guide gets you from "fresh machine" to "your change is in a pull
request" for **PapiSkill** — the registry, editor, and CLI for portable
`SKILL.md` packages.

## How to use this guide

You will be working **with a coding agent** (Claude Code, Codex, Cursor, etc.).
This guide is written to be read and executed **by your agent**, with you
approving the decisions. You do not need prior experience with this project, its
stack, or git — your agent handles the mechanics; you supply intent and say yes.

**Your agent's first move:** read [`AGENTS.md`](../AGENTS.md) at the repo root.
That file is the project's operating contract (stack, directory rules, canonical
commands, quality bar). Everything below assumes those rules.

> **The paths are additive, not exclusive — pick as many as your work touches.**
> Don't set up a database to fix a typo, but don't be shy either.

---

## What do you want to do?

| I want to… | Go to | Needs a database? | Needs login? |
|---|---|---|---|
| Add or edit a **skill** in the registry | [Path A](#path-a--author-or-edit-a-skill) | No | No |
| Improve **documentation** | [Path B](#path-b--improve-documentation) | No | No |
| Work on the **CLI** (`papiskill`) | [Path C](#path-c--work-on-the-cli) | No | No |
| Work on the **web app** (site, API, editor, dashboard) | [Path D](#path-d--work-on-the-web-app-and-the-full-project-setup) | Yes | Only for auth/dashboard work |
| **Work across the whole project** (any/all of the above) | [Path E](#path-e--full-project-collaborator) | Yes | Recommended |

> **Working on everything?** Go to [Path E](#path-e--full-project-collaborator).
> The environment is layered and the full setup is a superset — do it once and
> you're equipped for skills, docs, CLI, and app work alike.

Every path ends at the same place: [Ship it](#ship-it--git--pull-request) and
[Definition of done](#definition-of-done).

---

## Preflight (everyone, once)

Have your agent run these checks and fix anything that fails. They're safe to
re-run.

```bash
node --version                          # must be >= 22.12.0
npm --version                           # must be >= 10
git --version                           # any recent version
gh auth status                          # GitHub CLI — logged in?
gh repo view yaacovcorcos/papiskill     # confirms your access actually works
```

**Remediation, if your agent reports a gap:**

- **Node too old or missing** → install Node 22 LTS (your agent will pick the
  right method for your OS — `nvm`, the official installer, or a package
  manager).
- **`gh` not installed or "not logged in"** → install the GitHub CLI, then
  `gh auth login` and follow the browser prompt. This is what connects GitHub to
  your environment so you can push branches and open PRs.
- **`gh repo view …` fails with "Not Found" or a permission error** → your
  collaborator invite isn't active yet. Accept the invite in your email/GitHub
  notifications, or ask a maintainer to add you, then re-run it.

**Get the code, then branch before you touch anything:**

```bash
git clone https://github.com/yaacovcorcos/papiskill.git
cd papiskill
npm install
git checkout -b <type>/<short-description>   # e.g. feat/add-x-skill, fix/cli-typo
```

You have write access, so you work on a **branch in this repo** (not a fork).
Branch *first* — make your changes on the branch, never on `main`. The commit +
PR steps come later in [Ship it](#ship-it--git--pull-request).

---

## Path A — Author or edit a skill

The lightest path. **No database, no login, no app server.** A skill is just a
portable folder.

A package looks like this (see [`docs/authoring-skills.md`](./authoring-skills.md)
for the full field reference and [`docs/architecture/skill-package-spec.md`](./architecture/skill-package-spec.md)
for the spec):

```text
registry/official/<skill-id>/
  skill.yml      # registry manifest (id, name, summary, version, license, …)
  SKILL.md       # the skill itself, with minimal runtime frontmatter
  docs/          # optional
```

**The best starting point is a working example.** Have your agent read an
existing one — e.g. `registry/official/code-review/` — and mirror its shape.

**Steps:**

```bash
# 1. (if not done) install dependencies
npm install

# 2. create or edit your skill folder under registry/official/<skill-id>/
#    (community submissions go under registry/community/<skill-id>/)

# 3. validate structure and security
npm run registry:validate

# 4. regenerate the web registry index and COMMIT the result
npm run registry:generate
```

> **Don't skip step 4.** CI fails the build if the generated registry index is
> stale (it runs `git diff --exit-code` on the generated file). Run
> `npm run registry:generate` and commit whatever it changes.

**Quality bar for skills:** state when to use it, expected inputs/outputs, safety
boundaries, and required tools. **Never** include secret values, private URLs, or
unexplained shell commands. Globally published (`registry/official`) skills
require collaborator approval in review.

Then go to [Ship it](#ship-it--git--pull-request).

---

## Path B — Improve documentation

Docs live in [`docs/`](./). They're product surface — keep them accurate.

```bash
npm install
# edit the relevant .md files
npm run lint     # optional but nice for any code/config you touched
```

No database, server, or login needed. Then go to
[Ship it](#ship-it--git--pull-request).

---

## Path C — Work on the CLI

The `papiskill` CLI lives in [`packages/cli`](../packages/cli) and shares parsing
and validation with [`packages/skill-core`](../packages/skill-core). **No
database or login needed** — it talks to the registry API over HTTP.

```bash
npm install

# run the CLI in dev (everything after -- is passed to the CLI)
npm --workspace papiskill run dev -- search review
npm --workspace papiskill run dev -- info official/code-review

# run the test suite
npm test

# verify it still packages cleanly for npm
npm run cli:pack
```

By default the CLI points at production. To point it at a local web app instead,
set `PAPISKILL_API_URL=http://localhost:3000` (see Path D to run that app).
See [`docs/cli.md`](./cli.md) for the full command list. Then go to
[Ship it](#ship-it--git--pull-request).

---

## Path D — Work on the web app (and the full-project setup)

This is the heaviest path: Next.js + React + Prisma + Postgres + Better Auth.
**It's also the complete environment** — if you'll work across skills, docs, the
CLI, and the app, do this once and you're set for all of them. (The earlier
paths only ever add `npm install`, which is included here.)

### D1. Environment file

```bash
cp .env.example .env.local
```

> **It must be `.env.local`, not `.env`.** The app and Prisma both load
> `.env.local` (`apps/web/prisma.config.ts` reads it explicitly). It's
> git-ignored, so your secrets stay local. You'll fill in database and
> (optionally) GitHub OAuth values below.

### D2. Local database (Postgres, installed natively)

Install PostgreSQL on your machine — your agent will pick the right method for
your OS (e.g. **Postgres.app** or Homebrew on macOS, the official installer on
Windows, your package manager on Linux). Then create the database:

```bash
createdb papiskill
```

Now point `.env.local` at *your* server. **The `.env.example` defaults assume a
two-server Docker layout and will not work with a single native install** — fix
these three values:

- `DATABASE_URL` and `DIRECT_URL` → your local connection, e.g.
  `postgresql://<you>@localhost:5432/papiskill` (a native Postgres usually has no
  `postgres:postgres` password — use your OS user, no password).
- `SHADOW_DATABASE_URL` → **delete it / leave it unset.** The example points at
  port `5433`, a second server you don't have. With it unset, Prisma
  automatically creates and drops a temporary shadow database on your one server
  during migrations. (Only set it — to a real `papiskill_shadow` DB on the same
  server — if your Postgres user can't create databases.)

Apply the schema and generate the Prisma client:

```bash
npm run db:generate
npm run db:migrate      # creates the tables
```

> If you only need **public pages** (not the dashboard), the app can render from
> the generated registry fallback without a database. Deeper details — table
> ownership, migration rules — are in
> [`docs/runbooks/db-architecture.md`](./runbooks/db-architecture.md).

### D3. Login (only if you touch auth, dashboard, profiles, or forks)

Most app work (public pages, skill browsing, the editor's rendering) does **not**
require login. If your change involves authenticated flows, create your **own**
free GitHub OAuth app — we don't share credentials:

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. **Homepage URL:** `http://localhost:3000`
3. **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Put the generated client ID/secret into `.env.local` as `GITHUB_CLIENT_ID` /
   `GITHUB_CLIENT_SECRET`.
5. Set a session secret: `BETTER_AUTH_SECRET=$(openssl rand -base64 32)`.

Details and rules: [`docs/runbooks/auth.md`](./runbooks/auth.md).

### D4. Run it

```bash
npm run dev
# open http://localhost:3000
# health check: curl http://localhost:3000/api/v1/health
```

Then go to [Ship it](#ship-it--git--pull-request).

---

## Path E — Full-project collaborator

If you'll work across skills, docs, the CLI, **and** the app, you don't pick a
lane — you set up the whole thing once. The setup is layered: Paths A, B, and C
need nothing beyond `npm install`, and Path D adds everything else, so **Path D's
setup is the complete environment.** Do this, in order:

1. **[Preflight](#preflight-everyone-once)** — tools, access check, clone,
   `npm install`, and create your branch.
2. **[Path D, all of it](#path-d--work-on-the-web-app-and-the-full-project-setup)**
   — `.env.local`, local Postgres, migrations, OAuth (do D3 too, since you'll
   touch authenticated flows), and `npm run dev`.

That's it — you now have what every path needs. From here, use each path as a
**reference for its workflow**, not its setup:

- skills → [Path A](#path-a--author-or-edit-a-skill) (remember
  `npm run registry:generate` + commit the result)
- docs → [Path B](#path-b--improve-documentation)
- CLI → [Path C](#path-c--work-on-the-cli) (point it at your local app with
  `PAPISKILL_API_URL=http://localhost:3000`)

Then [Ship it](#ship-it--git--pull-request) and run the full
[Definition of done](#definition-of-done) — as a cross-cutting contributor,
`npm run check` is your default before every PR.

---

## Ship it — git & pull request

You already created your branch in [Preflight](#preflight-everyone-once). Now
commit, push it, and open a PR. Ask your agent to do this; the canonical
sequence is:

```bash
git add -A
git commit -m "feat: add X skill"              # conventional commit message
git push -u origin HEAD
gh pr create --fill                            # opens the pull request
```

> Didn't branch yet, or still on `main`? `git checkout -b <type>/<short-description>`
> first — don't commit to `main`.

**Conventions that matter:**

- **`main` is the canonical branch** — branch off it and target it with your PR.
- **Conventional commit messages** — `feat:`, `fix:`, `docs:`, `test:`,
  `chore:`, etc.
- **Keep changes scoped.** Inspect `git status` before committing so nothing
  stray rides along. Never commit secrets or local env files.
- **Update docs in the same change** when you change schema, CLI commands,
  package format, auth, install behavior, or the contribution flow.

---

## Definition of done

Before you ask for review, the quality gate must pass. From the repo root:

```bash
npm run check
```

That runs registry validation → typecheck → lint → tests → build. It's your
main local gate. **CI runs all of that plus a few extra checks**, so green
locally usually means green on the PR — but be aware CI also runs:

- `npm audit --audit-level=high` — no high-severity dependency vulnerabilities
- a **registry-freshness** check — fails if `npm run registry:generate` would
  change the committed index (so run it and commit the result when you touch
  skills)
- `npm run cli:pack` — the CLI still packages cleanly for npm

You can run any of these locally too if a CI step fails. For light changes,
iterate with the relevant subset (`npm run registry:validate` for skills,
`npm run lint` for docs), but `npm run check` is the finish line for anything
that touches code.

A change is done when:

- [ ] `npm run check` passes (or the relevant gate for skill/doc-only changes)
- [ ] commit messages are conventional and changes are scoped
- [ ] docs are updated if behavior changed
- [ ] a PR is open against `main`

---

## Guardrails

- **Put code where it belongs** (from `AGENTS.md`): web app → `apps/web`; CLI →
  `packages/cli`; shared schema/validation → `packages/skill-core`; curated
  skills → `registry/official`; docs → `docs/`. You're welcome to work across
  all of these over time — this is about *where each change lands*, and about
  keeping a *single* PR scoped to one coherent thing, not about limiting what
  you contribute to.
- **High-trust areas need review:** anything touching authentication, ownership,
  privacy, API tokens, or private forks. Don't loosen these; flag them.
- **Public pages must work without login.** Mutating profile/fork/token/private
  actions must require authenticated ownership.
- **Tests prove the risk that changed** — bug fixes need a regression test (or a
  written reason in the PR). See [`docs/runbooks/testing.md`](./runbooks/testing.md).

---

## Glossary (for the unfamiliar)

- **Skill package** — a portable folder (`skill.yml` + `SKILL.md`) describing one
  agent skill. The product's core unit.
- **Monorepo / npm workspace** — one repo holding several packages (`apps/web`,
  `packages/cli`, `packages/skill-core`) that share dependencies. Run commands
  from the repo root; `--workspace <name>` targets one package.
- **Prisma** — the tool that maps the Postgres database to TypeScript.
  `db:generate` builds the client; `db:migrate` changes the schema.
- **Better Auth + GitHub OAuth** — how users log in (via their GitHub account).
- **The registry** — the collection of curated/community skills under
  `registry/`, served by the web app and the CLI.
- **CI / the check gate** — automated checks (`npm run check`) that run on every
  pull request and must pass before merge.

---

## Where to get help

- **Project rules & commands:** [`AGENTS.md`](../AGENTS.md)
- **Repo map & entry points:** [`README.md`](../README.md)
- **How to contribute:** [`docs/contributing.md`](./contributing.md)
- **Runbooks:** [`docs/runbooks/`](./runbooks/) (auth, database, testing,
  registry operations, release)
- **Stuck?** Tell your agent exactly what command failed and paste the full
  error — then ask it to consult the relevant runbook above before retrying.
- **Decisions / scope questions:** open a draft PR or ask a project maintainer.
