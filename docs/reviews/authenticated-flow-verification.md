# Authenticated flow verification

Date: 2026-06-17

## Current Result

Production authenticated browser verification is not complete.

Attempted flow:

1. Opened `https://papiskill.com/dashboard`.
2. Confirmed the page rendered the signed-out dashboard explanation.
3. Opened `https://papiskill.com/auth/github?callbackURL=%2Fdashboard`.
4. The flow reached GitHub login for the configured PapiSkill OAuth app and requested a GitHub username/password.

No credentials were entered and no GitHub authorization was approved in this automated pass.

## Evidence Gained

- The production dashboard route loads.
- The production GitHub OAuth start route redirects to GitHub with the expected PapiSkill client id.
- The remaining live browser verification requires an authenticated GitHub session or user-assisted login.

## Coverage Added Instead

Because live authentication stopped at credential entry, action-level tests were added for the core authenticated mutation paths:

- API token creation stores only token metadata/hash and returns the raw token once.
- API token revocation is scoped to the session user.
- Copying a visible skill into the library defaults to a private fork.
- Invalid library edits do not write fork changes.
- Valid library edits load forks by `id` and `ownerId`, persist package files, and revalidate profile/library paths.

These tests improve confidence in the server-side ownership and mutation boundaries, but they do not replace a signed-in browser pass.

## Still Required

Run this pass with a real signed-in GitHub session:

- sign in
- create or update profile
- copy `official/code-review` into a private library item
- edit `SKILL.md`
- save and confirm validation output
- publish to public profile
- download the public profile skill
- create a CLI token
- revoke the CLI token
