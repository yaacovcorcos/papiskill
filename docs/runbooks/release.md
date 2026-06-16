# Release Runbook

## Local Gate

Run from repo root:

```bash
npm install
npm run registry:generate
npm run check
```

## Database

Before any production deploy, check migration status:

```bash
npm run db:generate
npm run db:status
```

If the release includes Prisma migrations, apply them before `vercel --prod`:

```bash
npm run db:deploy
```

This command must run with the production direct database URL available through `DIRECT_URL` or `DATABASE_URL`. Vercel production deploys do not run Prisma migrations automatically.

If local env pull returns blank database values but Vercel runtime is connected, apply the checked-in SQL through the Supabase project `papiskill` and verify the migration appears in the Supabase migration list before deploying schema-dependent code.

## Vercel

Project: `papiskill`

Domain:

```text
papiskill.com
```

Required env vars:

```bash
DATABASE_URL
DIRECT_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

Deploy:

```bash
vercel --prod
```

## Post-Deploy Smoke

- `/` loads
- `/skills` loads
- `/skills?category=coding&compatibility=codex` renders filtered results on desktop and mobile
- GitHub login starts OAuth
- public API health route responds
- public skill API and public download routes return `CDN-Cache-Control: public, max-age=60, stale-while-revalidate=300`
- CLI can search public registry against production API
- `npm run perf:public -- --base-url https://papiskill.com` passes
- Vercel error logs show no fresh Prisma schema errors after loading changed routes:

```bash
vercel logs --environment production --level error --since 5m --no-branch
```
