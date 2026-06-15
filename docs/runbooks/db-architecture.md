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
| Forks | `SkillFork`, `SkillForkVersion`, `SkillForkFile` |
| Engagement | `SkillStar`, `DownloadEvent` |
| CLI | `ApiToken` |

## Invariants

- Globally published curated skills are indexed from Git, not authored directly in the database.
- Public user forks may be indexed and shown in search.
- Private forks are visible only to the owning user or a valid owner API token.
- API tokens are stored hashed.
- Download events must not expose private skill metadata to other users.
- Skill IDs are lowercase slugs.

## Schema Change Rules

1. Update `apps/web/prisma/schema.prisma`.
2. Add a migration.
3. Update this document when table meaning, ownership, or invariants change.
4. Run:

```bash
npm run db:generate
npm run typecheck
npm run test
```
