# Registry Operations

This runbook covers curator-published and Git-reviewed skill packages.

## Source Of Truth

| Registry | Path | Visibility |
|---|---|---|
| Global curated skills | `registry/official/<skill-id>/` | Main public registry |
| Git-reviewed community skills | `registry/community/<skill-id>/` | Public registry when present |
| User library forks | Postgres `SkillFork` rows | Profile public, private, or unlisted |

Runtime user forks do not belong in `registry/official` or `registry/community`.

## Package Shape

Every registry package is a directory containing:

```text
skill.yml
SKILL.md
```

Optional package folders:

```text
scripts/
assets/
examples/
docs/
```

The package contract is documented in `docs/architecture/skill-package-spec.md`.

## Add Or Update A Curated Skill

1. Create or edit the package under `registry/official/<skill-id>/`.
2. Keep `skill.yml` metadata aligned with `SKILL.md`.
3. Use portable compatibility names such as `codex`, `claude-code`, `cursor`, and `generic-agent`.
4. Run registry validation:

```bash
npm run registry:validate
```

5. Regenerate the static web fallback registry:

```bash
npm run registry:generate
```

6. Run the full gate:

```bash
npm run check
```

7. Commit the package, generated registry file, tests, and docs together when they change.

## Index Registry Packages Into Postgres

The web app can serve file-backed registry data without a database, but production should index curated packages into Postgres so engagement counts, search metadata, and detail pages share one source.

Before indexing, make sure production or local database variables are set:

```bash
DATABASE_URL=...
DIRECT_URL=...
```

Then run:

```bash
npm --workspace @papiskill/web run registry:index
```

The indexer upserts official packages as `GLOBAL` and community packages as `COMMUNITY`.

## Contribution Flow

- Public detail pages show the package source path and GitHub links for official/community skills.
- Contributors propose registry changes through pull requests.
- Curated global publishing is a maintainer/collaborator decision. A skill can keep original author attribution while becoming globally discoverable.
- App-side profile publishing does not make a skill globally curated.

## Safety Rules

- Do not commit secrets, local `.env` files, API tokens, private user forks, or production logs into registry packages.
- Registry validation must run before merging package changes.
- Packages containing scripts or risky instructions must show warnings in validation surfaces before users install or publish.
- Preserve namespace behavior: `community/<slug>` must not silently fall back to `official/<slug>`.

## Production Release Checklist

After merging registry changes to `main`:

```bash
npm run check
vercel deploy --prod --yes
curl -sS https://papiskill.com/api/v1/health
```

If package metadata changed and production database indexing is required, run `registry:index` against the intended database and verify a detail route such as:

```bash
curl -sS https://papiskill.com/api/v1/skills/official/code-review
```

