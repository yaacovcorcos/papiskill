# Database Architecture

## Topology

- Local development can use any Postgres instance through `DATABASE_URL`.
- Production uses Supabase Postgres.
- `DATABASE_URL` is runtime.
- `DIRECT_URL` is migration/direct connection.
- Prisma owns migrations.
- Better Auth owns identity tables.
- Supabase Auth is not used.

## Domain Map

| Domain | Tables |
|---|---|
| Auth | `User`, `Session`, `Account`, `Verification` |
| Profiles | `Profile` |
| Registry | `Skill`, `SkillVersion`, `SkillFile`, `SkillValidation` |
| User library | `SkillFork`, `SkillForkFile`, `SkillForkValidation` |
| Engagement | `SkillStar`, `SkillComment`, `DownloadEvent` |
| CLI | `ApiToken` |

## Invariants

- Globally published curated skills are indexed from Git, not authored directly in the database.
- Public user library skills may be indexed and shown in search.
- Private and unlisted library skills are visible only to the owning user or a valid owner API token.
- Unlisted library skills are reserved for future share-by-link behavior and must not be exposed through public routes until that access rule is explicitly implemented.
- `sourceSkillId`, `sourceForkId`, `sourceReference`, `sourceVersion`, and `sourcePackageHash` preserve source lineage for update checks and attribution.
- API tokens are stored hashed.
- Download and skill-detail routes must not expose private or unlisted skill metadata to other users.
- Skill IDs are lowercase slugs.
- Stars and comments target exactly one public registry skill or one public profile library skill.
- Comments are public when `VISIBLE`; deleted comments are retained as rows with `DELETED` status for audit continuity.

## Schema Change Rules

1. Update `apps/web/prisma/schema.prisma`.
2. Add a migration.
3. Update this document when table meaning, ownership, or invariants change.
4. Regenerate the Prisma client before typecheck or build:

```bash
npm run db:generate
npm run check
```

5. Before deploying code that depends on a new table, enum, column, index, or constraint, apply production migrations with the production direct database URL:

```bash
npm run db:status
npm run db:deploy
```

6. After migration, verify the production app route that uses the new schema and check Vercel runtime logs for fresh Prisma errors:

```bash
curl -sS https://papiskill.com/api/v1/health
vercel logs --environment production --level error --since 5m --no-branch
```
