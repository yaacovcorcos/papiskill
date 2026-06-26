---
name: code-review
description: Review local code changes for bugs, regressions, missing tests, and risky assumptions. Use when asked to review a diff, pull request, patch, branch, commit, or uncommitted workspace changes before merge, commit, deploy, or promotion.
---

# Code Review

Use this skill when the user asks to review a pull request, branch diff, commit, patch, staged changes, unstaged changes, untracked local work, or any code change before merge, commit, deploy, or promotion.

This skill reviews changed code. For whole-repository architecture and quality debt, use a codebase quality audit. For a dedicated threat model or full security scan, use a security review.

## Getting Started

First understand what changed and why.

When available, inspect:

- the user's request, PR description, linked issue, ticket, or acceptance criteria
- the current branch, base branch, and whether the workspace is staged, unstaged, or untracked
- the changed files and the relevant unchanged code around them
- tests, migrations, generated files, config, docs, and package or lockfile changes touched by the diff

Prefer existing diff artifacts when the user supplies them. Otherwise compute the smallest truthful diff for the situation, such as staged changes, unstaged changes, a branch against its merge base, or the pasted patch. If there are no git changes, review the files the user named or the files changed earlier in the conversation.

## Review Stance

Lead with findings. A review is useful when it catches real risk, not when it proves the reviewer read every line.

Prioritize:

- bugs and behavioral regressions
- user-visible failures
- data loss or data corruption
- missing authorization or privacy leaks
- unsafe handling of secrets, credentials, files, network calls, or external services
- concurrency, ordering, caching, and state bugs
- migration, rollback, deploy, or compatibility hazards
- missing or weak tests for changed behavior
- CI, lint, typecheck, coverage, or workflow weakening
- duplicated or reimplemented logic that should use an existing local abstraction
- complexity that will likely cause future bugs

Do not block on taste, formatting, naming, or broad refactors unless they create real maintainability or correctness risk. If a point is optional, mark it as a nit or mention it after findings.

## High-Signal Bug Patterns

Use these as prompts for analysis, not as a mechanical checklist.

Look especially for:

- unchecked nulls, missing map keys, failed lookups, or unsafe optional relationship access
- wrong-variable bugs, shadowing, inverted conditions, and `and` versus `or` mistakes in permission or validation logic
- async work that is started but not awaited when its result or side effect matters
- stale, duplicated, or redundant state that can drift from the source of truth
- API, serializer, schema, migration, pagination, cursor, or response-shape contract mismatches
- non-atomic read-modify-write behavior, ordering races, cache invalidation mistakes, and TOCTOU patterns
- unclosed resources, missing cleanup, event listener leaks, and unbounded data structures
- unsafe user-controlled input in SQL, process execution, templates, URLs, redirects, file paths, or HTML
- OAuth, CSRF, session, ownership, and authorization invariants weakened by the change
- hot-path bloat, repeated network or database calls, missed concurrency for independent work, or N+1 behavior
- dead production code, unused imports, unreachable branches, and declared-but-unused functions that suggest an incomplete refactor

## Choose the Review Mode

Adapt to the change surface.

### Pull Request or Base-Branch Review

Use when reviewing work intended for merge.

Check:

- the PR intent, issue, ticket, or user request if available
- changed files and surrounding code
- tests and CI status if available
- docs, migrations, generated files, and config changes
- whether the diff is coherent or mixes unrelated work

### Local Workspace Review

Use when reviewing dirty local changes before commit or promotion.

Check:

- branch and dirty-worktree state
- staged, unstaged, and untracked files
- which changes appear user-owned, generated, unrelated, or part of the requested batch
- whether a coherent commit or PR shape exists

Do not stage, commit, push, discard, or rewrite local work unless the user explicitly asks.

### Commit or Patch Review

Use when reviewing a single historical commit, patch file, or pasted diff.

Check:

- what the commit changes
- whether the change is internally complete
- whether follow-up commits are needed to understand the final state
- whether the patch applies assumptions not visible in the provided context

### Agent-Generated Change Review

Use this mode when an AI agent produced or substantially edited the change.

Be extra suspicious of:

- tests removed, skipped, weakened, or rewritten to match the new behavior without proving it
- CI steps made conditional or non-blocking
- copied patterns that ignore a better existing helper
- duplicated validators, clients, hooks, schemas, or business rules
- confident-looking code that misses product context, incident history, or operational constraints
- broad rewrites that hide a small intended change
- generated docs that claim behavior was verified when it was not

The code looking clean is not proof that the behavior is correct.

## Review Passes

Use judgment. Do not mechanically force every pass when the change is tiny, but do not skip a relevant pass because the diff is pleasant to read.

### 1. Intent and Scope

- What is the change trying to accomplish?
- Does the implementation match that intent?
- Is this change appropriate for this codebase now?
- Is unrelated churn mixed in?
- Are generated, vendored, lockfile, or formatting changes hiding functional changes?

### 2. Functionality

- Does the code do what users, callers, or operators need?
- What edge cases changed?
- What happens for empty, missing, invalid, duplicated, stale, concurrent, or unauthorized inputs?
- Does the change preserve backward compatibility where required?
- Are errors surfaced, logged, or handled at the right boundary?

