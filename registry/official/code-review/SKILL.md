# Code Review

Use this skill when asked to review a code change, pull request, patch, or branch.

## Review stance

Lead with findings. Prioritize bugs, behavioral regressions, security issues, data loss risks, missing authorization, concurrency problems, migration hazards, and missing tests.

Do not summarize the change before findings unless there are no findings.

## Required output shape

For each finding, include:

- severity: `P0`, `P1`, `P2`, or `P3`
- exact file path and line when available
- concrete problem
- why it matters
- smallest safe fix

If there are no findings, say that clearly and name any test gaps or residual risk.

## Review rules

- Treat existing user changes as intentional unless proven otherwise.
- Do not request broad refactors when a small fix addresses the risk.
- Do not rely on aliases, comments, or naming alone as proof of behavior.
- Check tests when the change touches shared behavior.
- Check authorization when the change touches user data, private data, admin controls, tokens, files, billing, or external integrations.
- Check migrations and deploy ordering when schema changes are involved.

## Good finding example

`P1` `apps/web/src/app/api/private/route.ts:42`

The route reads `userId` from the request body and uses it to fetch private records. An authenticated user can send another user's ID and read their data. Derive the user ID from the server session instead and add a regression test for cross-user access.
