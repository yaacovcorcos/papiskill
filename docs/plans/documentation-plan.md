# Documentation Plan

## Goal

Make PapiSkill unusually well documented for users, skill authors, contributors, operators, and future agents.

## Required Docs

| Document | Status | Purpose |
|---|---|---|
| `README.md` | current | top-level orientation |
| `AGENTS.md` | current | agent and maintainer operating contract |
| `docs/product/prd.md` | current | product definition and scope |
| `docs/architecture/overview.md` | current | system architecture |
| `docs/architecture/skill-package-spec.md` | current | package format |
| `docs/architecture/decision-log.md` | current | architecture decisions |
| `docs/runbooks/db-architecture.md` | current | DB schema and invariants |
| `docs/runbooks/auth.md` | current | Better Auth/GitHub OAuth setup |
| `docs/runbooks/registry-operations.md` | current | indexing and contribution operations |
| `docs/runbooks/release.md` | current | local and Vercel release process |
| `docs/runbooks/security-baseline.md` | current | threat model and security gates |
| `docs/cli.md` | current | CLI usage |
| `docs/authoring-skills.md` | current | skill author guide |
| `docs/contributing.md` | current | contributor workflow |

`current` means the document exists and matches the implemented v1 surface at the
time of review. It does not mean the product itself is final.

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
