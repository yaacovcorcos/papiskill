# Security Baseline

## Trust Model

PapiSkill is a multi-user public registry. Authenticated users are not trusted operators.

Important non-boundaries:

- route names
- request origins
- visible profile handles
- skill IDs
- client-provided owner IDs
- public/private UI state

Server-side ownership checks are mandatory.

## Sensitive Surfaces

- private library skills
- API tokens
- GitHub OAuth account linkage
- skill downloads
- global registry contribution flow
- package validation and script warnings

## Requirements

- No secrets in source control.
- Production must fail fast if `BETTER_AUTH_SECRET` is missing.
- API tokens hashed at rest.
- Private and unlisted library access requires owner session or owner token.
- Mutations must derive user ID from server session.
- Successful downloads are recorded best-effort in `DownloadEvent` when the
  target exists in Postgres. Private/profile downloads are not cached; public
  registry downloads keep cache headers, so public download analytics are not a
  strict counter when served from CDN cache.
- Registry detail and download fallbacks must preserve the requested namespace. A missing `community/<slug>` skill must not fall back to `official/<slug>`, and profile-looking references must not fall back to registry entries by slug alone.
- Do not execute skill scripts in the web app.
- Display warnings for packages containing scripts or risky instructions.
- Global curated status can only come from collaborator-published registry source.
- Comment writes are authenticated and bounded by persisted server-side limits. Client UI checks are not the enforcement boundary.
- All routes send baseline browser hardening headers: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.

## Dependency Audit

CI runs `npm audit --audit-level=high` after install. High and critical advisories block the check workflow.

Moderate advisories are reviewed before release but are not a hard CI blocker while the only available npm fixes require an unsafe framework or ORM downgrade. As of June 16, 2026, the known moderate advisories are transitive issues in stable Next.js and Prisma packages; keep them on the release checklist until compatible patched stable releases are available.

## Report Quality Bar

Security findings should include:

- affected route or file
- auth requirement
- ownership check result
- exploitability
- smallest safe remediation
- verification command or test
