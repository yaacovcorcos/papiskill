# Quality Review Plan

## Goal

Prove PapiSkill is production-ready before declaring the goal complete.

## Gates

### Code Quality

- TypeScript strict mode passes.
- ESLint passes.
- No giant route/page components for complex flows.
- Shared logic lives in packages or services.
- Server code owns authorization.

### Tests

- Unit tests for skill parsing, path safety, validation warnings, and install target resolution.
- Unit tests for CLI command helpers and API schema parsing.
- Route/API tests for public list/detail/download contracts, CLI response shapes, auth routes, and registry fallback behavior.
- Ownership and visibility tests for profile forks, private forks, and API tokens.
- Browser smoke for public browsing, skill detail/download, GitHub OAuth start, and editor flows when rendered UI behavior changes.
- `npm run check` must pass and include registry validation.

### Security

- GitHub OAuth only; no password surface in v1.
- API tokens hashed at rest.
- Private forks require owner session or valid token.
- Download APIs do not leak private files.
- Server-side validation before mutating skill/fork content.
- No secrets in repo.

### UX

- Public registry is clear without login.
- Core actions are visually obvious: install, download, fork, contribute.
- Editor has preview, validation, save, visibility, and download.
- Mobile and desktop are usable.
- No visible no-op controls.
- Public registry, skill detail, and docs pages pass `npm run a11y:public -- --base-url https://papiskill.com` before final release.
- Public registry and detail pages pass `npm run perf:public -- --base-url https://papiskill.com` before final release.

### CLI

- Public install works without auth.
- Authenticated install works for private forks.
- Custom install paths work.
- Agent target presets are explicit.
- CLI errors are actionable.
- `npm run cli:pack` dry-runs publishable `@papiskill/skill-core` and `papiskill` tarballs.

### Documentation

- README points to all important docs.
- Package spec is complete enough for third parties.
- Release runbook is complete enough for future deploys.
- Contributor guide explains PR and collaborator-publishing path for global skills.

### Release

- GitHub repo exists on personal account.
- CI is configured.
- Vercel config is present.
- Domain setup for `papiskill.com` is documented or applied.

## Final Completion Audit

Before marking the goal complete, inspect current state against every item in this plan and record evidence in `docs/reviews/final-production-readiness.md`.
