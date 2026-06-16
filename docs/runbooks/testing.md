# Testing Runbook

## Purpose

PapiSkill handles public registry content, private profile forks, authenticated CLI installs, and portable skill packages. Tests should prove those contracts directly and remain reproducible on a clean checkout.

## Default Local Gate

Run from the repository root:

```bash
npm run check
```

`npm run check` must include registry validation, typecheck, lint, tests, and build. CI should run the same gates, even if split into named steps for readability.

## Test Doctrine

- Test the risk that changed.
- Use the smallest layer that can prove the behavior truthfully.
- Prefer real local validation, serialization, permission, and install-target logic over mocks.
- Mock hard boundaries: GitHub OAuth, Better Auth network calls, Supabase/Vercel services, external HTTP, and temp filesystem roots.
- Bug fixes need regression tests. If a regression is not practical yet, document the reason in the PR.
- Reset `process.env`, current working directory, fake timers, temp directories, and module mocks when a test changes them.

## Required Coverage By Surface

| Surface | Minimum evidence |
|---|---|
| Skill package parsing and validation | Unit tests for required files, manifest schema, allowed paths, warnings, install targets, and registry validation |
| Registry packages | `npm run registry:validate`; tests for duplicate IDs/slugs and package contract changes when added |
| Web public API | Route tests for list/detail/download status codes, response shape, and CLI-compatible fields |
| Auth and profile ownership | Negative tests for unauthenticated users, wrong owners, revoked/expired tokens, and private fork access |
| Fallback behavior | Tests proving fallback serves global registry content only and never downgrades profile/private references into public official skills |
| CLI | Unit tests for install paths, downloads, auth token handling, and API schema parsing |
| Rendered critical flows | Browser smoke for `/skills`, skill detail/download, dashboard sign-in start, and editor when UI behavior changes |

## Package Artifact Rule

Package builds must exclude tests from `dist`. Vitest configs must also ignore `dist` so old compiled artifacts cannot create duplicate or stale test results.

## Release Evidence

For a release or production-facing PR, record:

- command output for `npm run check`
- any additional targeted test commands
- production smoke checks after deploy when deployment changed
- known untested risks, if any
