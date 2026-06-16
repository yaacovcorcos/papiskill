# Auth Runbook

## Identity Model

PapiSkill uses Better Auth with GitHub OAuth.

Supabase Auth is intentionally not used.

## Required Environment

```bash
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DATABASE_URL=
DIRECT_URL=
```

Production `BETTER_AUTH_URL` should be:

```bash
https://papiskill.com
```

## GitHub OAuth App

Local callback:

```text
http://localhost:3000/api/auth/callback/github
```

Production callback:

```text
https://papiskill.com/api/auth/callback/github
```

Request email access. GitHub users may hide their public email; the app must handle missing email by using GitHub profile identity and provider account linkage.

## CLI Tokens

CLI tokens are app-owned tokens created from the authenticated dashboard.

Rules:

- show raw token only once
- store only hash and prefix
- allow revoke
- scope tokens to the owning user
- private library API routes accept tokens only for owner resources
