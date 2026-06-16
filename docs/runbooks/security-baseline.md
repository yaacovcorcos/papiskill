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
- API tokens hashed at rest.
- Private library access requires owner session or owner token.
- Mutations must derive user ID from server session.
- Do not execute skill scripts in the web app.
- Display warnings for packages containing scripts or risky instructions.
- Global curated status can only come from collaborator-published registry source.

## Report Quality Bar

Security findings should include:

- affected route or file
- auth requirement
- ownership check result
- exploitability
- smallest safe remediation
- verification command or test