### 3. System Fit

- Does the change use existing local patterns, helpers, types, schemas, services, and conventions?
- Is new abstraction justified by real complexity?
- Is duplicated logic better replaced by an existing module?
- Are boundaries between UI, API, persistence, auth, CLI, and background work preserved?

### 4. Security and Privacy

Check this pass whenever the change touches user data, private data, files, auth, sessions, roles, tokens, credentials, billing, webhooks, external APIs, uploads, downloads, logs, or admin flows.

- Is identity derived from trusted server context rather than user input?
- Are ownership and authorization enforced server-side?
- Could private data leak through public routes, logs, errors, generated files, or caches?
- Are secrets read by name only and never printed or committed?
- Do new external calls have safe inputs, timeouts, and failure handling?

### 5. Data and Migrations

Use when data shapes, persistence, schemas, migrations, serialization, or backfills changed.

- Is the migration deployable with the current app order?
- Is rollback or forward-only behavior understood?
- Are old rows, nulls, duplicate rows, and partially migrated states handled?
- Are constraints, indexes, defaults, and ownership fields correct?
- Does serialized data stay compatible with existing clients or stored records?

### 6. Tests and Verification

- Are tests added or updated for changed behavior?
- Would the tests fail on the bug they claim to cover?
- Are assertions meaningful rather than snapshots of implementation accidents?
- Is the right layer tested: unit, integration, end-to-end, CLI, browser, API, migration, or manual smoke?
- Did CI, lint, typecheck, coverage, or required checks get weakened?

Tests are code too. Do not accept complex or brittle tests just because they are not production code.

### 7. Operations and Release Risk

Use when the change can affect deploys, runtime behavior, support, observability, performance, or rollback.

- Are environment variables, flags, jobs, queues, caches, cron, or infrastructure touched?
- Are logs and errors useful without exposing sensitive data?
- Are smoke checks or runbooks needed?
- Could the change fail only in production scale, slow networks, old clients, or cold starts?

### 8. Documentation

If the change affects how users or developers build, test, configure, run, deploy, call, or operate the system, check that relevant docs changed too.

Do not demand docs for every internal cleanup. Do ask for docs when the change creates a new workflow, command, API contract, environment variable, migration step, or operational rule.

## Finding Bar

Only report a finding when it is:

- based on changed code or directly affected unchanged code
- concrete and reproducible from the available evidence
- likely to matter to users, developers, operators, security, data integrity, or maintainability
- specific enough to fix
- not merely a preference

Avoid speculative findings. If something is plausible but unproven, put it under "Questions" or "Residual Risk" instead of presenting it as a bug.

Before reporting, validate each candidate finding:

- Anchor it to changed code or directly affected unchanged code.
- Trace the trigger path far enough to show a realistic failure.
- Check nearby code, callers, helpers, tests, or docs to avoid false positives.
- Reject style preferences unless they violate a documented convention or clear local pattern and create maintenance risk.
- Deduplicate findings that share the same root cause, even if they appear in multiple files.

## Severity

- `P0`: release-blocking or production-breaking issue, severe data/security incident, or destructive failure
- `P1`: high-impact bug, security/privacy issue, data loss risk, broken core workflow, or deploy hazard that should be fixed before merge
- `P2`: real defect or maintainability risk that should be fixed soon but may not block urgent progress
- `P3`: minor issue, local cleanup, low-risk consistency problem, or optional improvement
- `Nit`: optional polish that should not block approval

## Output Format

If findings exist, list them first in descending severity.

Use this shape for each finding:

```text
P1 path/to/file.ts:42 - Short imperative title

Explain the concrete problem, the scenario where it fails, and why it matters. Keep it brief. Suggest the smallest safe fix when clear.
```

Then include:

- `Questions` only for blockers or uncertainty that changes the review outcome
- `Verification` listing checks actually run or evidence inspected
- `Residual risk` naming important untested or unseen surfaces
- `Summary` in 1-3 sentences

If there are no findings, say so directly:

```text
No findings.

Verification: ...
Residual risk: ...
```

Do not bury a real finding under a general summary. Do not open with praise. Do not include long code rewrites unless the user asked for fixes.

## Comment Style

- Be direct, calm, and specific.
- Prefer facts over preferences.
- Name the affected condition or user path.
- Keep each finding to one idea.
- Do not shame the author.
- Do not say something is "unsafe" without naming the concrete failure.
- Do not ask for perfect code when the current change improves the system and the remaining issue is optional.

## Examples

### Good Finding

`P1 apps/web/src/app/api/private/route.ts:42 - Derive the user from the session`

The route trusts `userId` from the request body when loading private records. Any authenticated user can send another user's ID and read their data. Derive the user ID from the server session and add a regression test for cross-user access.

### Good Agent-Generated Finding

`P1 .github/workflows/test.yml:31 - Keep tests blocking on pull requests`

The workflow now runs tests only on pushes to `main`, so pull requests can merge without the regression suite. This is a CI weakening pattern common in generated fixes. Restore the `pull_request` trigger or add an explicit justification for changing the merge gate.

### Not a Finding

The new helper name could be shorter, but it is clear, local style does not require a shorter name, and it does not create maintenance risk. Leave it out or mark it as a nit.
