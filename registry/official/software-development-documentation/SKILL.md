---
name: software-development-documentation
description: Create source-backed software documentation for codebases, architecture, setup, testing, debugging, deployment, APIs, security, and operations. Use when documenting, auditing, updating, or organizing engineering docs for a software project or repository.
---

# Software Development Documentation

Use this skill when the user wants to create, update, audit, or organize documentation for a software project: repository wiki, architecture docs, setup guide, contributor guide, testing docs, debugging guide, deployment runbook, API overview, security notes, operational docs, or developer onboarding.

This skill is for software development documentation. For company handbooks, policies, people operations, team rituals, or non-code operating knowledge, prefer a company documentation skill.

## Core Judgment

Write docs that help a developer or agent safely understand, change, run, test, and operate the system.

Do not turn the work into template theater. Use the structure below as a map, not a cage. Skip sections that are not supported by source evidence. Add sections when the repo makes them necessary.

Ask questions only when a missing answer changes the output location, audience, privacy boundary, or write permission. Otherwise, inspect the repository, make reasonable assumptions, and label uncertainty.

## Non-Negotiables

- Base factual claims on source evidence.
- Prefer repo-root-relative file paths for code claims.
- Do not invent architecture, commands, environment variables, endpoints, or deployment steps.
- Do not include secret values, private data, customer data, raw logs, or credentials.
- Do not publish, upload, commit, stage, push, or sync generated docs unless the user explicitly asks.
- Keep docs portable across agent setups and developer tools.
- Make it clear when a page is draft, stale, incomplete, or based on weak evidence.

## First Pass

Before writing, inspect the repository enough to understand:

- product purpose
- languages and frameworks
- apps, packages, services, or modules
- entry points
- install, run, build, lint, test, and typecheck commands
- configuration and environment variable names
- data models and storage
- API surfaces
- auth and permission boundaries
- deployment and release paths
- monitoring or support surfaces
- existing documentation style
- repo instructions such as `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/`, `.factory/`, `.codex/`, or equivalent files

Use fast source discovery first. Then read the files that actually establish behavior.

## Output Shape

If the user did not name an output location, prefer a local documentation directory that does not disrupt existing docs:

```text
repo-wiki/
|-- index.md
|-- overview.md
|-- architecture.md
|-- getting-started.md
|-- development-workflow.md
|-- testing.md
|-- debugging.md
|-- configuration.md
|-- data-models.md
|-- dependencies.md
|-- decisions.md
|-- maintainers.md
`-- .wiki-meta.json
```

Add these only when the repository supports them:

```text
api/
deployment.md
security.md
operations.md
observability.md
background.md
troubleshooting.md
cleanup-opportunities.md
```

If the repo already has `docs/`, a GitHub wiki, a MkDocs/Docusaurus site, a README-driven structure, or a company standard, adapt to that structure instead of creating a parallel one.

## Page Guidance

### `index.md`

Write the entry point for humans and agents:

- what the project is
- who uses it
- most important links
- safest first commands
- main source areas
- current doc status and known gaps

### `overview.md`

Explain the system in 3-8 paragraphs:

- product or library purpose
- user-facing or developer-facing capabilities
- important runtime surfaces
- what is out of scope
- links to deeper pages

### `architecture.md`

Explain how the system is put together:

- major components
- how data or control flows between them
- process boundaries
- storage and external services
- important abstractions
- source paths for each claim
- diagrams only when they clarify the structure

### `getting-started.md`

Help a new developer reach a working local state:

- prerequisites
- install commands
- required environment variable names with placeholder values only
- local run commands
- first verification commands
- common first-run failures

Do not claim a command works unless you ran it or clearly mark it as inferred.

### `development-workflow.md`

Document how changes normally move:

- branch or PR expectations
- where to edit common areas
- validation commands
- review expectations
- generated files
- release or merge notes

### `testing.md`

Document the test system:

- test frameworks
- commands
- fixture and mock patterns
- important coverage areas
- known gaps
- how to add a test for common change types

### `debugging.md`

Document how to investigate failures:

- logs and local diagnostics
- common error modes
- useful search commands
- database or service inspection paths
- safe reset steps

Gate destructive reset steps behind explicit user approval.

### `configuration.md`

Document configuration sources:

- environment variable names, never values
- config files
- defaults
- where each config is read
- production versus local differences

### `data-models.md`

Document data shapes:

- database schemas and migrations
- ORM models
- serialized API shapes
- important domain types
- ownership and privacy rules

### `api/`

Create API docs when the repo exposes REST, GraphQL, RPC, WebSocket, CLI, package, plugin, or webhook interfaces.

For each API surface, include:

- purpose
- authentication and authorization expectations
- endpoint, command, function, or event shape
- request and response examples if source-backed
- error behavior
- versioning or compatibility notes
- source paths

For full HTTP API reference work, prefer OpenAPI-compatible structure when possible. If no OpenAPI description exists, do not pretend one does; document the observed source-backed contract and suggest creating one.

### `deployment.md`

Create deployment docs only when source evidence exists:

- hosting platform
- build commands
- migration order
- environment variable names
- release steps
- rollback notes
- smoke checks

### `security.md`

Create security docs when the repo has auth, permissions, tokens, secrets, payments, file access, network calls, personal data, customer data, healthcare data, or other trust boundaries.

Include:

- trust boundaries
- sensitive data types
- auth and authorization checks
- secret handling by name only
- dangerous operations
- review checklist for risky changes

## Freshness and Metadata

For generated documentation sets, write metadata that lets the next maintainer know what happened:

```json
{
  "generatedAt": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "generator": "software-development-documentation skill",
  "commitHash": "FULL_GIT_SHA or unknown",
  "branch": "BRANCH or unknown",
  "mode": "full | incremental | audit",
  "sourceRoots": [],
  "pageCount": 0,
  "warnings": []
}
```

When updating existing docs, prefer incremental changes. Read the existing pages first, preserve useful human-authored context, and update only what changed.

## Quality Review

Before finishing, check:

- every important claim has a source path, command output, or explicit uncertainty label
- commands are marked as verified or inferred
- secret values are absent
- private/runtime/generated paths are not accidentally documented as source truth
- internal links resolve when practical to check
- docs match existing project terminology
- API, deployment, security, and operations sections are included only when source-backed
- the result helps a new developer or agent do real work
- remaining gaps are named plainly

## Final Response

Report:

- output path or files changed
- mode: create, update, audit, or plan
- most important pages created or improved
- verification performed
- unverified assumptions
- sensitive areas avoided
- next documentation gap worth fixing
