# Documentation Plan

## Goal

Make PapiSkill unusually well documented for users, skill authors, contributors, operators, and future agents.

## Required Docs

| Document | Status | Purpose |
|---|---|---|
| `README.md` | started | top-level orientation |
| `AGENTS.md` | started | agent and maintainer operating contract |
| `docs/product/requirements.md` | pending | product definition and scope |
| `docs/architecture/overview.md` | pending | system architecture |
| `docs/architecture/skill-package-spec.md` | pending | package format |
| `docs/architecture/decision-log.md` | pending | architecture decisions |
| `docs/runbooks/db-architecture.md` | pending | DB schema and invariants |
| `docs/runbooks/auth.md` | pending | Better Auth/GitHub OAuth setup |
| `docs/runbooks/registry-operations.md` | pending | indexing and contribution operations |
| `docs/runbooks/release.md` | pending | local and Vercel release process |
| `docs/runbooks/security-baseline.md` | pending | threat model and security gates |
| `docs/cli.md` | pending | CLI usage |
| `docs/authoring-skills.md` | pending | skill author guide |
| `docs/contributing.md` | pending | contributor workflow |

## Documentation Rules

- Every public workflow gets user docs.
- Every operator workflow gets a runbook.
- Every schema/package invariant gets architecture docs.
- Every major tradeoff gets a decision-log entry.
- Docs should include commands that actually work in this repo.
- Factual claims about code should cite repo-root-relative paths.
- Avoid publishing private/runtime data, secrets, raw logs, local memory, or generated credentials.
- Every docs directory that grows into a section should have an `index.md`.
- Source-backed wiki-style pages should include key source files, how to change the subsystem, related pages, and verification notes.
- Before final handoff, verify internal Markdown links, mentioned source paths, and secret scans.

## Source-Backed Wiki Policy

PapiSkill adopts the useful parts of the local `repo-wiki` skill:

- survey repo instructions, package files, entry points, tests, CI, deployment config, and docs before writing broad documentation
- keep docs local/source-backed by default
- use the repo's own vocabulary for sections
- include deployment, security, API, monitoring, and cleanup docs only when source evidence supports them
- generate practical contributor docs rather than promotional prose
- state uncertainty plainly when source evidence is incomplete
